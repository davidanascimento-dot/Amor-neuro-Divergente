# Relatório — Central Inteligente de Notificações da Lia

## Auditoria (etapa 1)

- Notificações anteriores: apenas `addInAppNotification` em memória, usado no fluxo de código de convite de grupo. Não havia tabela `notifications`.
- Tabelas existentes aproveitadas: `messages`, `conversations`, `conversation_participants`, `friendships`, `posts`, `likes`, `comments`, `articles`, `events`, `event_participants`, `groups`, `group_members`, `profiles`.
- Mensagens privadas usam RPC `send_message` sobre `messages`.
- Amizades usam `friendships` (requester/receiver, status).
- Eventos usam `events` + `event_participants`.
- Artigos usam `articles`.
- Grupos usam `groups` + `group_members`.
- Publicações/comentários usam `posts` + `comments` + `likes`.

## Integrações concluídas no front-end

- Carregamento de `public.notifications` com fallback silencioso se a migração não tiver sido aplicada.
- Badge de não lidas somando banco + notificações locais da sessão.
- Realtime por `user_id` para atualizar o painel sem recarregar.
- Filtros: Todas, Não lidas, Social, Conteúdos.
- Marcação individual e em massa, inclusive no banco.
- Links de abertura do conteúdo original.
- Lia contextual por categoria, com mensagens fixas.
- Avatar/ícone por categoria e layout responsivo preservado.

## Migração SQL

- Arquivo: `sql/30_central_notificacoes.sql`.
- Cria `public.notifications` com RLS por usuário.
- Cria `public.criar_notificacao` (SECURITY DEFINER), impedindo inserção direta pelo navegador.
- Triggers para mensagens, amizades, posts, comentários/respostas, curtidas, eventos e artigos.
- RPCs `recomendar_grupos` e `enviar_aviso_sistema`.
- Recomendações de grupos ocasionais (máximo 1/semana).
- Realtime habilitado para `notifications`.

## Pendências / integrações que exigem execução do SQL

- Rodar `sql/30_central_notificacoes.sql` no Supabase SQL Editor.
- Testar com dois usuários reais (mensagens, amizades, posts, comentários, curtidas, eventos, artigos).
- Confirmar RLS de `notifications` em produção.
- Opcional: criar tela administrativa para `enviar_aviso_sistema`.

## Observações de segurança

- Usuário consulta apenas as próprias notificações.
- Mensagens privadas não são expostas: somente o remetente e os participantes da conversa recebem notificação.
- Conteúdos privados de grupos só notificam membros.
- Deduplicação via `dedupe_key` por usuário.
- Sem criação de notificação pelo navegador em produção (triggers no banco).