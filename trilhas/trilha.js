/**
 * TRILHA.JS — Sistema de Trilhas Interativas
 * Com Quiz de Persona + Progresso Adaptativo (Estilo Duolingo)
 */

document.addEventListener('DOMContentLoaded', () => {

    console.log('🚀 Iniciando Sistema de Trilhas...');

    // =============================================
    // 1. CONFIGURAÇÃO DAS TRILHAS
    // =============================================
    const TRILHAS_DATA = {
        infantil: {
            id: 'infantil',
            nome: 'Jornada Lúdica',
            icon: '🧒',
            idade: '0-12 anos',
            fases: [
                {
                    id: 1,
                    nome: 'Meus Sentidos',
                    icon: '🌿',
                    medalha: 'Explorador dos Sentidos',
                    medalhaIcon: '🏅',
                    descricao: 'Descubra como você percebe o mundo ao seu redor.',
                    perguntas: [
                        {
                            texto: 'Quando o mundo está muito barulhento ou cheio de luzes, você...',
                            opcoes: [
                                'Se sente um Herói com Superaudição — percebe tudo ao redor',
                                'Quer correr para uma Cabana Silenciosa — precisa de paz para se regular'
                            ]
                        },
                        {
                            texto: 'Quando você toca em uma textura diferente (areia, tecido, grama), você...',
                            opcoes: [
                                'Adora explorar e sentir todas as sensações',
                                'Pode se sentir desconfortável se for muito áspero ou grudento'
                            ]
                        }
                    ],
                    resultado: (respostas) => {
                        const sensitive = respostas.filter(r => r === 0).length;
                        const regulator = respostas.filter(r => r === 1).length;
                        if (sensitive >= regulator) {
                            return {
                                titulo: '🧭 Você é um Explorador dos Sentidos!',
                                texto: 'Você percebe o mundo de forma intensa e detalhada. Isso é um superpoder! Aprender a gerenciar essa sensibilidade vai te ajudar a navegar pelo mundo com mais confiança.'
                            };
                        } else {
                            return {
                                titulo: '🧘 Você é um Mestre da Regulação!',
                                texto: 'Você sabe quando precisa de um momento de silêncio para se regular. Isso é uma habilidade incrível! Continue prestando atenção no que seu corpo precisa.'
                            };
                        }
                    }
                },
                {
                    id: 2,
                    nome: 'Meu Foco',
                    icon: '🚀',
                    medalha: 'Mestre da Curiosidade',
                    medalhaIcon: '📚',
                    descricao: 'Como sua atenção funciona?',
                    perguntas: [
                        {
                            texto: 'Quando você gosta muito de um assunto, você...',
                            opcoes: [
                                'Vira um Foguete que não para de pensar nisso — hiperfoco total!',
                                'É uma Borboleta que gosta de voar de flor em flor — várias ideias ao mesmo tempo'
                            ]
                        },
                        {
                            texto: 'Para fazer uma tarefa que não te interessa muito, você...',
                            opcoes: [
                                'Precisa de um "empurrão" para começar, mas depois não para mais',
                                'Prefere dividir em partes pequenas e fazer com pausas'
                            ]
                        }
                    ],
                    resultado: (respostas) => {
                        const hyperfocus = respostas.filter(r => r === 0).length;
                        const multi = respostas.filter(r => r === 1).length;
                        if (hyperfocus >= multi) {
                            return {
                                titulo: '🚀 Você é um Foguete do Hiperfoco!',
                                texto: 'Quando você se interessa por algo, nada te para! Isso é uma força incrível. Aprender a direcionar esse foco para o que é importante vai te ajudar muito.'
                            };
                        } else {
                            return {
                                titulo: '🦋 Você é uma Borboleta da Criatividade!',
                                texto: 'Sua mente voa por várias ideias ao mesmo tempo — isso é criatividade pura! Aprender a organizar essas ideias vai te ajudar a aproveitar todo seu potencial.'
                            };
                        }
                    }
                },
                {
                    id: 3,
                    nome: 'Conectando com o Mundo',
                    icon: '❤️',
                    medalha: 'Amigo do Coração',
                    medalhaIcon: '💖',
                    descricao: 'Como você se conecta com as pessoas?',
                    perguntas: [
                        {
                            texto: 'Quando você está com outras pessoas, você...',
                            opcoes: [
                                'Gosta de observar e entender como cada um funciona antes de se aproximar',
                                'Adora interagir e compartilhar suas ideias e sentimentos'
                            ]
                        },
                        {
                            texto: 'Para você, uma amizade verdadeira é...',
                            opcoes: [
                                'Alguém que te entende sem você precisar se explicar',
                                'Alguém com quem você pode ser você mesmo, sem máscaras'
                            ]
                        }
                    ],
                    resultado: (respostas) => {
                        const observer = respostas.filter(r => r === 0).length;
                        const connector = respostas.filter(r => r === 1).length;
                        if (observer >= connector) {
                            return {
                                titulo: '🔍 Você é um Observador do Coração!',
                                texto: 'Você entende as pessoas de forma profunda antes de se conectar. Isso te torna um amigo leal e atento. Continue confiando no seu tempo.'
                            };
                        } else {
                            return {
                                titulo: '💬 Você é um Conector Natural!',
                                texto: 'Você se conecta com as pessoas de forma genuína e aberta. Essa é uma habilidade linda! Continue sendo você mesmo.'
                            };
                        }
                    }
                }
            ]
        },
        jovem: {
            id: 'jovem',
            nome: 'Jornada Dinâmica',
            icon: '⚡',
            idade: '13-17 anos',
            fases: [
                {
                    id: 1,
                    nome: 'Energia Social',
                    icon: '⚡',
                    medalha: 'Estrategista de Energia',
                    medalhaIcon: '⚡',
                    descricao: 'Como você recarrega suas energias?',
                    perguntas: [
                        {
                            texto: 'Depois de um dia cheio de interações sociais, você...',
                            opcoes: [
                                'Precisa de um tempo sozinhe para recarregar (Modo Solo)',
                                'Gosta de continuar conversando e compartilhando (Modo Coop)'
                            ]
                        },
                        {
                            texto: 'Quando você está em um grupo de amigos, você...',
                            opcoes: [
                                'Prefere observar e participar quando se sente confortável',
                                'Gosta de estar no centro das conversas e interações'
                            ]
                        }
                    ],
                    resultado: (respostas) => {
                        const solo = respostas.filter(r => r === 0).length;
                        const coop = respostas.filter(r => r === 1).length;
                        if (solo >= coop) {
                            return {
                                titulo: '🧘 Estrategista da Energia Solo!',
                                texto: 'Você recarrega suas energias no silêncio e na solitude. Isso não é timidez — é autoconhecimento! Respeite seu tempo e seu espaço.'
                            };
                        } else {
                            return {
                                titulo: '🤝 Estrategista da Energia Coletiva!',
                                texto: 'Você se energiza com as pessoas ao seu redor. Sua presença ilumina os ambientes! Lembre-se de equilibrar com momentos de pausa.'
                            };
                        }
                    }
                },
                {
                    id: 2,
                    nome: 'Estilo de Aprendizado',
                    icon: '🎨',
                    medalha: 'Mente Criativa',
                    medalhaIcon: '🎨',
                    descricao: 'Como você aprende melhor?',
                    perguntas: [
                        {
                            texto: 'Para estudar para uma prova, você...',
                            opcoes: [
                                'Cria mapas mentais coloridos e organiza o conteúdo visualmente',
                                'Deixa para a última hora e usa a adrenalina para focar'
                            ]
                        },
                        {
                            texto: 'Quando precisa aprender algo novo, você...',
                            opcoes: [
                                'Gosta de ver exemplos práticos e aplicar imediatamente',
                                'Prefere ler e entender a teoria antes de colocar em prática'
                            ]
                        }
                    ],
                    resultado: (respostas) => {
                        const visual = respostas.filter(r => r === 0).length;
                        const pratico = respostas.filter(r => r === 1).length;
                        if (visual >= pratico) {
                            return {
                                titulo: '🎨 Você é um Aprendiz Visual!',
                                texto: 'Você aprende melhor quando pode ver, organizar e criar. Mapas mentais, cores e imagens são seus aliados!'
                            };
                        } else {
                            return {
                                titulo: '⚡ Você é um Aprendiz Prático!',
                                texto: 'Você aprende fazendo! A teoria ganha vida quando você coloca a mão na massa. Continue confiando no seu jeito.'
                            };
                        }
                    }
                },
                {
                    id: 3,
                    nome: 'Gerenciamento de Crise',
                    icon: '🛡️',
                    medalha: 'Resiliência',
                    medalhaIcon: '🛡️',
                    descricao: 'Como você lida com frustrações?',
                    perguntas: [
                        {
                            texto: 'Quando um plano não sai como esperado, você...',
                            opcoes: [
                                'Sente frustração, mas respira fundo e tenta se adaptar',
                                'Pode ficar sobrecarregade e precisa de um tempo para processar'
                            ]
                        },
                        {
                            texto: 'Para lidar com momentos difíceis, você...',
                            opcoes: [
                                'Tem estratégias que funcionam (respiração, pausa, música)',
                                'Ainda está descobrindo o que funciona melhor para você'
                            ]
                        }
                    ],
                    resultado: (respostas) => {
                        const adapt = respostas.filter(r => r === 0).length;
                        const process = respostas.filter(r => r === 1).length;
                        if (adapt >= process) {
                            return {
                                titulo: '🛡️ Mestre da Resiliência!',
                                texto: 'Você tem estratégias para lidar com os momentos difíceis. Continue fortalecendo suas ferramentas de regulação.'
                            };
                        } else {
                            return {
                                titulo: '🌱 Explorador da Resiliência!',
                                texto: 'Você está aprendendo a navegar pelas emoções difíceis. Cada passo é uma conquista — continue explorando o que funciona para você.'
                            };
                        }
                    }
                }
            ]
        },
        adulta: {
            id: 'adulta',
            nome: 'Jornada Prática',
            icon: '👨‍💼',
            idade: '18+',
            fases: [
                {
                    id: 1,
                    nome: 'Mapeamento Sensorial',
                    icon: '🔍',
                    medalha: 'Consciência Pessoal',
                    medalhaIcon: '🔍',
                    descricao: 'Onde sua energia executiva está sendo consumida?',
                    perguntas: [
                        {
                            texto: 'Qual dessas tarefas consome mais a sua energia executiva?',
                            opcoes: [
                                'Iniciar um projeto ou tarefa nova',
                                'Manter a organização do dia a dia'
                            ]
                        },
                        {
                            texto: 'O que mais te sobrecarrega no dia a dia?',
                            opcoes: [
                                'Ambientes com muito estímulo (barulho, luzes, pessoas)',
                                'Tarefas administrativas e burocráticas'
                            ]
                        }
                    ],
                    resultado: (respostas) => {
                        const inicio = respostas.filter(r => r === 0).length;
                        const organizacao = respostas.filter(r => r === 1).length;
                        if (inicio >= organizacao) {
                            return {
                                titulo: '🎯 Mapeamento: Início é o Desafio!',
                                texto: 'Você tem mais dificuldade para começar tarefas do que para executá-las. Isso é comum em cérebros neurodivergentes! Estratégias de ativação podem ajudar.'
                            };
                        } else {
                            return {
                                titulo: '📋 Mapeamento: Organização é o Desafio!',
                                texto: 'Manter a organização do dia a dia consome sua energia. Sistemas simples e visuais podem fazer toda a diferença.'
                            };
                        }
                    }
                },
                {
                    id: 2,
                    nome: 'Reconhecimento de Potenciais',
                    icon: '🎯',
                    medalha: 'Foco no Potencial',
                    medalhaIcon: '🎯',
                    descricao: 'Quais são suas maiores qualidades?',
                    perguntas: [
                        {
                            texto: 'Qual dessas características você reconhece em si?',
                            opcoes: [
                                'Hiper-foco produtivo — consigo mergulhar profundamente em temas que amo',
                                'Pensamento fora da caixa — vejo soluções que outras pessoas não veem'
                            ]
                        },
                        {
                            texto: 'Qual dessas qualidades você mais valoriza em si?',
                            opcoes: [
                                'Empatia profunda — consigo entender o que os outros sentem',
                                'Honestidade radical — sou autêntico e falo o que penso'
                            ]
                        }
                    ],
                    resultado: (respostas) => {
                        const foco = respostas.filter(r => r === 0).length;
                        const criatividade = respostas.filter(r => r === 1).length;
                        if (foco >= criatividade) {
                            return {
                                titulo: '🎯 Seu Potencial: Foco e Profundidade!',
                                texto: 'Sua capacidade de mergulhar em temas que te interessam é um superpoder! Use isso para construir conhecimento e criar conexões profundas.'
                            };
                        } else {
                            return {
                                titulo: '🌈 Seu Potencial: Criatividade e Originalidade!',
                                texto: 'Sua mente pensa diferente e isso é sua maior força. O mundo precisa da sua perspectiva única!'
                            };
                        }
                    }
                },
                {
                    id: 3,
                    nome: 'Estratégias de Autorregulação',
                    icon: '🌟',
                    medalha: 'Autonomia',
                    medalhaIcon: '🌟',
                    descricao: 'O que funciona para acalmar sua mente?',
                    perguntas: [
                        {
                            texto: 'O que te ajuda a se acalmar em momentos de sobrecarga?',
                            opcoes: [
                                'Fones com cancelamento de ruído e um ambiente tranquilo',
                                'Movimento: caminhar, dançar ou fazer uma atividade física'
                            ]
                        },
                        {
                            texto: 'Qual dessas estratégias funciona melhor para você?',
                            opcoes: [
                                'Respiração profunda e meditação',
                                'Tirar um tempo para fazer algo que te dá prazer (hobby)'
                            ]
                        }
                    ],
                    resultado: (respostas) => {
                        const silencio = respostas.filter(r => r === 0).length;
                        const movimento = respostas.filter(r => r === 1).length;
                        if (silencio >= movimento) {
                            return {
                                titulo: '🧘 Kit de Regulação: Silêncio e Calma!',
                                texto: 'Você se regula através do silêncio e da calma. Continue cultivando seus momentos de pausa — eles são essenciais para você.'
                            };
                        } else {
                            return {
                                titulo: '🏃 Kit de Regulação: Movimento e Ação!',
                                texto: 'Você se regula através do movimento e da ação. Seu corpo sabe o que precisa — continue ouvindo ele!'
                            };
                        }
                    }
                }
            ]
        }
    };

    // =============================================
    // 2. DADOS DO QUIZ DE PERSONA
    // =============================================
    const PERGUNTAS_PERSONA = [
        {
            id: 1,
            texto: 'Como você se sente em ambientes com muitas pessoas?',
            emoji: '👥',
            opcoes: [
                { texto: 'Me sinto energizado e animado', valor: 'social' },
                { texto: 'Prefiro observar antes de participar', valor: 'observador' },
                { texto: 'Fico sobrecarregado e preciso de pausas', valor: 'sensorial' }
            ]
        },
        {
            id: 2,
            texto: 'Quando você precisa aprender algo novo, você...',
            emoji: '📚',
            opcoes: [
                { texto: 'Gosta de ler e pesquisar bastante antes', valor: 'teorico' },
                { texto: 'Prefere colocar a mão na massa e experimentar', valor: 'pratico' },
                { texto: 'Aprende melhor com vídeos e imagens', valor: 'visual' }
            ]
        },
        {
            id: 3,
            texto: 'Como você lida com mudanças inesperadas?',
            emoji: '🔄',
            opcoes: [
                { texto: 'Me adapto rápido, gosto de novidades', valor: 'flexivel' },
                { texto: 'Prefiro planejar e ter previsibilidade', valor: 'estrategico' },
                { texto: 'Preciso de um tempo para processar', valor: 'processador' }
            ]
        },
        {
            id: 4,
            texto: 'Como você recarrega suas energias?',
            emoji: '🔋',
            opcoes: [
                { texto: 'Passando tempo com pessoas que gosto', valor: 'social' },
                { texto: 'Tendo momentos de silêncio e solitude', valor: 'solo' },
                { texto: 'Fazendo atividades que me dão prazer', valor: 'criativo' }
            ]
        },
        {
            id: 5,
            texto: 'Qual dessas frases combina mais com você?',
            emoji: '💭',
            opcoes: [
                { texto: '"Eu vejo o mundo de um jeito único e especial"', valor: 'criativo' },
                { texto: '"Eu entendo as pessoas de forma profunda"', valor: 'empatico' },
                { texto: '"Eu sou muito focado quando algo me interessa"', valor: 'focado' }
            ]
        }
    ];

    // =============================================
    // 3. GERENCIAMENTO DE PROGRESSO
    // =============================================
    function getProgress() {
        const saved = localStorage.getItem('trilhas_progress');
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch {
                return getDefaultProgress();
            }
        }
        return getDefaultProgress();
    }

    function getDefaultProgress() {
        return {
            fasesCompletas: [],
            medalhas: [],
            pontos: 0
        };
    }

    function saveProgress(progress) {
        localStorage.setItem('trilhas_progress', JSON.stringify(progress));
        atualizarUI(progress);
    }

    function isFaseCompleta(trilhaId, faseId) {
        const progress = getProgress();
        return progress.fasesCompletas.some(f => f.trilha === trilhaId && f.fase === faseId);
    }

    function getFasesCompletasCount(trilhaId) {
        const progress = getProgress();
        return progress.fasesCompletas.filter(f => f.trilha === trilhaId).length;
    }

    function getTotalFases(trilhaId) {
        return TRILHAS_DATA[trilhaId]?.fases?.length || 0;
    }

    function getTotalMedalhas() {
        const progress = getProgress();
        return progress.medalhas.length;
    }

    function getTotalPontos() {
        const progress = getProgress();
        return progress.pontos || 0;
    }

    function isTrilhaDesbloqueada(trilhaId) {
        const ordem = ['infantil', 'jovem', 'adulta'];
        const index = ordem.indexOf(trilhaId);
        if (index === 0) return true;
        const anterior = ordem[index - 1];
        const fasesAnterior = getFasesCompletasCount(anterior);
        const totalAnterior = getTotalFases(anterior);
        return fasesAnterior >= totalAnterior;
    }

    function getFaseStatus(trilhaId, faseId) {
        const isComplete = isFaseCompleta(trilhaId, faseId);
        const isDesbloqueada = isTrilhaDesbloqueada(trilhaId);
        const isFaseAnteriorCompleta = faseId === 1 || isFaseCompleta(trilhaId, faseId - 1);
        const isLocked = !isDesbloqueada || (!isComplete && !isFaseAnteriorCompleta);
        
        return {
            isComplete,
            isLocked,
            isAvailable: isDesbloqueada && !isComplete && !isLocked
        };
    }

    // =============================================
    // 4. FUNÇÃO PARA CALCULAR A PERSONA
    // =============================================
    function calcularPersona(respostas) {
        const contagem = {};
        respostas.forEach(r => {
            contagem[r] = (contagem[r] || 0) + 1;
        });

        let maxCount = 0;
        let persona = 'infantil';
        for (const [key, count] of Object.entries(contagem)) {
            if (count > maxCount) {
                maxCount = count;
                persona = key;
            }
        }

        const mapaPersona = {
            'social': 'jovem',
            'observador': 'infantil',
            'sensorial': 'infantil',
            'teorico': 'adulta',
            'pratico': 'jovem',
            'visual': 'infantil',
            'flexivel': 'jovem',
            'estrategico': 'adulta',
            'processador': 'infantil',
            'solo': 'adulta',
            'criativo': 'jovem',
            'empatico': 'infantil',
            'focado': 'adulta'
        };

        const trilhaRecomendada = mapaPersona[persona] || 'infantil';
        
        return {
            persona,
            trilhaRecomendada,
            nomePersona: getNomePersona(persona),
            descricaoPersona: getDescricaoPersona(persona)
        };
    }

    function getNomePersona(persona) {
        const nomes = {
            'social': '🌟 Conector Social',
            'observador': '🔍 Observador Atento',
            'sensorial': '🌿 Sensível e Perceptivo',
            'teorico': '📚 Mente Analítica',
            'pratico': '⚡ Fazedor Natural',
            'visual': '🎨 Aprendiz Visual',
            'flexivel': '🌀 Adaptável e Versátil',
            'estrategico': '🎯 Planejador Estratégico',
            'processador': '🧠 Processador Profundo',
            'solo': '🧘 Amante da Solitude',
            'criativo': '🌈 Mente Criativa',
            'empatico': '💜 Coração Empático',
            'focado': '🎯 Foco Inabalável'
        };
        return nomes[persona] || '🌱 Explorador';
    }

    function getDescricaoPersona(persona) {
        const descricoes = {
            'social': 'Você se energiza com as pessoas! Sua jornada vai te ajudar a equilibrar sua energia social.',
            'observador': 'Você observa o mundo com atenção. Vamos descobrir como usar isso ao seu favor!',
            'sensorial': 'Seus sentidos são aguçados. Vamos aprender a navegar pelo mundo com mais conforto.',
            'teorico': 'Você ama aprender e pesquisar. Vamos organizar esse conhecimento de forma prática!',
            'pratico': 'Você aprende fazendo. Vamos colocar a mão na massa desde o começo!',
            'visual': 'Você pensa em imagens. Vamos usar isso para aprender ainda melhor!',
            'flexivel': 'Você se adapta rápido. Vamos explorar todas as possibilidades juntos!',
            'estrategico': 'Você planeja e organiza. Vamos criar estratégias que funcionam para você!',
            'processador': 'Você processa informações de forma profunda. Vamos dar tempo ao tempo.',
            'solo': 'Você recarrega na solitude. Vamos respeitar seu espaço e seu ritmo.',
            'criativo': 'Sua mente é uma fábrica de ideias. Vamos canalizar essa criatividade!',
            'empatico': 'Você sente o que os outros sentem. Vamos cuidar de você também.',
            'focado': 'Quando você foca, nada te para. Vamos direcionar esse superpoder!'
        };
        return descricoes[persona] || 'Você é único e especial. Vamos descobrir juntos sua jornada!';
    }

    function getNomeTrilha(trilhaId) {
        const nomes = {
            'infantil': 'Jornada Lúdica 🧒',
            'jovem': 'Jornada Dinâmica ⚡',
            'adulta': 'Jornada Prática 👨‍💼'
        };
        return nomes[trilhaId] || trilhaId;
    }

    // =============================================
    // 5. MOSTRAR QUIZ DE PERSONA
    // =============================================
    let respostasQuiz = [];
    let perguntaQuizAtual = 0;

    function mostrarQuizPersona() {
        console.log('📝 Mostrando Quiz de Persona...');
        const overlay = document.getElementById('quizPersonaOverlay');
        if (overlay) {
            overlay.hidden = false;
            document.body.style.overflow = 'hidden';
            renderizarPerguntaQuiz();
        } else {
            console.error('❌ Elemento quizPersonaOverlay não encontrado!');
        }
    }

    function fecharQuizPersona() {
        const overlay = document.getElementById('quizPersonaOverlay');
        if (overlay) {
            overlay.hidden = true;
            document.body.style.overflow = '';
        }
    }

    function renderizarPerguntaQuiz() {
        const total = PERGUNTAS_PERSONA.length;
        
        if (perguntaQuizAtual >= total) {
            finalizarQuiz();
            return;
        }

        const pergunta = PERGUNTAS_PERSONA[perguntaQuizAtual];
        const body = document.getElementById('quizPersonaBody');
        const step = document.getElementById('quizStep');
        const progress = document.getElementById('quizProgressFill');
        const btnNext = document.getElementById('quizNextBtn');

        if (!body) {
            console.error('❌ Elemento quizPersonaBody não encontrado!');
            return;
        }

        body.innerHTML = `
            <div class="quiz-question">
                <div class="quiz-question-text">
                    <span style="font-size:24px;display:block;margin-bottom:4px;">${pergunta.emoji}</span>
                    ${pergunta.texto}
                </div>
                <div class="quiz-options" id="quizOptions">
                    ${pergunta.opcoes.map((opcao, index) => `
                        <label class="quiz-option" data-index="${index}">
                            <input type="radio" name="quizResposta" value="${opcao.valor}">
                            <span class="quiz-option-label">${opcao.texto}</span>
                        </label>
                    `).join('')}
                </div>
            </div>
        `;

        if (step) step.textContent = `${perguntaQuizAtual + 1} / ${total}`;
        if (progress) {
            const percent = ((perguntaQuizAtual + 1) / total) * 100;
            progress.style.width = `${percent}%`;
        }

        if (btnNext) {
            btnNext.disabled = true;
            btnNext.textContent = perguntaQuizAtual === total - 1 ? '✨ Ver resultado' : 'Próximo →';
        }

        document.querySelectorAll('.quiz-option input[type="radio"]').forEach(input => {
            input.addEventListener('change', () => {
                const allOptions = document.querySelectorAll('.quiz-option');
                allOptions.forEach(el => el.classList.toggle('selected', el.querySelector('input').checked));
                if (btnNext) btnNext.disabled = false;
            });
        });
    }

    function finalizarQuiz() {
        const resultado = calcularPersona(respostasQuiz);
        
        localStorage.setItem('trilhas_persona', JSON.stringify(resultado));
        localStorage.setItem('trilhas_iniciada', 'true');

        const body = document.getElementById('quizPersonaBody');
        const btnNext = document.getElementById('quizNextBtn');
        const btnSkip = document.getElementById('quizSkipBtn');

        if (body) {
            body.innerHTML = `
                <div class="quiz-resultado">
                    <div class="quiz-resultado-icon">${resultado.nomePersona.split(' ')[0]}</div>
                    <h3>${resultado.nomePersona}</h3>
                    <p>${resultado.descricaoPersona}</p>
                    <div class="quiz-resultado-trilha">
                        <span>🔮 Trilha recomendada: ${getNomeTrilha(resultado.trilhaRecomendada)}</span>
                    </div>
                    <button class="quiz-resultado-btn" id="quizResultadoBtn">
                        <i class="fa-solid fa-rocket"></i> Começar minha jornada
                    </button>
                </div>
            `;

            const btn = document.getElementById('quizResultadoBtn');
            if (btn) {
                btn.addEventListener('click', () => {
                    fecharQuizPersona();
                    iniciarSistema();
                });
            }
        }

        if (btnNext) btnNext.style.display = 'none';
        if (btnSkip) btnSkip.style.display = 'none';

        const step = document.getElementById('quizStep');
        const progress = document.getElementById('quizProgressFill');
        if (step) step.textContent = '✅ Concluído!';
        if (progress) progress.style.width = '100%';
    }

    // =============================================
    // 6. EVENTOS DO QUIZ
    // =============================================
    document.getElementById('quizNextBtn')?.addEventListener('click', () => {
        const selected = document.querySelector('.quiz-option input[type="radio"]:checked');
        if (!selected) return;

        respostasQuiz.push(selected.value);
        perguntaQuizAtual++;
        renderizarPerguntaQuiz();
    });

    document.getElementById('quizSkipBtn')?.addEventListener('click', () => {
        const resultado = {
            persona: 'explorador',
            trilhaRecomendada: 'infantil',
            nomePersona: '🌱 Explorador da Jornada',
            descricaoPersona: 'Você está começando sua jornada de autoconhecimento! Vamos descobrir seus superpoderes juntos.'
        };
        localStorage.setItem('trilhas_persona', JSON.stringify(resultado));
        localStorage.setItem('trilhas_iniciada', 'true');
        fecharQuizPersona();
        iniciarSistema();
    });

    // =============================================
    // 7. INICIAR SISTEMA DE TRILHAS
    // =============================================
    function iniciarSistema() {
        console.log('🚀 Iniciando sistema de trilhas...');
        
        const personaData = JSON.parse(localStorage.getItem('trilhas_persona'));
        console.log('📊 Persona:', personaData);
        
        const trilhaRecomendada = personaData?.trilhaRecomendada || 'infantil';
        console.log('🎯 Trilha recomendada:', trilhaRecomendada);
        
        mostrarTrilhaRecomendada(trilhaRecomendada);
        carregarProgresso();
    }

    function mostrarTrilhaRecomendada(trilhaId) {
        const todasTrilhas = document.querySelectorAll('.trilha-duolingo');
        console.log('📚 Trilhas encontradas:', todasTrilhas.length);
        
        todasTrilhas.forEach(el => {
            el.style.display = 'none';
        });

        const trilha = document.querySelector(`.trilha-duolingo[data-trilha="${trilhaId}"]`);
        if (trilha) {
            console.log('✅ Trilha encontrada:', trilhaId);
            trilha.style.display = 'block';
            
            const header = trilha.querySelector('.trilha-duolingo-header');
            if (header) {
                header.querySelectorAll('.trilha-recomendada-badge, .trilha-desbloqueada-badge').forEach(el => el.remove());
                
                const badge = document.createElement('span');
                badge.className = 'trilha-recomendada-badge';
                badge.innerHTML = '🌟 Recomendada para você';
                badge.style.cssText = `
                    display: inline-block;
                    background: linear-gradient(135deg, #f59e0b, #fbbf24);
                    color: #fff;
                    font-size: 11px;
                    font-weight: 700;
                    padding: 4px 14px;
                    border-radius: 20px;
                    margin-left: 12px;
                    white-space: nowrap;
                `;
                const infoDiv = header.querySelector('.trilha-duolingo-info div');
                if (infoDiv) {
                    infoDiv.appendChild(badge);
                }
            }
        } else {
            console.error('❌ Trilha não encontrada:', trilhaId);
            // Fallback: mostra a primeira trilha
            const primeiraTrilha = document.querySelector('.trilha-duolingo');
            if (primeiraTrilha) {
                primeiraTrilha.style.display = 'block';
                console.log('⚠️ Fallback: mostrando primeira trilha');
            }
        }
    }

    // =============================================
    // 8. CARREGAR PROGRESSO E ATUALIZAR UI
    // =============================================
    function carregarProgresso() {
        const progress = getProgress();
        console.log('📊 Progresso carregado:', progress);
        atualizarUI(progress);
        verificarDesbloqueioProximaTrilha();
    }

    function verificarDesbloqueioProximaTrilha() {
        const ordem = ['infantil', 'jovem', 'adulta'];
        const personaData = JSON.parse(localStorage.getItem('trilhas_persona'));
        const trilhaAtual = personaData?.trilhaRecomendada || 'infantil';
        const indexAtual = ordem.indexOf(trilhaAtual);
        
        const fasesConcluidas = getFasesCompletasCount(trilhaAtual);
        const totalFases = getTotalFases(trilhaAtual);
        
        if (fasesConcluidas >= totalFases && indexAtual < ordem.length - 1) {
            const proximaTrilha = ordem[indexAtual + 1];
            const trilhaElement = document.querySelector(`.trilha-duolingo[data-trilha="${proximaTrilha}"]`);
            if (trilhaElement) {
                trilhaElement.style.display = 'block';
                
                const header = trilhaElement.querySelector('.trilha-duolingo-header');
                if (header) {
                    header.querySelectorAll('.trilha-recomendada-badge, .trilha-desbloqueada-badge').forEach(el => el.remove());
                    
                    const badge = document.createElement('span');
                    badge.className = 'trilha-desbloqueada-badge';
                    badge.innerHTML = '🔓 Desbloqueada!';
                    badge.style.cssText = `
                        display: inline-block;
                        background: linear-gradient(135deg, #10b981, #34d399);
                        color: #fff;
                        font-size: 11px;
                        font-weight: 700;
                        padding: 4px 14px;
                        border-radius: 20px;
                        margin-left: 12px;
                        white-space: nowrap;
                    `;
                    const infoDiv = header.querySelector('.trilha-duolingo-info div');
                    if (infoDiv) {
                        infoDiv.appendChild(badge);
                    }
                }
            }
        }
    }

    // =============================================
    // 9. ATUALIZAÇÃO DA UI (ESTILO DUOLINGO)
    // =============================================
    function atualizarUI(progress) {
        const totalMedalhas = document.getElementById('totalMedalhas');
        const totalFases = document.getElementById('totalFases');
        const totalPontos = document.getElementById('totalPontos');
        
        if (totalMedalhas) totalMedalhas.textContent = progress.medalhas.length;
        if (totalFases) totalFases.textContent = progress.fasesCompletas.length;
        if (totalPontos) totalPontos.textContent = progress.pontos || 0;

        ['infantil', 'jovem', 'adulta'].forEach(trilhaId => {
            const fasesConcluidas = getFasesCompletasCount(trilhaId);
            const totalFasesTrilha = getTotalFases(trilhaId);
            const isDesbloqueada = isTrilhaDesbloqueada(trilhaId);

            const progressText = document.getElementById(`progress${capitalize(trilhaId)}`);
            const progressFill = document.getElementById(`progressFill${capitalize(trilhaId)}`);
            
            if (progressText) progressText.textContent = `${fasesConcluidas}/${totalFasesTrilha}`;
            if (progressFill) {
                const percent = totalFasesTrilha > 0 ? (fasesConcluidas / totalFasesTrilha) * 100 : 0;
                progressFill.style.width = `${percent}%`;
            }

            const caminho = document.getElementById(`caminho${capitalize(trilhaId)}`);
            if (!caminho) return;

            const fases = caminho.querySelectorAll('.fase-duolingo');
            fases.forEach((faseElement, index) => {
                const faseId = index + 1;
                const status = getFaseStatus(trilhaId, faseId);

                faseElement.dataset.completed = status.isComplete ? 'true' : 'false';
                faseElement.dataset.locked = status.isLocked ? 'true' : 'false';

                const circle = faseElement.querySelector('.fase-duolingo-circle');
                if (circle) {
                    if (status.isComplete) {
                        circle.style.background = '#10b981';
                        circle.style.borderColor = '#10b981';
                    } else if (status.isAvailable) {
                        circle.style.background = 'var(--primary-light)';
                        circle.style.borderColor = 'var(--primary)';
                    } else {
                        circle.style.background = 'var(--border-color)';
                        circle.style.borderColor = 'var(--border-color)';
                    }
                }

                const numberEl = faseElement.querySelector('.fase-duolingo-number');
                if (numberEl) {
                    if (status.isComplete) {
                        numberEl.textContent = '✓';
                        numberEl.style.background = '#10b981';
                        numberEl.style.color = '#fff';
                        numberEl.style.borderColor = '#10b981';
                    } else if (status.isAvailable) {
                        numberEl.textContent = faseId;
                        numberEl.style.background = 'var(--primary)';
                        numberEl.style.color = '#fff';
                        numberEl.style.borderColor = 'var(--primary)';
                    } else {
                        numberEl.textContent = faseId;
                        numberEl.style.background = 'var(--bg-white)';
                        numberEl.style.color = 'var(--text-muted)';
                        numberEl.style.borderColor = 'var(--border-color)';
                    }
                }

                const statusBadge = faseElement.querySelector('.fase-duolingo-status');
                if (statusBadge) {
                    if (status.isComplete) {
                        statusBadge.textContent = '✅ Concluído';
                        statusBadge.dataset.status = 'completed';
                    } else if (status.isLocked) {
                        statusBadge.textContent = '⏳ Próximo Passo';
                        statusBadge.dataset.status = 'locked';
                    } else {
                        statusBadge.textContent = '🔓 Disponível';
                        statusBadge.dataset.status = 'available';
                    }
                }

                const btnPrimary = faseElement.querySelector('.fase-duolingo-btn-primary');
                const btnSecondary = faseElement.querySelector('.fase-duolingo-btn-secondary');
                const btnDisabled = faseElement.querySelector('.fase-duolingo-btn-disabled');

                if (btnPrimary) btnPrimary.style.display = 'none';
                if (btnSecondary) btnSecondary.style.display = 'none';
                if (btnDisabled) btnDisabled.style.display = 'none';

                if (status.isComplete) {
                    if (btnSecondary) {
                        btnSecondary.style.display = 'inline-flex';
                        btnSecondary.innerHTML = `<i class="fa-solid fa-rotate-left"></i> Revisar`;
                        btnSecondary.onclick = () => abrirFase(trilhaId, faseId);
                        btnSecondary.style.pointerEvents = 'auto';
                        btnSecondary.style.opacity = '1';
                    }
                } else if (status.isAvailable) {
                    if (btnPrimary) {
                        btnPrimary.style.display = 'inline-flex';
                        btnPrimary.innerHTML = `<i class="fa-solid fa-play"></i> Começar`;
                        btnPrimary.onclick = () => abrirFase(trilhaId, faseId);
                        btnPrimary.style.pointerEvents = 'auto';
                        btnPrimary.style.opacity = '1';
                    }
                } else {
                    if (btnDisabled) {
                        btnDisabled.style.display = 'inline-flex';
                        if (!isDesbloqueada && index === 0) {
                            btnDisabled.innerHTML = `<i class="fa-solid fa-lock"></i> Complete a trilha anterior`;
                        } else {
                            btnDisabled.innerHTML = `<i class="fa-solid fa-chevron-right"></i> Passo Seguinte`;
                        }
                        btnDisabled.disabled = true;
                    }
                }

                const linha = faseElement.querySelector('.fase-duolingo-linha');
                if (linha) {
                    const isPreviousComplete = index === 0 || isFaseCompleta(trilhaId, index);
                    if (isPreviousComplete) {
                        linha.style.background = '#10b981';
                        linha.style.display = 'block';
                    } else {
                        linha.style.background = 'var(--border-color)';
                        linha.style.display = 'block';
                    }
                }
            });
        });

        ['infantil', 'jovem', 'adulta'].forEach(trilhaId => {
            const conclusao = document.getElementById(`conclusao${capitalize(trilhaId)}`);
            if (conclusao) {
                const fasesConcluidas = getFasesCompletasCount(trilhaId);
                const totalFasesTrilha = getTotalFases(trilhaId);
                conclusao.style.display = fasesConcluidas >= totalFasesTrilha ? 'block' : 'none';
            }
        });

        // Atualizar medalhas
        const medalhas = document.querySelectorAll('.medalha-item');
        const medalhasMap = {
            'explorador-sentidos': 'Explorador dos Sentidos',
            'mestre-curiosidade': 'Mestre da Curiosidade',
            'amigo-coracao': 'Amigo do Coração',
            'estrategista-energia': 'Estrategista de Energia',
            'mente-criativa': 'Mente Criativa',
            'resiliencia': 'Resiliência',
            'consciencia-pessoal': 'Consciência Pessoal',
            'foco-potencial': 'Foco no Potencial',
            'autonomia': 'Autonomia'
        };

        medalhas.forEach(item => {
            const medalhaId = item.dataset.medalha;
            const medalhaNome = medalhasMap[medalhaId];
            const temMedalha = progress.medalhas.some(m => m === medalhaNome);

            item.classList.toggle('earned', temMedalha);
            item.classList.toggle('locked', !temMedalha);

            const badge = item.querySelector('.medalha-badge');
            if (badge) {
                if (temMedalha) {
                    badge.textContent = '🏅 Conquistado!';
                    badge.className = 'medalha-badge earned';
                } else {
                    badge.textContent = '🔒 Bloqueado';
                    badge.className = 'medalha-badge locked';
                }
            }
        });
    }

    function capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    // =============================================
    // 10. MODAL DA FASE
    // =============================================
    let faseAtual = null;
    let respostasFase = [];
    let perguntaAtual = 0;

    function abrirFase(trilhaId, faseId) {
        const trilha = TRILHAS_DATA[trilhaId];
        if (!trilha) {
            console.error('❌ Trilha não encontrada:', trilhaId);
            return;
        }
        
        const fase = trilha.fases.find(f => f.id === faseId);
        if (!fase) {
            console.error('❌ Fase não encontrada:', trilhaId, faseId);
            return;
        }

        const status = getFaseStatus(trilhaId, faseId);
        if (status.isLocked && !status.isComplete) {
            console.warn('🔒 Fase bloqueada:', trilhaId, faseId);
            return;
        }

        console.log('📖 Abrindo fase:', fase.nome);

        faseAtual = { trilhaId, faseId, fase };
        respostasFase = [];
        perguntaAtual = 0;

        const modalIcon = document.getElementById('faseModalIcon');
        const modalName = document.getElementById('faseModalName');
        const modalOverlay = document.getElementById('faseModalOverlay');
        const modalBg = document.getElementById('faseModalOverlayBg');

        if (modalIcon) modalIcon.textContent = fase.icon;
        if (modalName) modalName.textContent = fase.nome;
        if (modalOverlay) modalOverlay.hidden = false;
        if (modalBg) modalBg.hidden = false;
        document.body.style.overflow = 'hidden';

        renderizarPergunta();
    }

    function fecharFaseModal() {
        const modalOverlay = document.getElementById('faseModalOverlay');
        const modalBg = document.getElementById('faseModalOverlayBg');
        
        if (modalOverlay) modalOverlay.hidden = true;
        if (modalBg) modalBg.hidden = true;
        document.body.style.overflow = '';
        faseAtual = null;
        respostasFase = [];
        perguntaAtual = 0;
    }

    function renderizarPergunta() {
        const fase = faseAtual?.fase;
        if (!fase) return;

        const perguntas = fase.perguntas;
        const total = perguntas.length;

        if (perguntaAtual >= total) {
            finalizarFase();
            return;
        }

        const pergunta = perguntas[perguntaAtual];
        const body = document.getElementById('faseModalBody');

        if (!body) return;

        body.innerHTML = `
            <div class="fase-question">
                <div class="fase-question-text">${pergunta.texto}</div>
                <div class="fase-options" id="faseOptions">
                    ${pergunta.opcoes.map((opcao, index) => `
                        <label class="fase-option" data-index="${index}">
                            <input type="radio" name="faseResposta" value="${index}">
                            <span class="fase-option-label">${opcao}</span>
                        </label>
                    `).join('')}
                </div>
            </div>
        `;

        const stepEl = document.getElementById('faseStep');
        const progressFill = document.getElementById('faseProgressFill');
        
        if (stepEl) stepEl.textContent = `${perguntaAtual + 1}/${total}`;
        if (progressFill) {
            const progressPercent = ((perguntaAtual + 1) / total) * 100;
            progressFill.style.width = `${progressPercent}%`;
        }

        const btn = document.getElementById('faseBtnNext');
        if (btn) {
            btn.disabled = true;
            btn.textContent = perguntaAtual === total - 1 ? '✨ Ver resultado' : 'Próximo →';
        }

        document.querySelectorAll('.fase-option input[type="radio"]').forEach(input => {
            input.addEventListener('change', () => {
                const selected = parseInt(input.value);
                const allOptions = document.querySelectorAll('.fase-option');
                allOptions.forEach(el => el.classList.toggle('selected', parseInt(el.dataset.index) === selected));
                if (btn) btn.disabled = false;
            });
        });

        document.removeEventListener('keydown', handleFaseEnter);
        document.addEventListener('keydown', handleFaseEnter);
    }

    function handleFaseEnter(e) {
        if (e.key === 'Enter') {
            const btn = document.getElementById('faseBtnNext');
            if (btn && !btn.disabled) {
                btn.click();
            }
        }
    }

    function finalizarFase() {
        const fase = faseAtual?.fase;
        const trilhaId = faseAtual?.trilhaId;
        const faseId = faseAtual?.faseId;
        
        if (!fase || !trilhaId || !faseId) return;

        if (isFaseCompleta(trilhaId, faseId)) {
            fecharFaseModal();
            return;
        }

        const resultado = fase.resultado(respostasFase);

        const progress = getProgress();
        const faseKey = { trilha: trilhaId, fase: faseId };
        
        if (!progress.fasesCompletas.some(f => f.trilha === faseKey.trilha && f.fase === faseKey.fase)) {
            progress.fasesCompletas.push(faseKey);
            
            if (!progress.medalhas.includes(fase.medalha)) {
                progress.medalhas.push(fase.medalha);
            }
            
            progress.pontos = (progress.pontos || 0) + 10;
            
            saveProgress(progress);
        }

        fecharFaseModal();

        const conclusaoIcon = document.getElementById('conclusaoMedalhaIcon');
        const conclusaoNome = document.getElementById('conclusaoMedalhaNome');
        const conclusaoDesc = document.getElementById('conclusaoMedalhaDesc');
        const conclusaoResultado = document.getElementById('conclusaoResultado');
        const conclusaoModal = document.getElementById('conclusaoModalOverlay');

        if (conclusaoIcon) conclusaoIcon.textContent = fase.medalhaIcon;
        if (conclusaoNome) conclusaoNome.textContent = fase.medalha;
        if (conclusaoDesc) conclusaoDesc.textContent = `Você completou "${fase.nome}"!`;
        if (conclusaoResultado) {
            conclusaoResultado.innerHTML = `
                <strong style="display:block;font-size:1.1rem;color:var(--text-dark);margin-bottom:6px;">${resultado.titulo}</strong>
                <p style="margin:0;line-height:1.6;color:var(--text-medium);">${resultado.texto}</p>
            `;
        }
        if (conclusaoModal) {
            conclusaoModal.hidden = false;
            document.body.style.overflow = 'hidden';
        }

        verificarDesbloqueioProximaTrilha();
    }

    // =============================================
    // 11. EVENTOS DOS MODAIS
    // =============================================
    document.getElementById('faseModalClose')?.addEventListener('click', fecharFaseModal);
    document.getElementById('faseModalOverlayBg')?.addEventListener('click', fecharFaseModal);

    document.getElementById('faseBtnNext')?.addEventListener('click', () => {
        const selected = document.querySelector('.fase-option input[type="radio"]:checked');
        if (!selected) return;

        respostasFase.push(parseInt(selected.value));
        perguntaAtual++;
        renderizarPergunta();
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const modalOverlay = document.getElementById('faseModalOverlay');
            const conclusaoModal = document.getElementById('conclusaoModalOverlay');
            
            if (modalOverlay && !modalOverlay.hidden) {
                fecharFaseModal();
            }
            if (conclusaoModal && !conclusaoModal.hidden) {
                conclusaoModal.hidden = true;
                document.body.style.overflow = '';
            }
        }
    });

    document.getElementById('conclusaoBtn')?.addEventListener('click', () => {
        const conclusaoModal = document.getElementById('conclusaoModalOverlay');
        if (conclusaoModal) {
            conclusaoModal.hidden = true;
            document.body.style.overflow = '';
        }
        document.querySelector('.medalhas-section')?.scrollIntoView({ behavior: 'smooth' });
    });

    // =============================================
    // 12. INICIALIZAÇÃO
    // =============================================
    console.log('🌱 Sistema de Trilhas com Quiz de Persona inicializado!');

    // Verifica se o usuário já tem persona
    const personaSalva = localStorage.getItem('trilhas_persona');
    const trilhaIniciada = localStorage.getItem('trilhas_iniciada');

    console.log('📌 personaSalva:', personaSalva);
    console.log('📌 trilhaIniciada:', trilhaIniciada);

    if (!personaSalva || !trilhaIniciada) {
        console.log('📝 Mostrando Quiz de Persona...');
        mostrarQuizPersona();
    } else {
        console.log('🚀 Iniciando sistema com persona existente...');
        iniciarSistema();
    }
});