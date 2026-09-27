-- =============================================================
-- 16_descobrir_pessoas.sql
-- Alimenta o "Encontrar mais pessoas" do card "Quem seguir".
--
-- O card antigo (perfil.js) pegava os 24 perfis mais novos, cortava
-- fora quem voce ja segue e mostrava 3, so com botao de Seguir.
-- Nao mostrava nem pedido de amizade, nem estado do relacionamento,
-- e a ordem "mais novos" nao ajuda ninguem a encontrar quem importa.
--
-- Esta funcao devolve a lista inteira, ja com o estado de cada
-- relacao (sigo / me segue / amizade) e um score de relevancia para
-- ordenar por quem tem mais a ver com voce.
--
-- Execute no Supabase SQL Editor. Idempotente: pode rodar de novo.
-- =============================================================

DROP FUNCTION IF EXISTS public.discover_people(INTEGER, INTEGER, TEXT);

CREATE OR REPLACE FUNCTION public.discover_people(
    p_limit  INTEGER DEFAULT 24,
    p_offset INTEGER DEFAULT 0,
    p_query  TEXT    DEFAULT NULL
)
RETURNS TABLE (
    id                  UUID,
    username            TEXT,
    full_name           TEXT,
    pronouns            TEXT,
    bio                 TEXT,
    avatar_url          TEXT,
    location            TEXT,
    is_verified         BOOLEAN,
    followers_count     INTEGER,
    following_count     INTEGER,
    posts_count         INTEGER,
    is_following        BOOLEAN,
    is_followed_by      BOOLEAN,
    friendship_status   TEXT,
    friendship_id       UUID,
    is_requester        BOOLEAN,
    mutual_count        INTEGER,
    shared_groups_count INTEGER,
    relevance           INTEGER,
    total_count         INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_me     UUID := auth.uid();
    v_limit  INTEGER := LEAST(GREATEST(COALESCE(p_limit, 24), 1), 60);
    v_offset INTEGER := GREATEST(COALESCE(p_offset, 0), 0);
    v_busca  TEXT    := NULLIF(BTRIM(COALESCE(p_query, '')), '');
BEGIN
    IF v_me IS NULL THEN
        RAISE EXCEPTION 'Faça login para encontrar pessoas.';
    END IF;

    RETURN QUERY
    WITH base AS (
        SELECT
            p.id,
            p.username,
            p.full_name,
            p.pronouns,
            p.bio,
            p.avatar_url,
            p.location,
            COALESCE(p.is_verified, false)  AS is_verified,
            COALESCE(p.followers_count, 0)  AS followers_count,
            COALESCE(p.following_count, 0)  AS following_count,
            COALESCE(p.posts_count, 0)      AS posts_count
        FROM public.profiles p
        WHERE p.id <> v_me
          AND COALESCE(p.is_active, true) = true
          AND p.deleted_at IS NULL
          AND (
                v_busca IS NULL
                OR p.username ILIKE '%' || v_busca || '%'
                OR COALESCE(p.full_name, '') ILIKE '%' || v_busca || '%'
              )
    ),
    -- quem eu sigo
    seguindo AS (
        SELECT f.followed_id AS id
        FROM public.follows f
        WHERE f.follower_id = v_me
    ),
    -- quem me segue
    seguidores AS (
        SELECT f.follower_id AS id
        FROM public.follows f
        WHERE f.followed_id = v_me
    ),
    amizade AS (
        SELECT
            CASE WHEN fr.requester_id = v_me THEN fr.receiver_id ELSE fr.requester_id END AS id,
            fr.status,
            fr.id AS friendship_id,
            (fr.requester_id = v_me) AS is_requester
        FROM public.friendships fr
        WHERE fr.requester_id = v_me OR fr.receiver_id = v_me
    ),
    meus_grupos AS (
        SELECT gm.group_id
        FROM public.group_members gm
        WHERE gm.user_id = v_me
    ),
    grupos_com_uns AS (
        SELECT gm.user_id, COUNT(*)::INTEGER AS qtd
        FROM public.group_members gm
        JOIN meus_grupos mg ON mg.group_id = gm.group_id
        WHERE gm.user_id <> v_me
        GROUP BY gm.user_id
    ),
    seguidores_em_comum AS (
        SELECT s.id, COUNT(*)::INTEGER AS qtd
        FROM seguidores s
        JOIN seguindo g ON g.id = s.id
        GROUP BY s.id
    )
    SELECT
        b.id,
        b.username,
        b.full_name,
        b.pronouns,
        b.bio,
        b.avatar_url,
        b.location,
        b.is_verified,
        b.followers_count,
        b.following_count,
        b.posts_count,
        (sg.id IS NOT NULL)                AS is_following,
        (sr.id IS NOT NULL)                AS is_followed_by,
        am.status                          AS friendship_status,
        am.friendship_id,
        COALESCE(am.is_requester, false)   AS is_requester,
        COALESCE(sc.qtd, 0)                AS mutual_count,
        COALESCE(gc.qtd, 0)                AS shared_groups_count,
        (
            -- quanto mais contexto em comum, mais para cima
              LEAST(COALESCE(gc.qtd, 0), 5) * 40
            + LEAST(COALESCE(sc.qtd, 0), 10) * 12
            + CASE WHEN sr.id IS NOT NULL THEN 25 ELSE 0 END
            + LEAST(COALESCE(b.posts_count, 0), 100) / 10
            -- gente com quem voce ja tem ligacao vai para o fim
            - CASE WHEN sg.id IS NOT NULL THEN 60 ELSE 0 END
            - CASE WHEN am.status = 'pending' THEN 40 ELSE 0 END
            - CASE WHEN am.status = 'accepted' THEN 200 ELSE 0 END
        )::INTEGER                        AS relevance,
        COUNT(*) OVER ()::INTEGER         AS total_count
    FROM base b
    LEFT JOIN seguindo   sg ON sg.id = b.id
    LEFT JOIN seguidores sr ON sr.id = b.id
    LEFT JOIN amizade    am ON am.id = b.id
    LEFT JOIN seguidores_em_comum sc ON sc.id = b.id
    LEFT JOIN grupos_com_uns     gc ON gc.id = b.id
    -- quem te bloqueou nao aparece na lista
    WHERE am.status IS DISTINCT FROM 'blocked'
    ORDER BY relevance DESC, b.username ASC
    LIMIT v_limit
    OFFSET v_offset;
END;
$$;

COMMENT ON FUNCTION public.discover_people(INTEGER, INTEGER, TEXT) IS
    'Lista pessoas da comunidade com o estado de seguir/amizade e um score de relevancia. Usada pelo card "Quem seguir" em perfil.js.';

-- -------------------------------------------------------------
-- Conferir: deve vir uma linha por pessoa, com total_count igual
-- ao total de pessoas disponiveis (hoje 5 no projeto de teste).
-- -------------------------------------------------------------
-- SELECT * FROM public.discover_people(10, 0, NULL);
