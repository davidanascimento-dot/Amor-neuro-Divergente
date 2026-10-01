/**
 * Acolher-IA/seguranca.js
 * ---------------------------------------------------------------------------
 * Deteccao de crise + Painel de Apoio Imediato da AcolherIA.
 *
 * Decisao de arquitetura: a deteccao primaria e DETERMINISTICA e roda no
 * cliente (0 ms, sem rede, sem cota, funciona offline). Isso e proposital:
 * no momento de crise nao podemos depender de uma chamada extra de LLM --
 * mais latencia e mais um ponto de falha exatamente onde eles doem mais.
 *
 * O backend (Groq via Supabase Edge Function) e a segunda camada: o modelo
 * ja e chamado de qualquer forma, entao pedimos que ele marque a resposta
 * quando detectar risco que as palavras-chave deixaram passar.
 *
 * IMPORTANTE: esta ferramenta e um apoio. Ela nao substitui atendimento
 * humano. Em risco iminente, o caminho e sempre ligar para o CVV (188).
 */
(function () {
    'use strict';

    if (window.AcolheriaSeguranca) return;

    // ========================================================================
    // 1. NORMALIZACAO
    // ========================================================================
    //
    // Todo o texto passa por aqui antes de casar com as expressoes.
    // E o que permite que "suicidio" (sem acento, como o teclado do celular
    // costuma digitar) case com a mesma regra que "suicidio" acentuado.

    const ABREVIACOES = [
        [/\bqro\b/g, 'quero'],
        [/\bqdo\b/g, 'quando'],
        [/\btbm\b/g, 'tambem'],
        [/\bpq\b/g, 'porque'],
        [/\bmsm\b/g, 'mesmo'],
        [/\bhj\b/g, 'hoje'],
        [/\bagr\b/g, 'agora'],
        [/\bn\s+to\b/g, 'nao to'],
        [/\bto\b/g, 'estou'],
        [/\btou\b/g, 'estou'],
        [/\bta\b/g, 'esta'],
        [/\btoa\b/g, 'esta'],
        [/\bvc\b/g, 'voce'],
        [/\bnn\b/g, 'nao'],
        [/\bdesapareser\b/g, 'desaparecer']
    ];

    function normalizar(texto) {
        let t = String(texto || '')
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/(\p{L})\1{2,}/gu, '$1$1')   // "matarrrr" -> "matarr"
            .replace(/[^\p{L}\p{N}\s?]/gu, ' ')
            .replace(/\s+/g, ' ')
            .trim();

        for (const par of ABREVIACOES) {
            t = t.replace(par[0], par[1]);
        }
        return t;
    }

    // ========================================================================
    // 2. DETECCAO
    // ========================================================================
    //
    // Todas as expressoes sao escritas SEM acento de proposito: o texto ja vem
    // normalizado, entao "nao" e "nao" sao a mesma coisa para o regex.

    // Nenhum contexto benigno justifica estes termos. Disparam sempre.
    const CRISE_INEGOCIAVEL = [
        /suicid/,
        /automutil\w*/,
        /tirar (?:a )?minha vida/,
        /acabar (?:com )?(?:a )?minha vida/,
        /acabar com tudo/,
        /nao quero mais viver/,
        /desaparecer para sempre/,
        /sumir para sempre/,
        /sumir de vez/,
        /nao aguento mais (?:viver|isso tudo)/,
        /sem motivo para viver/
    ];

    // Idealizacao passiva: as pessoas testam a ideia antes de dizer a morte.
    // Nao tem palavra-chave obvious. Era a maior lacuna da v1: 0 de 7
    // frases classicas passavam reto.
    const CRISE_PASSIVO = [
        /queria (?:nao ter )?nascid/,
        /preferia (?:nao ter )?nascid/,
        /nao ter nascid/,
        /nao acord\w+/,
        /dormir e nao acordar/,
        /queria (?:apenas |so )?dormir/,
        /nao vai? mais importar/,
        /daqui a pouco nao/,
        /ja nao importa/,
        /nada importa mais/,
        /mundo (?:estaria |ficaria )?melhor/,
        /ninguem (?:sentiria|ia sentir|se importa|perceberia|notaria)/,
        /ninguem (?:percebe|nota|se importa)/,
        /seria melhor se eu nao (?:estivesse|existisse|fosse)/,
        /se eu nao existisse/,
        /se eu sumisse/,
        /e se eu sumisse/,
        /seria um (?:peso|problema)/,
        /peso pros outros/,
        /todo mundo seria (?:feliz|melhor)/,
        /nao quero mais estar aqui/,
        /nao vale a pena (?:estar aqui|viver)/,
        /espero que (?:acabe|termine) (?:logo|em breve)/,
        /nao tenho mais forca pra (?:isso|isso tudo|viver)/,
        /queria ter parado antes/,
        /deixaria de ser (?:um problema|um peso)/,
        /problema se eu nao/
    ];

    // Sinais fortes que tambem existem em linguagem do dia a dia.
    // So sao suprimidos por expressoes idiomaticas estreitas.
    const CRISE_DIRETO = [
        /cansad[oa]s? de viver/,
        /cansei de viver/,
        /queria estar mort/,
        /estou morrendo por dentro/,
        /me sinto mort/,
        /me acho mort/,
        /quero morrer/,
        /nao quero morrer/,
        /me matar\w*/,
        /matar-me/,
        /me mato\b/,
        /matarem\b/,
        /me machuc\w*/,
        /me cort(?:o|ar)\b/,
        /me rasg(?:o|ar)\b/,
        /me queim(?:o|ar)\b/,
        /me fer(?:i|ir)\b/,
        /me dano\b/,
        /me destruir\b/
    ];

    // Sinais indiretos: um sozinho precisa de sofrimento junto.
    const CRISE_INDIRETO = [
        /nao aguento mais/,
        /ninguem ia sentir (?:falta|saudade)/,
        /melhor (?:para mim )?sem mim/,
        /estariam melhores? sem mim/,
        /todo mundo (?:estaria )?melhor sem mim/,
        /desespero/,
        /sem esperanca/,
        /nao tenho forca/,
        /sem forca nenhuma/,
        /nao consigo mais/,
        /nao tenho motivo para acordar/,
        /queria sumir/,
        /quero sumir/,
        /sumisse/,
        /nao tenho pra onde ir/,
        /nao tem mais nada/,
        /nada mais faz sentido/,
        /faz tempo que nao sorrio/,
        /desisti de tudo/
    ];

    // Contexto emocional. Conta quantos aparecem: e o que fecha o
    // sinal indireto e o que se acumula entre turnos.
    //
    // Cuidado: nao repetir o mesmo marcador por formas diferentes. "to mal"
    // casando com "mal" fazia uma frase banal contar como dois sinais, e o
    // painel acabava abrindo em "to mal hoje" + "to cansada", que e conversa
    // comum. Cada linha aqui representa uma categoria distinta.
    const CRISE_SOFRIMENTO = [
        /sozinh[oa]s?\b/,
        /ninguem/,
        /sofrendo|sofrer|sofrida/,
        /chorando|chorei/,
        /triste/,
        /vazi[oa]s?\b/,
        /\bdor\b/,
        /cansad[oa]\b/,
        /desesperad[oa]|desespero/,
        /perd[oa]s?\b/,
        /isolad[oa]\b/,
        /\bmal\b/,
        /exaust[oa]|acabada/,
        /me sinto (?:um trash|um lixo|inutil)/,
        /nao aguento/,
        /desmotivad[oa]|desanimad[oa]|sem animo/
    ];

    // Idiomaticas estreitas: so valem contra a camada DIRETO.
    const IDIOMA_ESTRETO = [
        /morrer de (?:rir|medo|raiva|vergonha|felicidade|alegria|constrangimento|pavor)/,
        /morreu? de (?:rir|medo|raiva|vergonha|susto|felicidade)/,
        /estou mort[oa] de (?:trabalho|estudo|prova|ansiedade|raiva|cansaco)/,
        /matar (?:o |a |um |uma )?(?:processo|bug|job|emprego|filho|filha|filh[oa]s|questao|duvida|tempo|aula|professor|chefe|sogra|cachorro|chat)/,
        /matar a saudade/,
        /matar o tempo/,
        /matar (?:o |a )?(?:dor|idade|raiva|odio)/,
        /matar (?:mob|boss|player|jogador|inimigo|char)/,
        /matar (?:tudo|todos) (?:no|no ranking|na)/,
        // Acidentes domesticos: "me feri queimando a pizza", "me cortei o dedo
        // descascando". So suprime a camada DIRETO, nunca a inegociavel.
        /me (?:feri|feri-me|cortei|corti|rasguei|queimei|arranhei)\b[^.?!]{0,40}?(?:queim|descasc|cozinh|bati|tomb|caindo|caiu|armadilha|vidro|chave|porta|faca|fogo|panela|tesoura|ferramenta)/,
        /me machucar o (?:dedo|cotovelo|joelho|pe)/,
        /me cort(?:o|ar) o cabelo/,
        /me rach(?:o|ar) a (?:mao|perna|cabeca)/,
        /me queim(?:o|ar) a (?:mao|perna|pe)/,
        /estou mort[oa] (?:de cansaco|o brain|o celular)/,
        /acabar com tudo (?:nessa vida|com isso)/,
        /acabar com (?:o mundo|o dia)/
    ];

    // Idiomaticas amplas: so valem contra a camada INDIRETA.
    const CONTEXTO_INOCUO = [
        ...IDIOMA_ESTRETO,
        /sumir do (?:trabalho|emprego|grupo|chat|radar|view|cena|instagram|rolagem)/,
        /sumir da (?:frente|pista|vista)/,
        /sumir no (?:tempo|trampo)/,
        /queria sumir (?:dentro|para dentro) (?:da |do )?(?:cama|banheiro|quarto)/,
        /abrir o jogo|fechar o jogo|dar um reset/,
        /me machucar (?:o |a )?(?:dedo|cotovelo|joelho|pe|braco)/
    ];

    /** Quantos marcadores de sofrimento aparecem no texto normalizado. */
    function contarSofrimento(msg) {
        return CRISE_SOFRIMENTO.filter(re => re.test(msg)).length;
    }

    function tem(lista, msg) {
        return lista.some(re => re.test(msg));
    }

    /**
     * Avalia UMA mensagem isolada.
     * @returns {{nivel: 'alto'|'moderado'|'nenhum', motivo: string, sofrimento: number}}
     */
    function avaliarRisco(texto) {
        const msg = normalizar(texto);
        if (msg.length < 3) return { nivel: 'nenhum', motivo: '', sofrimento: 0 };

        const sofrimento = contarSofrimento(msg);
        const idioma = tem(IDIOMA_ESTRETO, msg);

        if (tem(CRISE_INEGOCIAVEL, msg)) {
            return { nivel: 'alto', motivo: 'sinal explicito de risco', sofrimento };
        }
        if (!idioma && tem(CRISE_PASSIVO, msg)) {
            return { nivel: 'alto', motivo: 'idealizacao da ausencia', sofrimento };
        }
        if (!idioma && tem(CRISE_DIRETO, msg)) {
            return { nivel: 'alto', motivo: 'fala sobre morrer ou se machucar', sofrimento };
        }

        const indiretos = CRISE_INDIRETO.filter(re => re.test(msg)).length;
        if (indiretos >= 2) {
            return { nivel: 'alto', motivo: 'sinais indiretos combinados', sofrimento };
        }
        if (indiretos === 1 && !tem(CONTEXTO_INOCUO, msg) && sofrimento > 0) {
            return { nivel: 'moderado', motivo: 'desespero com sofrimento', sofrimento };
        }

        return { nivel: 'nenhum', motivo: '', sofrimento };
    }

    // ========================================================================
    // 3. LEITURA DA CONVERSA
    // ========================================================================
    //
    // A v1 olhava uma mensagem por vez. Crise quase nunca cabe numa mensagem
    // so: ela se constroi ao longo de turnos. Aqui somamos o historico.

    const JANELA = 6;          // quantos turnos recentes contam
    const SOFRIMENTO_MINIMO = 3;   // marcadores acumulados para escalar
    const INDICIO_MINIMO = 2;      // turnos com sinal para escalar

    let historico = [];

    /**
     * Registra um turno e devolve a leitura completa: do turno isolado e da
     * conversa ate aqui.
     *
     * O turno entra no historico ANTES da avaliacao da conversa, entao quem
     * chama nao precisa repassar o texto. Passar de novo contava dobrado e
     * fazia o painel abrir cedo demais.
     *
     * @returns {{nivel, motivo, sofrimento, conversa: {nivel, motivo}}}
     */
    function registrarTurno(texto) {
        const msg = normalizar(texto);
        const r = avaliarRisco(texto);

        historico.push({
            msg,
            nivel: r.nivel,
            sofrimento: r.sofrimento,
            indireto: CRISE_INDIRETO.filter(re => re.test(msg)).length,
            passivo: CRISE_PASSIVO.some(re => re.test(msg))
        });
        if (historico.length > JANELA) historico.shift();

        return Object.assign({}, r, { conversa: avaliarConversacao() });
    }

    function limparHistorico() {
        historico = [];
    }

    /**
     * Le a conversa ate aqui (o historico ja inclui o turno atual).
     *
     * Regras de escalonamento:
     *  - idealizacao passiva em qualquer turno recente -> 'alto'
     *  - 2+ turnos recentes com sinal -> 'alto'
     *  - 3+ marcadores de sofrimento acumulados -> 'moderado'
     *
     * Contexto inocuo ("quero sumir do trabalho") suprime a leitura daquele
     * turno, mas nao zera o historico: se a pessoa disse isso e depois falou
     * que queria nao ter nascido, o segundo turno tem que valer.
     */
    function avaliarConversacao() {
        const janela = historico.slice(-JANELA);
        if (!janela.length) return { nivel: 'nenhum', motivo: '' };

        const comSinal = janela.filter(t =>
            t.nivel !== 'nenhum' || t.indireto > 0 || t.passivo
        ).length;
        const sofrimentoTotal = janela.reduce((s, t) => s + t.sofrimento, 0);
        const passivo = janela.some(t => t.passivo);

        if (passivo || comSinal >= INDICIO_MINIMO) {
            return {
                nivel: 'alto',
                motivo: passivo ? 'idealizacao da ausencia' : 'escalaram entre turnos'
            };
        }
        if (sofrimentoTotal >= SOFRIMENTO_MINIMO) {
            return { nivel: 'moderado', motivo: 'sofrimento acumulado na conversa' };
        }
        return { nivel: 'nenhum', motivo: '' };
    }

    // ========================================================================
    // 4. RECURSOS
    // ========================================================================

    // Somente numeros nacionais, validos em todo o Brasil.
    const RECURSOS = {
        cvv: { nome: 'CVV', telefone: '188', desc: 'Atendimento gratuito, sigiloso, 24 horas.' },
        samu: { nome: 'SAMU', telefone: '192', desc: 'Emergencia medica via ambulancia.' }
    };

    const MAPS_BUSCA = 'https://www.google.com/maps/search/?api=1&query=';

    function abrirBuscaMapa(consulta, coordenadas) {
        const termo = coordenadas
            ? 'CAPS UBS centro de saude perto de ' + coordenadas.lat + ',' + coordenadas.lng
            : consulta + ' perto de mim';
        window.open(MAPS_BUSCA + encodeURIComponent(termo), '_blank', 'noopener,noreferrer');
    }

    function pedirLocalizacao() {
        const aviso = document.getElementById('acolheriaGeoAviso');
        if (!navigator.geolocation) {
            if (aviso) aviso.textContent = 'Seu navegador não permite localização. Abrindo busca por "perto de mim".';
            abrirBuscaMapa('CAPS UBS');
            return;
        }
        if (aviso) aviso.textContent = 'Procurando sua localização…';

        navigator.geolocation.getCurrentPosition(
            position => {
                if (aviso) aviso.textContent = 'Abrindo a rede de saúde mais próxima de você.';
                abrirBuscaMapa('CAPS UBS', position.coords);
            },
            () => {
                // Negado ou indisponivel: a busca "perto de mim" resolve no
                // navegador do Google, sem enviar coordenada para o site.
                if (aviso) aviso.textContent = 'Não obtive sua localização. Abrindo busca por "perto de mim" (o mapa resolve no seu navegador).';
                abrirBuscaMapa('CAPS UBS');
            },
            { enableHighAccuracy: false, timeout: 8000, maximumAge: 600000 }
        );
    }

    // ========================================================================
    // 5. RESPIRACAO 4-7-8
    // ========================================================================

    const FASES = [
        { nome: 'Inspire pelo nariz', segundos: 4, escala: 1 },
        { nome: 'Segure', segundos: 7, escala: 1 },
        { nome: 'Expire pela boca', segundos: 8, escala: 0.62 }
    ];

    let respiracaoTimer = null;

    function pararRespiracao() {
        if (respiracaoTimer) clearInterval(respiracaoTimer);
        respiracaoTimer = null;
        const painel = document.getElementById('acolheriaRespiracao');
        if (painel) painel.hidden = true;
        const botao = document.getElementById('acolheriaRespIniciar');
        if (botao) botao.hidden = false;
    }

    function iniciarRespiracao() {
        const painel = document.getElementById('acolheriaRespiracao');
        const botao = document.getElementById('acolheriaRespIniciar');
        if (!painel) return;
        pararRespiracao();

        painel.hidden = false;
        if (botao) botao.hidden = true;

        const bolha = document.getElementById('acolheriaRespBolha');
        const rotulo = document.getElementById('acolheriaRespFase');
        const contador = document.getElementById('acolheriaRespContador');
        const ciclos = document.getElementById('acolheriaRespCiclos');

        const semAnimacao = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        let fase = 0;
        let restante = FASES[0].segundos;
        let feitos = 0;

        function aplicar() {
            const atual = FASES[fase];
            if (rotulo) rotulo.textContent = atual.nome;
            if (contador) contador.textContent = restante;
            if (bolha) {
                bolha.style.transition = semAnimacao ? 'none' : 'transform 4s ease-in-out';
                bolha.style.transform = 'scale(' + atual.escala + ')';
            }
        }

        aplicar();

        respiracaoTimer = setInterval(() => {
            restante -= 1;
            if (restante > 0) {
                if (contador) contador.textContent = restante;
                return;
            }
            fase += 1;
            if (fase >= FASES.length) {
                fase = 0;
                feitos += 1;
                if (ciclos) {
                    ciclos.textContent = feitos >= 4
                        ? 'Você concluiu os 4 ciclos. Pode parar aqui ou repetir.'
                        : 'Ciclo ' + feitos + ' de 4. Continue no seu ritmo.';
                }
            }
            restante = FASES[fase].segundos;
            aplicar();
        }, 1000);
    }

    // ========================================================================
    // 6. MARCACAO DO PAINEL
    // ========================================================================

    function marcar(nivel) {
        document.body.classList.remove('acolheria-safety-alto', 'acolheria-safety-moderado');
        if (nivel === 'alto') document.body.classList.add('acolheria-safety-alto');
        if (nivel === 'moderado') document.body.classList.add('acolheria-safety-moderado');
    }

    // ========================================================================
    // 7. MARKUP
    // ========================================================================
    //
    // Injetado por JS em vez de replicado nos 10 HTMLs: fonte unica, e um
    // recurso critico de seguranca nao pode divergir entre paginas.

    function garantirPainel() {
        if (document.getElementById('acolheriaSafety')) return;

        const aside = document.createElement('aside');
        aside.id = 'acolheriaSafety';
        aside.className = 'acolheria-safety';
        aside.hidden = true;
        aside.setAttribute('aria-hidden', 'true');
        aside.setAttribute('role', 'complementary');
        aside.setAttribute('aria-label', 'Apoio imediato');

        aside.innerHTML = [
            '<div class="acolheria-safety-head">',
            '  <div class="acolheria-safety-title">',
            '    <i class="fa-solid fa-heart"></i><span>Apoio Imediato</span>',
            '  </div>',
            '  <button class="acolheria-safety-x" id="acolheriaSafetyFechar" type="button" aria-label="Fechar painel de apoio">',
            '    <i class="fa-solid fa-xmark"></i>',
            '  </button>',
            '</div>',
            '<p class="acolheria-safety-nota" id="acolheriaSafetyNota">',
            '  Percebo que você está passando por um momento muito pesado.',
            '  Você não precisa atravessar isso sozinho(a).',
            '</p>',
            '<div class="acolheria-safety-scroll">',
            '  <section class="acolheria-safety-card is-emergencia">',
            '    <span class="acolheria-safety-label">Emergência</span>',
            '    <h3>Centro de Valorização da Vida</h3>',
            '    <p>Atendimento gratuito, sigiloso, 24 horas por dia. Você não precisa explicar nada para ligar.</p>',
            '    <a class="acolheria-safety-tel" href="tel:188"><i class="fa-solid fa-phone"></i> Ligar 188 (CVV)</a>',
            '    <a class="acolheria-safety-tel is-secundario" href="tel:192"><i class="fa-solid fa-truck-medical"></i> Ligar 192 (SAMU)</a>',
            '  </section>',
            '  <section class="acolheria-safety-card is-rede">',
            '    <div class="acolheria-safety-cardhead"><i class="fa-solid fa-location-dot"></i><h3>Rede de saúde</h3></div>',
            '    <p>CAPS, UBS e centros de acolhimento fazem atendimento público e gratuito.</p>',
            '    <button class="acolheria-safety-acao" id="acolheriaGeo" type="button"><i class="fa-solid fa-map-location-dot"></i> Ver unidade perto de mim</button>',
            '    <p class="acolheria-safety-geoaviso" id="acolheriaGeoAviso" role="status"></p>',
            '  </section>',
            '  <section class="acolheria-safety-card is-respiracao">',
            '    <div class="acolheria-safety-cardhead"><i class="fa-solid fa-wind"></i><h3>Descompressão</h3></div>',
            '    <p>Respiração 4-7-8. Serve para baixar a intensidade do momento. Pode parar quando quiser.</p>',
            '    <button class="acolheria-safety-acao" id="acolheriaRespIniciar" type="button"><i class="fa-solid fa-play"></i> Iniciar respiração guiada</button>',
            '    <div class="acolheria-resp" id="acolheriaRespiracao" hidden>',
            '      <div class="acolheria-resp-bolha" id="acolheriaRespBolha" aria-hidden="true"></div>',
            '      <p class="acolheria-resp-fase" id="acolheriaRespFase" role="status">Inspire pelo nariz</p>',
            '      <p class="acolheria-resp-contador" id="acolheriaRespContador" aria-hidden="true">4</p>',
            '      <p class="acolheria-resp-ciclos" id="acolheriaRespCiclos">Ciclo 1 de 4. Continue no seu ritmo.</p>',
            '      <button class="acolheria-resp-parar" id="acolheriaRespParar" type="button">Parar exercício</button>',
            '    </div>',
            '  </section>',
            '  <p class="acolheria-safety-aviso">',
            '    A AcolherIA é um apoio informacional e não substitui profissionais de saúde.',
            '    Em risco imediato, ligue 188 ou 192.',
            '  </p>',
            '</div>',
            '<button class="acolheria-safety-minimizar" id="acolheriaSafetyMinimizar" type="button">Voltar a conversar</button>'
        ].join('\n');

        document.body.appendChild(aside);
    }

    // ========================================================================
    // 8. API PUBLICA
    // ========================================================================

    const api = {
        avaliarRisco,
        avaliarConversacao,
        registrarTurno,
        limparHistorico,
        abrirCrise: function () {
            // Botao "preciso de ajuda agora": nao e um turno, e um pedido
            // direto. Nao entra no historico para nao contaminar a leitura.
            api.abrir('alto');
        },

        abrir: function (nivel) {
            const painel = document.getElementById('acolheriaSafety');
            if (!painel) return;
            marcar(nivel || 'alto');
            painel.hidden = false;
            document.body.classList.add('acolheria-safety-open');
            painel.setAttribute('aria-hidden', 'false');
            const nota = document.getElementById('acolheriaSafetyNota');
            if (nota && nivel === 'moderado') {
                nota.textContent = 'Você parece estar passando por um momento muito difícil. Não precisa atravessar isso sozinho(a).';
            }
        },

        fechar: function () {
            const painel = document.getElementById('acolheriaSafety');
            if (!painel) return;
            pararRespiracao();
            document.body.classList.remove('acolheria-safety-open');
            marcar(null);
            painel.hidden = true;
            painel.setAttribute('aria-hidden', 'true');
        },

        estaAberto: function () {
            const painel = document.getElementById('acolheriaSafety');
            return Boolean(painel && !painel.hidden);
        },

        // Abre a busca por CAPS/UBS perto de quem chamou. Exposto para o
        // botão de ajuda rápida do modal, que fica sempre a vista: antes o
        // numero so aparecia depois que a conversa começava.
        buscarCaps: function () {
            pedirLocalizacao();
        },

        ligarUI: function () {
            garantirPainel();
            document.getElementById('acolheriaSafetyFechar')?.addEventListener('click', api.fechar);
            document.getElementById('acolheriaSafetyMinimizar')?.addEventListener('click', api.fechar);
            document.getElementById('acolheriaRespIniciar')?.addEventListener('click', iniciarRespiracao);
            document.getElementById('acolheriaRespParar')?.addEventListener('click', pararRespiracao);
            document.getElementById('acolheriaGeo')?.addEventListener('click', pedirLocalizacao);
            document.getElementById('acolheriaSemAjuda')?.addEventListener('click', api.abrirCrise);

            // Botão de ajuda rápida dentro do modal da AcolherIA. Delegado
            // porque o botão só existe em algunas páginas (o painel de
            // segurança é injetado, este já vem no HTML).
            if (!document.body.dataset.colheriaCapsLigado) {
                document.body.dataset.colheriaCapsLigado = '1';
                document.addEventListener('click', function (event) {
                    const alvo = event.target instanceof Element
                        ? event.target.closest('#acolheriaCapsBusca')
                        : null;
                    if (!alvo) return;
                    event.preventDefault();
                    pedirLocalizacao();
                });
            }

            document.addEventListener('keydown', function (event) {
                if (event.key === 'Escape' && api.estaAberto()) {
                    pararRespiracao();
                    api.fechar();
                }
            });
        }
    };

    window.AcolheriaSeguranca = api;
})();
