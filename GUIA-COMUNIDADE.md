# Guia da Comunidade — Amor NeuroDivergente

> **Para que serve este documento:** é um manual de referência da área
> `/comunidade`. Serve para uma IA orientar quem está perdido dentro da
> comunidade: onde cada coisa fica, o que cada botão faz, e o que
> responder quando a pessoa diz "não achei onde…".
>
> **Regra de ouro do guia:** se a pessoa não encontrou, **pergunte antes de
> supor**. Boa parte das dúvidas aqui é "não vi o botão", e quase sempre
> o botão está em outra aba.

---

## 1. O que é a Comunidade

A Comunidade é um espaço dentro do site, com identidade visual própria
(fundo verde-claro com moldura decorativa, navegação própria). Tem
**quatro áreas**:

| Área | Para quê |
|---|---|
| **Fórum** | Publicar, responder, curtir e salvar publicações |
| **Grupos** | Comunidades por interesse/tema, públicas ou privadas |
| **Eventos** | Encontros com data e horário |
| **Conversas** | Mensagens privadas e conversas de grupo |

Fora da comunidade, o site tem Rights (o orientador de direitos),
Explorar, Blog, Recursos, AcolherIA e Apoiar. **Comunidade é só a área
social** — Rights é outra coisa.

---

## 2. Antes de tudo: entrar

- A maior parte das funções (postar, comentar, Curtir, mensagem, criar
  grupo, entrar em evento) **exige login**.
- Sem sessão, o botão de perfil e de notificação ficam ocultos e as
  ações mostram aviso para entrar em `/login/login.html`.
- **Explorar grupos, grupos públicos, Eventos e conteúdo do fórum são
  visíveis sem login.** O que falha é a ação, não a leitura.

**Se a pessoa diz "não consigo postar"**: pergunte se está com a conta
entrada. Esse é o primeiro motivo.

---

## 3. Mapa das telas

| Tela | Caminho |
|---|---|
| Comunidade (Fórum + abas Grupos/Eventos/Conversa) | `/comunidade/comunidade.html` |
| Explorar grupos | `/comunidade/explorar-grupos.html` |
| Meus grupos | `/comunidade/meus-grupos.html` |
| Detalhe de um grupo | `/comunidade/grupo.html?id=…` |
| Central de conversas | `/comunidade/conversas.html` |
| Chat de um canal | `/comunidade/chat.html?id=…` |
| Detalhe de canal | `/comunidade/detalhes-canal.html?id=…` |
| Meu perfil | `/comunidade/perfil.html` |
| Publicação completa | `/comunidade/post.html?id=…` |
| Administração de eventos | `/configurações/eventos/eventos.html` |

**Armadilha comum:** Grupos e Conversas abrem em **páginas separadas**,
não dentro do `/comunidade/comunidade.html`. A aba fica lá como atalho.

---

## 4. A casca (presente em todas as telas)

### 4.1 Cabeçalho — a faixa de cima

| Elemento | O que faz |
|---|---|
| **Logo** (canto superior esquerdo) | Vai para a **home do site** (`/inicio.html`) |
| **Selo "COMUNIDADE"** | Identificação. Não é botão — mostra que a pessoa está na comunidade |
| **← Voltar ao site** | Nas telas de topo vai para a home. **Nas telas de detalhe** volta para a lista da área (ver seção 12) |
| **Sino** (só no Fórum) | Notificações. Badge vermelho quando há alguma |
| **Foto de perfil** | Abre `/comunidade/perfil.html` |
| **Lua / Sol** | Alterna modo escuro |

O botão de perfil e o sino **somem para quem não está logado**.

### 4.2 Subnav — a segunda faixa

Sempre a mesma, na mesma ordem, em todas as telas:

**Fórum · Grupos · Eventos · Conversa**

A aba ativa fica **sublinhada em roxo**. Serve para a pessoa saber onde
está sem precisar ler.

- **Fórum** e **Eventos** são abas dentro do `/comunidade/comunidade.html`.
- **Grupos** e **Conversa** levam para páginas próprias.

> **Dica de orientação:** se a pessoa diz "não achei os grupos", ela está
> na aba errada — ou no rodapé. Groups fica na subnav, sempre na
> segunda posição.

---

## 5. Fórum

### 5.1 O banner de boas-vindas

Aparece **só na aba Fórum**, no topo, e some quando a pessoa troca de
aba.

| Botão | O que faz |
|---|---|
| **Conhecer a comunidade** | Abre um painel com as **quatro áreas** (Fórum, Grupos, Eventos, Conversa). Clicar em qualquer uma leva à área correspondente |
| **Ver regras** | Abre o modal de regras da comunidade (seção 11) |
| **✕** (canto) | Dispensar o banner. Ele não volta nesta sessão. **O botão "Ver regras" da faixa de regras continua disponível logo abaixo** |

### 5.2 Publicar

| Botão | O que faz |
|---|---|
| **Novo Post** (canto superior direito) | Abre o modal de publicação |
| **Caixa rápida** ("O que você está pensando?") | Digita ali e clica **Postar** — publica direto, sem abrir modal |

**O modal de publicação** tem:

- Campo de texto
- Botão de **visibilidade** ("Qualquer pessoa pode responder")
- Barra inferior: **Mídia** (imagem), **GIF**, **Enquete**, **Emoji**
- **Postar** para confirmar

> ### ⚠️ O que funciona de verdade na barra de ferramentas
>
> Verificado no código — não confie na aparência dos botões:
>
> | Botão | Funciona? |
> |---|---|
> | **Mídia** | **Sim** — abre o seletor de arquivo |
> | **GIF** | **Não.** O GIF aparece no rótulo porque é um formato aceito pelo seletor de mídia, não porque exista um botão de GIF |
> | **Emoji** | **Não** |
> | **Enquete** | **Não** |
> | **Visibilidade** | **Não** — todas as publicações ficam públicas |
> | **Mídia**, no modal de **Resposta** | **Não** |
>
> **Se a pessoa clicar e nada acontecer, não é falha do navegador nem
> erro do sistema.** É função ainda não implementada. Diga isso com
> clareza, em vez de mandar a pessoa recarregar ou "tentar de novo".

### 5.3 Uma publicação no feed

Cada card tem, embaixo:

| Item | O que faz |
|---|---|
| **Curtir** | Marca curtida. O contador e o ícone mudam |
| **Contador de comentários** | Abre a publicação completa já na seção de comentários |
| **Repassar** | **Desabilitado — "Recurso em breve"**. Não tente fazer funcionar |
| **Compartilhar** | Copia o link da publicação |
| **Abrir publicação completa** | Vai para `/comunidade/post.html?id=…` |

**O menu de três pontinhos** (canto superior direito do card):

| Item | Quem vê |
|---|---|
| Copiar link | todo mundo |
| Compartilhar | todo mundo |
| Salvar | todo mundo |
| Reportar | todo mundo |
| Editar | **só o autor** |
| Excluir | **só o autor** (marcado em vermelho) |

### 5.4 Abrir uma publicação (`post.html`)

Além do curtir e do compartilhar, a página completa tem:

- Campo para escrever comentário + **Comentar**
- **Ordenar comentários** (mais relevantes, recentes…)
- **Buscar nos comentários**
- **Responder** a um comentário específico (inline)
- **Cancelar resposta**
- Galeria de mídia e botão "Abrir link da publicação"

### 5.5 Other forum behaviors

- **Rolagem infinita**: o feed carrega mais ao chegar ao fim.
- **Reações**: aparecem nos posts depois que carregam.

---

## 6. Grupos

### 6.1 Pela aba Grupos dentro da comunidade

Quatro botões no topo:

| Botão | Leva para |
|---|---|
| **Meus grupos** | `/comunidade/meus-grupos.html` |
| **Explorar comunidades** | `/comunidade/explorar-grupos.html` |
| **Usar código** | Abre o modal para digitar um código de convite |
| **Criar Grupo** | Abre o formulário de criação |

### 6.2 Explorar grupos

- **Filtro por categoria**: Todos, Educação, Autismo, TDAH,
  Ansiedade, Relacionamentos, Hobbies, Arte, Ciência, Direitos…
- **Busca por nome**
- **"Carregar mais"** no rodapé da lista

**Botões de cada card:**

| Botão | Condição |
|---|---|
| **Visitar** | grupo em que a pessoa já entrou |
| **Unir-se** | grupo público, ainda não entrou |
| **Convite necessário** | grupo privado — mostra em vez de botão |
| ícone de **balão** | Abre a conversa do grupo |
| ícone de **chave** | Mostra o código de convite (só para quem administra) |
| **editar** | só para quem é dono/administrador |

### 6.3 Meus grupos

Biblioteca com os grupos que a pessoa entrou, e os que administra.
Permite **editar**, **sair** e **excluir** (excluir pede confirmação
digitada).

### 6.4 Detalhe de um grupo

- Banner, avatar, nome, descrição
- Botões de ação conforme o cargo: **sair**, **entrar**, **editar**,
  **convidar**
- **Código de convite**: gera, copia e regenera. Vale **7 dias**
  (quando o código expira aparece o aviso).

### 6.5 Criar grupo

Nome, descrição (até 200 caracteres), categoria, imagem e a opção de
**comunidade privada** (privada não aparece na busca pública e exige
convite).

---

## 7. Eventos

- A aba Eventos fica dentro do `/comunidade/comunidade.html`.
- Quem tem permissão vê **"Administrar eventos"**, que vai para
  `/configurações/eventos/eventos.html`.
- **Os eventos são cadastrados pela equipe, no painel administrativo.**
  Se a pessoa perguntar como criar um evento, a resposta é: não é por
  ela — é pela equipe.

**Estados do card e o que aparece:**

| Estado | O que a pessoa vê |
|---|---|
| **Futuro** | Botão **Participar** e, depois, **Confirmado** |
| **Já passou** (data vencida) | Selo **Encerrado**, sem botão nenhum |

Depois de confirmar, aparece **"Entrar"** com o link do evento, que abre
em nova aba.

> **Pergunta frequente:** "por que o botão sumiu?" — porque a data já
> passou. Encerrado é o estado normal de um evento antigo, não é erro.

---

## 8. Conversas

Esta é a área com mais telas.

### 8.1 Central de conversas (`/comunidade/conversas.html`)

**Na lista lateral (esquerda):**

| Controle | O que faz |
|---|---|
| **+** (roxo, no topo) | Criar nova conversa |
| **«** | Recolhe a lista, dando mais espaço para o chat |
| **# Canais** | Conversas de grupo |
| **Amigos** | Conversas privadas com amigos |
| **Buscar conversa** | Filtra por nome |

O item selecionado fica com **fundo lilás e borda roxa**.

### 8.2 Chat aberto

**Cabeçalho:** foto, nome, e o subtipo ("Conversa privada").

**Botões do canto superior direito:**
- **i** (informações) — detalhes da conversa
- **⋮** (menu) — ações da conversa

**O que dá para fazer pelo menu:**

| Ação | Quando aparece |
|---|---|
| **Abrir perfil** | conversa privada |
| **Dados do grupo** | conversa de grupo |
| **Editar grupo** | só quem administra |
| **Adicionar membro** | conversa de grupo |
| **Copiar código** | conversa com código |

**Área de escrita:**

| Controle | O que faz |
|---|---|
| **Campo** | Escreve a mensagem |
| **📎** | Anexar arquivo |
| **🎬** | Enviar vídeo |
| **🎤** | Gravar áudio |
| **➤** (roxo) | Enviar |

**Mensagens:**
- As do usuário vão à direita; as de outras pessoas, à esquerda.
- **Apagar**: clique longo (ou botão) na mensagem — aparece uma
  confirmação **"Esta mensagem some para todo mundo. Não dá para
  desfazer."**
- O histórico **permanece ao atualizar a página**.
- **Solicitações de amizade** aparecem num bloco separado no topo da
  lista, com Aceitar / Recusar.

### 8.3 Adicionar alguém

- Busca por nome no topo da aba **Conversa** dentro do fórum, ou pela
  lista de amigos.
- Clique em **Conversar** → a conversa é criada.
- Um botão **+** adiciona o amigo a um grupo.

### 8.4 Canais e grupos de chat

- `detalhes-canal.html` mostra as regras do canal.
- `chat.html` é o chat completo do canal.

---

## 9. Perfil

`/comunidade/perfil.html` — o próprio perfil ou o de outra pessoa.

**Abas internas:**

| Aba | Conteúdo |
|---|---|
| **Publicações** | o que a pessoa publicou |
| **Respostas** | o que ela respondeu |
| **Mídia** | imagens e vídeos |
| **Curtidas** | o que ela curtiu |
| **Salvos** | o que ela salvou |

**Outros controles:**
- **Compartilhar** — copia o link do perfil
- **Editar perfil** — só no próprio perfil
- **Adicionar amigo / Solicitação** — no perfil de outra pessoa
- **Perfis sugeridos** — com busca e "ver mais"

**Ao editar:** dá para trocar avatar, banner, nome, bio, localização,
idioma e escolher entre **5 molduras** de avatar (sem moldura, dourada,
roxa, neon, arco-íris).

---

## 10. Regras da comunidade

O modal (pelo botão **Ver regras**) tem **7 regras**:

1. **Respeite as pessoas**
2. **Não pratique bullying**
3. **Não exponha informações pessoais**
4. **Não assedie outros usuários**
5. **Ajude a manter um ambiente acolhedor**
6. **Conteúdo apropriado** — adequado para todas as idades
7. **Mantenha o foco** — discussões sobre neurodiversidade

**As regras ficam sempre acessíveis** — mesmo com o banner dispensado,
pela faixa de regras que aparece abaixo da caixa de publicação.

---

## 11. Ajuda, acessibilidade e IA

### 11.1 O hub flutuante (canto inferior direito)

Um botão redondo que abre um menu com dois blocos:

**Acessibilidade**

| Controle | O que faz |
|---|---|
| **Escuro** | Alterna modo escuro (o mesmo da lua no cabeçalho) |
| **A+** | Aumentar o texto |
| **A−** | Diminuir o texto |
| **Dislexia** | Troca para fonte de alta legibilidade |
| **Movimento** | Reduz animações |
| **Reset** | Volta tudo ao padrão |

**Ajuda**

| Controle | Leva para |
|---|---|
| **AcolherIA** | `/chat-Ia/chat-Ia.html` — assistente |
| **Comunidade** | a própria comunidade |
| **FAQ** | perguntas frequentes |
| **E-mail** | abre o cliente de e-mail |
| **WhatsApp** | contato no WhatsApp |

### 11.2 AcolherIA (mini chat dentro da comunidade)

Ícone de robô no canto. Abre um chat pequeno com **6 atalhos**:
TDAH, Autismo, Organização, Crise sensorial, Direitos, Desabafar.

### 11.3 VLibras e UserWay

- **VLibras**: botão flutuante na tela, traduce em Libras.
- **UserWay**: widget de acessibilidade injetado pelo navegador.

---

## 12. Para onde o "Voltar" leva

| Tela | Volta para |
|---|---|
| Fórum, Explorar grupos, Conversas | **Home do site** |
| Meus grupos, Detalhe de grupo | Lista de grupos |
| Chat, Detalhe de canal | Lista de conversas |
| Perfil, Publicação | **Fórum** |

Se a pessoa reclamou que o voltar "não volta para onde eu estava",
esta tabela explica o porquê.

---

## 13. Como usar este guia para orientar

### Se a pessoa diz…

| Frase | O que fazer |
|---|---|
| "não achei os grupos" | Grupos é a **segunda aba** da subnav |
| "não achei as conversas" | Conversa é a **quarta aba**. Abre página própria |
| "não consigo postar" | Perguntar se está **logado** |
| "cliquei em eventos e nada aconteceu" | Eventos pode estar **encerrado**; ou a pessoa não tem permissão para **criar** evento — isso é da equipe |
| "o botão sumiu do evento" | Data já passou |
| "repassar" não funciona | Está **desabilitado de propósito** |
| "como apago uma mensagem" | **Clique longo** na mensagem |
| "sumiu a lista de conversas" | Botão **«** no topo da lista |
| "não tem som" | usar as **legendas**; o vídeo foi feito pensando em quem não ouve |
| "não consigo entrar num grupo" | É privado: precisa de **código de convite** |
| "meu texto está pequeno/grande" | Hub flutuante → **A+ / A−** |
| "não achei as regras" | Faixa de regras logo abaixo da caixa de publicação |

### Princípios ao responder

1. **Pergunte antes de supor.** "Não achei o botão" tem cinco causas
   possíveis.
2. **Não prometa função que não existe.** Repassar, GIF, Emoji, Enquete
   e visibilidade estão na tela mas **não funcionam** (seção 14). Dizer
   isso é melhor do que mandar a pessoa tentar de novo.
3. **Não peça dados pessoais.** Senha, diagnóstico, CPF ou laudo
   **nunca** são pedidos pela comunidade — esse é um diferencial do
   projeto.
4. **Encaminhe, não improvise.** Questão de **direito** vai para a área
   Rights, não para a Comunidade.

---

## 14. O que **não** existe na comunidade

Verificado no código. Não prometa nada desta lista:

| Não existe | Detalhe |
|---|---|
| **Mensagens fixadas** | Não há como fixar publicação no fórum |
| **Repassar** | Botão existe, mas está desabilitado de propósito |
| **GIF, Emoji, Enquete** | Botões existem na barra, sem ação |
| **Visibilidade da publicação** | Botão existe, sem ação — tudo é público |
| **Criar evento** | Só a equipe, no painel administrativo |
| **Editar/apagar mensagem de outra pessoa** | Só a própria |
| **Excluir sem confirmação** | Excluir grupo e apagar mensagem exigem confirmação |
| **Criar conta aqui** | O cadastro é no site, fora da comunidade |

### Diante de um botão que não funciona

A regra é: **ser claro, não suggestivo.** Dizer "esse botão ainda não
está funcionando" é melhor do que "você pode ter encontrado um
problema, tente recarregar". A pessoa perde tempo testando coisa que
não vai mudar.

---

## 15. Resumo das regras da comunidade

1. Respeite as pessoas
2. Não pratique bullying
3. Não exponha informações pessoais
4. Não assedie outros usuários
5. Ajude a manter um ambiente acolhedor
6. Conteúdo apropriado para todas as idades
7. Mantenha o foco na discussão

---

**Atualizado em:** 2026-10-16
**Área:** `/comunidade` — 9 telas