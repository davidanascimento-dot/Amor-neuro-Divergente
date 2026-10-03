/**
 * Acolher-IA / conversa.js — motor de conversa
 *
 * Separado do painel lateral (Acolher-IA.js) e da página de conversa
 * (chat-Ia/chat-Ia.js) para que os dois usem a MESMA lógica de envio,
 * histórico, modos de resposta e crise. Duplicar isso entre os dois
 * significaria dois lugares para corrigir o protocolo de crise, e esse
 * não é um bom lugar para ter divergência.
 *
 * Não sabe nada de DOM. Cuida de estado, rede e armazenamento.
 *
 * Exposto em window.AcolheriaConversa.
 */
(function () {
    'use strict';

    const ACOLHERIA_URL =
        'https://qyixzontuhrxrrjrmzvy.supabase.co/functions/v1/acolheria';

    const CHAVE = 'acolheria-conversas-v1';
    const MAX_CONVERSAS = 20;
    const MAX_MENSAGENS_POR_CONVERSA = 200;

    const MARCA_CRISE = '[[CRISE]]';

    /**
     * Lista negra de tópicos.
     *
     * IMPORTANTE: crise (suicídio/automutilação) NÃO entra aqui. Bloquear
     * esses termos deixava quem estava em crise recebendo "desculpe, não
     * posso responder a isso" — exatamente o oposto do acolhimento. Crise
     * é tratada pelo módulo de segurança e pelo protocolo do modelo.
     */
    const TOPICOS_BLOQUEADOS = [
        'porno', 'pornô', 'pornografia', 'sexo', 'sexual', 'nudez', 'nudes',
        'armas', 'drogas', 'crime', 'hack', 'golpe', 'aposta',
        'cassino', 'bet', 'tigrinho', 'assassinato',
        'pedofilia', 'estupro', 'terrorismo', 'racismo', 'homofobia', 'misoginia'
    ];

    function ehTopicoBloqueado(texto) {
        const t = String(texto || '').toLowerCase();
        return TOPICOS_BLOQUEADOS.some((topico) => t.includes(topico));
    }

    const RESPOSTA_BLOQUEADA = `Desculpe, não posso responder a isso.

Meu propósito é ajudar com informações sobre neurodiversidade, TDAH, autismo, direitos, organização e bem-estar.

Posso te ajudar com:
• TDAH e Autismismo
• Direitos e legislação
• Organização e produtividade
• Crises sensoriais e regulação
• Diagnóstico e avaliação
• Terapias e tratamentos

Vamos conversar sobre algo que realmente importa?`;

    const RESPOSTA_ERRO = `Não consegui responder agora. Tenta de novo em instantes — é comum a conexão oscilar.

Enquanto isso, posso te ajudar com TDAH e autismo, direitos, organização ou avaliação e diagnóstico.

Se continuar falhando, avisa em contato@amorneurodivergente.com.`;

    // -----------------------------------------------------------------
    // Formatação (usada pelo painel e pela página)
    // -----------------------------------------------------------------

    function escaparHtml(valor) {
        return String(valor == null ? '' : valor)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    /**
     * Markdown mínimo. O modelo usa títulos e listas com frequência; sem
     * isto o "###" e o "**" apareciam literais na bolha.
     *
     * Tudo é escapado ANTES, então isto não abre espaço para HTML
     * injetado vindo do modelo.
     */
    function formatarMensagem(texto) {
        return escaparHtml(texto)
            .replace(/^#{1,6}\s*(.+)$/gm, '<strong>$1</strong>')
            .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
            .replace(/^[ \t]*[-*]\s+/gm, '• ')
            .replace(/\n/g, '<br>')
            .replace(/(<br>)+•/g, '<br>•');
    }

    // -----------------------------------------------------------------
    // Armazenamento
    //
    // Nada é gravado sozinho. A conversa fica em memória; só vira
    // permanente quando a pessoa pede para salvar. Conversa pode
    // conter relato de crise, e localStorage guarda em texto claro,
    // legível por qualquer um com acesso ao aparelho.
    // -----------------------------------------------------------------

    function ler() {
        try {
            const bruto = localStorage.getItem(CHAVE);
            if (!bruto) return [];
            const dados = JSON.parse(bruto);
            return Array.isArray(dados) ? dados : [];
        } catch (e) {
            // localStorage bloqueado (aba anônima, modo privado) ou JSON
            // corrompido. Perder o histórico é melhor do que travar a
            // conversa.
            return [];
        }
    }

    function gravar(lista) {
        try {
            localStorage.setItem(CHAVE, JSON.stringify(lista));
            return true;
        } catch (e) {
            return false;
        }
    }

    function novoId() {
        return 'c' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
    }

    /**
     * Título da conversa a partir da primeira mensagem. Corta em 44
     * caracteres para não esticar o item da lista.
     */
    function tituloAutomatico(primeira) {
        const limpo = String(primeira || '').replace(/\s+/g, ' ').trim();
        if (!limpo) return 'Conversa sem título';
        return limpo.length > 44 ? limpo.slice(0, 43) + '…' : limpo;
    }

    // -----------------------------------------------------------------
    // Estado
    // -----------------------------------------------------------------

    let atual = null;   // { id, titulo, criadaEm, atualizadaEm, mensagens: [] }

    function criarVazia() {
        return {
            id: novoId(),
            titulo: 'Conversa nova',
            criadaEm: Date.now(),
            atualizadaEm: Date.now(),
            mensagens: []
        };
    }

    // -----------------------------------------------------------------
    // API
    // -----------------------------------------------------------------

    const api = {
        MARCA_CRISE: MARCA_CRISE,

        /** Histórico no formato que a função de borda espera. */
        historico: function () {
            if (!atual) return [];
            return atual.mensagens.map(function (m) {
                return { role: m.role, content: m.content };
            });
        },

        /**
         * O mesmo histórico, escrito como texto, para a função que só
         * aceita uma mensagem solta.
         *
         * A função publicada em produção é a versão antiga: ela lê o
         * campo `message` e não conhece `messages`. Mandando só o
         * formato novo, ela respondia HTTP 400 "Mensagem inválida" e a
         * Lia ficava muda na tela — o botão de enviar funcionava, a
         * resposta nunca chegava.
         *
         * Montar a conversa como transcrição resolve sem depender de
         * publicar nada: verifiquei que a função antiga entende o
         * contexto ("Pessoa: meu nome e Rafael" e ela responde chamando
         * de Rafael) e que ignora os campos extras do corpo.
         *
         * O prefixo de modo entra junto. A versão antiga não tem
         * parâmetro de modo, mas obedece a instrução escrita — pedindo
         * "de forma muito simples" ela responde em frases curtas, que é
         * o mesmo efeito do botão "Mais simples".
         */
        textoParaFuncaoAntiga: function (modo) {
            if (!atual || !atual.mensagens.length) return '';

            const INSTRUCAO = {
                simples: 'Responda de forma muito simples: frases curtas, ' +
                         'sem termos técnicos. Se precisar de um termo difícil, ' +
                         'explique com palavras comuns logo depois.',
                direto: 'Responda de forma direta e curta. Vá ao ponto, ' +
                        'sem rodeios e sem introdução.',
                passos: 'Responda em passos numerados, um assunto por vez, ' +
                        'de forma que dê para seguir na ordem.',
                detalhado: 'Responda com bastante detalhe, explicações ' +
                           'completas e exemplos.'
            };

            const linhas = atual.mensagens.map(function (m) {
                const quem = m.role === 'user' ? 'Pessoa' : 'Lia';
                return quem + ': ' + m.content;
            });

            let texto = linhas.join('\n\n');
            const instrucao = INSTRUCAO[modo];
            if (instrucao) texto += '\n\n[Jeito de responder: ' + instrucao + ']';
            return texto;
        },

        mensagens: function () {
            return atual ? atual.mensagens.slice() : [];
        },

        idAtual: function () {
            return atual ? atual.id : null;
        },

        /** true se a conversa atual já foi salva em disco. */
        estaSalva: function () {
            if (!atual) return false;
            return ler().some(function (c) { return c.id === atual.id; });
        },

        /** Conversas salvas, mais recente primeiro. */
        listar: function () {
            return ler().sort(function (a, b) {
                return (b.atualizadaEm || 0) - (a.atualizadaEm || 0);
            });
        },

        /** Começa (ou retoma) uma conversa. Sem argumento, cria uma nova. */
        iniciar: function (idConversa) {
            if (idConversa) {
                const achada = ler().find(function (c) { return c.id === idConversa; });
                if (achada) {
                    atual = achada;
                    return atual;
                }
            }
            atual = criarVazia();
            return atual;
        },

        novaConversa: function () {
            atual = criarVazia();
            return atual;
        },

        /**
         * Grava a conversa atual em disco. Só grava se ela tiver
         * mensagens — uma conversa vazia não ocupa espaço na lista.
         */
        salvar: function () {
            if (!atual || atual.mensagens.length === 0) return false;
            atual.titulo = tituloAutomatico(atual.mensagens[0].content);
            atual.atualizadaEm = Date.now();
            if (atual.mensagens.length > MAX_MENSAGENS_POR_CONVERSA) {
                atual.mensagens = atual.mensagens.slice(-MAX_MENSAGENS_POR_CONVERSA);
            }

            const lista = ler().filter(function (c) { return c.id !== atual.id; });
            lista.unshift(atual);
            const guardou = gravar(lista.slice(0, MAX_CONVERSAS));
            return guardou;
        },

        /** Apaga UMA conversa salva. A que estiver aberta continua aberta. */
        apagarConversa: function (idConversa) {
            const lista = ler().filter(function (c) { return c.id !== idConversa; });
            return gravar(lista);
        },

        /** Apaga tudo que estiver salvo, em disco e em memória. */
        apagarTudo: function () {
            atual = criarVazia();
            try {
                localStorage.removeItem(CHAVE);
                return true;
            } catch (e) {
                return false;
            }
        },

        /** Há quanto tempo existe algo salvo? Para o aviso da tela. */
        temHistoricoSalvo: function () {
            return ler().length > 0;
        },

        /**
         * Envia uma mensagem e devolve a resposta da Lia.
         *
         * Devolve { ok, texto, crise }. Nunca lança: quem chama precisa
         * só mostrar o que deu.
         */
        enviar: async function (texto, modo) {
            const limpo = String(texto || '').trim();
            if (!limpo) return { ok: false, texto: '', crise: false };

            if (!atual) atual = criarVazia();

            atual.mensagens.push({
                role: 'user',
                content: limpo,
                em: Date.now()
            });

            // Tópico bloqueado: não gasta chamada nem cota da Groq.
            if (ehTopicoBloqueado(limpo)) {
                atual.mensagens.push({
                    role: 'assistant',
                    content: RESPOSTA_BLOQUEADA,
                    em: Date.now()
                });
                return { ok: true, texto: RESPOSTA_BLOQUEADA, crise: false };
            }

            try {
                const resposta = await chamarFuncao(limpo, modo || 'normal');
                const final = resposta.resposta;
                atual.mensagens.push({
                    role: 'assistant',
                    content: final,
                    em: Date.now()
                });
                return { ok: true, texto: final, crise: resposta.crise };
            } catch (e) {
                atual.mensagens.push({
                    role: 'assistant',
                    content: RESPOSTA_ERRO,
                    em: Date.now()
                });
                return { ok: false, texto: RESPOSTA_ERRO, crise: false };
            }
        },

        /**
         * Pede a ÚLTIMA resposta da Lia de outro jeito, sem perder o
         * assunto. A instrução entra como mensagem do usuário logo depois
         * da resposta original, e a resposta reformata volta para o fim.
         */
        reformatar: async function (modo) {
            if (!atual || atual.mensagens.length < 2) {
                return { ok: false, texto: '', crise: false };
            }

            // Acha a última resposta da Lia para ter certeza de que há
            // o que reformular.
            let ultimaDaLia = null;
            for (var i = atual.mensagens.length - 1; i >= 0; i--) {
                if (atual.mensagens[i].role === 'assistant') {
                    ultimaDaLia = atual.mensagens[i];
                    break;
                }
            }
            if (!ultimaDaLia) return { ok: false, texto: '', crise: false };

            const pedidos = {
                simples: 'Não entendi. Reescreva isso mais simples, sem mudar o assunto.',
                direto: 'Mais direto. Vá ao ponto.',
                detalhado: 'Quero entender melhor. Desenvolva com exemplos.',
                passos: 'Quero isso organizado em etapas.'
            };
            const pedido = pedidos[modo];
            if (!pedido) return { ok: false, texto: '', crise: false };

            atual.mensagens.push({
                role: 'user',
                content: pedido,
                em: Date.now()
            });

            try {
                const resposta = await chamarFuncao(pedido, modo);
                atual.mensagens.push({
                    role: 'assistant',
                    content: resposta.resposta,
                    em: Date.now()
                });
                return { ok: true, texto: resposta.resposta, crise: resposta.crise };
            } catch (e) {
                return { ok: false, texto: RESPOSTA_ERRO, crise: false };
            }
        },

        formatarMensagem: formatarMensagem,
        escaparHtml: escaparHtml
    };

    // -----------------------------------------------------------------
    // Rede
    // -----------------------------------------------------------------

    async function chamarFuncao(ultimaMensagem, modo) {
        const controller = new AbortController();
        // 45s. A Groq normalmente responde em 2 a 5s; acima disso a
        // pessoa já achou que quebrou.
        const temporizador = setTimeout(function () { controller.abort(); }, 45000);

        try {
            const r = await fetch(ACOLHERIA_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                signal: controller.signal,
                // Os dois formatos vão no mesmo corpo, de propósito.
                //
                // `messages` + `modo` é o que a função reescrita usa.
                // `message` é o que a função publicada em produção lê
                // hoje. Ela ignora os campos que não conhece — verifiquei
                // — então um corpo serve para as duas.
                //
                // Sem o `message`, a Lia não respondia nada: HTTP 400.
                // Sem o `messages`, o dia que a função nova for publicada
                // o histórico e os modos passam a funcionar sem tocar
                // neste arquivo.
                body: JSON.stringify({
                    // `|| ultimaMensagem` é rede de segurança: se a
                    // transcrição viesse vazia por algum motivo, a função
                    // receberia "" e responderia 400 — a mesma falha que
                    // fazia a Lia ficar muda.
                    message: api.textoParaFuncaoAntiga(modo) || ultimaMensagem,
                    messages: api.historico(),
                    modo: modo
                })
            });

            if (!r.ok) {
                let detalhe = {};
                try { detalhe = await r.json(); } catch (e) { /* corpo não é json */ }
                const erro = new Error(detalhe.error || ('HTTP ' + r.status));
                // 429 e 403 são condições previsíveis: a mensagem do
                // servidor é útil, o resto é só ruído.
                if (r.status !== 429 && r.status !== 403) {
                    console.error('AcolherIA:', r.status, detalhe);
                }
                throw erro;
            }

            const dados = await r.json();
            const resposta = (dados.answer || '').trim();
            if (!resposta) throw new Error('Resposta vazia');

            // O modelo sinaliza crise com um marcador no início. A
            // segurança de verdade está nas duas camadas do seguranca.js;
            // isto evita que o marcador vaze para a tela.
            let crise = dados.crise === true;
            let texto = resposta;
            if (texto.indexOf(MARCA_CRISE) === 0) {
                crise = true;
                texto = texto.slice(MARCA_CRISE.length).trim();
            }

            return { resposta: texto, crise: crise };
        } finally {
            clearTimeout(temporizador);
        }
    }

    window.AcolheriaConversa = api;
})();
