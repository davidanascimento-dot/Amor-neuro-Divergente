-- =============================================
-- 07_create_follows.sql
-- Relação de seguindo usada pelo card "Quem seguir"
-- Execute no Supabase SQL Editor
-- =============================================

CREATE TABLE IF NOT EXISTS public.follows (
    follower_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    followed_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    PRIMARY KEY (follower_id, followed_id),
    CONSTRAINT no_self_follow CHECK (follower_id <> followed_id)
);

CREATE INDEX IF NOT EXISTS idx_follows_followed
    ON public.follows(followed_id);

ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own following" ON public.follows;
CREATE POLICY "Users can view own following"
    ON public.follows FOR SELECT
    TO authenticated
    USING (follower_id = auth.uid());

DROP POLICY IF EXISTS "Users can follow people" ON public.follows;
CREATE POLICY "Users can follow people"
    ON public.follows FOR INSERT
    TO authenticated
    WITH CHECK (follower_id = auth.uid());

DROP POLICY IF EXISTS "Users can unfollow people" ON public.follows;
CREATE POLICY "Users can unfollow people"
    ON public.follows FOR DELETE
    TO authenticated
    USING (follower_id = auth.uid());

GRANT SELECT, INSERT, DELETE ON public.follows TO authenticated;

-- Mantém os contadores denormalizados de perfis sincronizados.
CREATE OR REPLACE FUNCTION public.sync_follow_counts()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_follower_id UUID;
    v_followed_id UUID;
BEGIN
    IF TG_OP = 'INSERT' THEN
        v_follower_id := NEW.follower_id;
        v_followed_id := NEW.followed_id;
    ELSE
        v_follower_id := OLD.follower_id;
        v_followed_id := OLD.followed_id;
    END IF;

    UPDATE public.profiles AS profile
    SET
        following_count = (
            SELECT COUNT(*)::INTEGER
            FROM public.follows
            WHERE follower_id = v_follower_id
        ),
        followers_count = (
            SELECT COUNT(*)::INTEGER
            FROM public.follows
            WHERE followed_id = v_followed_id
        )
    WHERE profile.id IN (v_follower_id, v_followed_id);

    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS follows_sync_counts ON public.follows;
CREATE TRIGGER follows_sync_counts
    AFTER INSERT OR DELETE ON public.follows
    FOR EACH ROW
    EXECUTE FUNCTION public.sync_follow_counts();

-- Backfill inicial para alinhar os contadores já existentes.
UPDATE public.profiles AS profile
SET
    following_count = (
        SELECT COUNT(*)::INTEGER
        FROM public.follows
        WHERE follower_id = profile.id
    ),
    followers_count = (
        SELECT COUNT(*)::INTEGER
        FROM public.follows
        WHERE followed_id = profile.id
    )
WHERE EXISTS (
    SELECT 1
    FROM public.follows
    WHERE follower_id = profile.id OR followed_id = profile.id
);
