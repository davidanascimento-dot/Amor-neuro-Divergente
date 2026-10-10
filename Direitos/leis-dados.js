/* ==========================================================================
   LEIS-DADOS.JS — a fonte única de verdade da biblioteca jurídica
   ==========================================================================

   PARA QUE ESTE ARQUIVO EXISTE
   --------------------------------------------------------------------------
   As mesmas leis estavam escritas em dois lugares ao mesmo tempo: no array
   `lawsDatabase`, dentro de `direitos.js`, e nos cards do documento
   "Nossas 3 Leis Aplicadas" (`Direitos/arquivo3leis/arquivo.html`). Dois
   lugares significa que um deles ia ficar desatualizado sem ninguém perceber.

   Aqui não existe lógica. É uma lista de objetos e nada mais: nenhuma
   função, nenhum evento, nenhuma consulta ao DOM. Quem lê é que decide o
   que fazer com o dado.

   O padrão `window.OBJETO = {...}` já é o do projeto — é assim que
   `imagens.js` expõe `window.IMAGENS` e `busca-indice.js` expõe
   `window.BUSCA_INDICE`. Este arquivo segue o mesmo formato para que
   qualquer pessoa que já editou um dos outros saiba editar este.

   ==========================================================================
   COMO LER OS CAMPOS
   ==========================================================================

   `id`       Identificador estável. É o que aparece na URL da página
              detalhada e o que os filtros usam. NUNCA mude o id de um
              registro que já foi publicado: um link que já circula na
              internet passa a apontar para outra lei. Para uma entrada
              nova, use o slug do nome, em minusculas e sem acento.

   `tipo`     "lei" ou "decreto". Nem tudo na biblioteca é lei — o Decreto
              5.296/2004 é decreto. Distinguir os dois é o que impede o site
              de chamar tudo de "lei" sem distinção.

   `base`     true nas três leis que sustentam o projeto e que têm página
              própria no documento "Nossas 3 Leis Aplicadas". Serve para
              gerar aquele documento a partir daqui em vez de escrevê-lo à mão.

   `temaDe`   Usado só pelos temas associados: guarda o id da lei de que o
              tema faz parte. Um tema não é uma lei — é um assunto que está
              dentro de uma lei. Sem este campo, um tema acabaria apontando
              para a lei errada.

   `status`   "revisado" | "incompleto" | "em-preparacao".
              **Não é enfeite.** O site informa isto à pessoa: um texto
              jurídico não conferido na fonte oficial não pode aparecer com
              a mesma cara de um conferido. Enquanto for "em-preparacao",
              a página detalhada mostra o aviso e leva direto ao texto
              oficial, sem inventar orientação.

   `conferidoEm`  Data da última conferência na fonte oficial, no formato
              AAAA-MM-DD. Só preencher depois de abrir a URL e ler.

   `url`      Endereço do texto no Planalto. **Testado um a um** — ver o
              rodapé deste arquivo, com o resultado de cada teste.

   ==========================================================================
   OS CAMPOS DE CONTEÚDO, E POR QUE ALGUNS FICAM VAZIOS
   ==========================================================================

   `resumo`, `garante[]`, `situacoes[]`, `artigos[]`, `orgaos[]` são os
   campos que a página detalhada vai usar para construir os três caminhos
   (aplicar / entender / consultar).

   Eles estão vazios ou incompletos **de propósito**. Um campo vazio diz
   "ainda não conferido". Um campo preenchido com duvida publicada como se
   fosse certeza é pior que um campo vazio, porque a pessoa que depende
   dele perde o direito de saber que aquilo não foi verificado.

   Para preencher um campo: abrir a `url` do registro, ler o dispositivo,
   e só então escrever a explicação — com o número do artigo ao lado.

   ========================================================================== */

(function () {
    'use strict';

    window.LEIS = [

        /* ==================================================================
           LBI — Lei Brasileira de Inclusão da Pessoa com Deficiência
           Lei nº 13.146, de 6 de julho de 2015
           LEI-PILOTO: é a que vai ter página detalhada primeiro.
           ================================================================== */
        {
            id: 'lbi',
            idAntigo: 2,
            categoria: 'social',
            icone: 'fa-solid fa-handshake',
            iconeClasse: 'law-icon-social',
            tipo: 'lei',
            numero: '13.146',
            ano: 2015,
            data: '2015-07-06',
            nomeOficial: 'Lei Brasileira de Inclusão da Pessoa com Deficiência',
            nomePopular: 'Lei Brasileira de Inclusão (LBI)',
            base: true,
            status: 'em-preparacao',
            conferidoEm: '2026-10-10',
            verificacao:
                'CONFERIDO 2026-10-10. Lei nº 13.146, de 6 de julho de 2015. popularly chamada de Estatuto da Pessoa com Deficiência — que é o mesmo texto, não outra lei.',
            url: 'http://www.planalto.gov.br/ccivil_03/_ato2015-2018/2015/lei/l13146.htm',

            artigoDestaque: null,
            garante: [],
            documentos: [],
            passos: [],

            observacao: 'Conteúdo em preparação. Nada foi publicado como orientação ' +
                'jurídica até a conferência na fonte oficial.',
            // ------------------------------------------------------------------
            // CONTEUDO VERIFICADO NA FONTE OFICIAL
            // ------------------------------------------------------------------
            // Lido no texto do Planalto em 2026-10-10. Cada bloco traz a
            // referencia do artigo, entao a origem de cada afirmacao fica
            // ligada a própria afirmacao.

            resumo: 'A LBI reúne os direitos das pessoas com deficiência em um texto só. É a lei mais importante desta biblioteca porque quase todo o resto se conecta a ela.',
            verificacao: 'CONFERIDO 2026-10-10 no texto oficial do Planalto, artigo por artigo. A lei recebeu alterações depois de 2015, entre elas as Leis 14.126/2021, 14.624/2023, 14.724/2023 e 15.249/2025. Por isso cada bloco aqui traz o link para conferir o texto vigente.',

            artigos: [
                {
                    ref: 'Art. 1º',
                    titulo: 'Para que serve esta lei',
                    simples: 'A LBI existe para "assegurar e promover, em condições de igualdade, o exercício dos direitos e das liberadoes fundamentais" das pessoas com deficiência. Ela não diz que você tem menos direitos: ela obriga o Estado e a sociedade a garantir que você exercita os mesmos direitos que todo mundo, sem obstaculos.',
                    exemplo: 'Você tem direito a entrar na biblioteca, no banco e no hospital. A LBI é o texto que diz que o mesmo caminho que os outros tem de ser acessível para você também.',
                    limite: 'Ela assegura o direito; ela não entrega nada por conta própria. O que dá direito é o cumprimento da lei.'
                },
                {
                    ref: 'Art. 2º',
                    titulo: 'Quem é considerado pessoa com deficiência',
                    simples: 'A lei considera pessoa com deficiência quem tem um impedimento de longo prazo que, junto com as barreiras do ambiente, impede a participação plena. Repare que a definição tem duas partes: a pessoa É a barreira. É por isso que nem toda neurodivergencia e automaticamente deficiência, mas também e por isso que o diagnóstico não e a única coisa que importa.',
                    exemplo: 'Duas pessoas com o mesmo diagnóstico podem ter situacoes jurídicas diferentes. Para uma, o barulho do escritório é um obstáculo sério; para outra, não é. A lei olha para o impacto real.',
                    limite: 'Quando a avaliação é necessária, ela é chamada de avaliação biopsicossocial e é feita por equipe multiprofissional, não só por um médico.'
                },
                {
                    ref: 'Art. 3º, VI',
                    titulo: 'Adaptações razoáveis',
                    simples: 'Adaptação razoável é "adaptação, modificação e ajuste necessário e adequado" para você exercer seus direitos. A lei não diz apenas que e bom adaptar: ela trata a adaptação como direito.',
                    exemplo: 'Tempo extra na prova, um tradutor de Libras na aula, uma sala mais silenciosa, um material em fonte ampliada: são adaptações razoáveis quando necessárias.',
                    limite: 'A palavra "razoável" está na lei de propósito: a adaptação não pode acarretar ônus desproporcional e indevido. É a recusa em fazer adaptação razoável e, ela mesma, forma de discriminação (art. 4o, parágrafo 1o).'
                },
                {
                    ref: 'Art. 3º, XII, XIII e XIV',
                    titulo: 'Acompanhante, atendente pessoal e apoio escolar',
                    simples: 'A lei separa três figuras que costumam ser confundidas.\n\nAcompanhante: quem acompanha a pessoa com deficiência, e pode ou não desempenhar as funções de atendente pessoal.\n\nAtendente pessoal: quem assiste ou presta cuidados basicos e essenciais nas atividades do dia a dia, remunerado ou não, da família ou não.\n\nProfissional de apoio escolar: quem cuida de alimentacao, higiene e locomocao do estudante e atua nas atividades escolares.\n\nA diferenca está no escopo. Atendente pessoal cobre a vida diaria; apoio escolar cobre a rotina da escola.',
                    exemplo: 'Na consulta médica, quem te acompanha é acompanhante. Se alguém precisa te ajudar a tomar banho e comer todos os dias, essa pessoa é atendente pessoal. Na escola, quem ajuda na higiene e na locomocao e o profissional de apoio escolar.',
                    limite: 'Atendente pessoal e apoio escolar excluem as técnicas ou os procedimentos identificados com profissões legalmente estabelecidas. Esses papéis não substituem profissional de saúde nem substituem o que a lei reserva a outras profissões.'
                },
                {
                    ref: 'Art. 4º e parágrafo 1º',
                    titulo: 'Igualdade e não discriminação',
                    simples: 'Nenhuma pessoa com deficiência pode sofrer discriminação. A lei define discriminação como "toda forma de distinção, restrição ou exclusão, por ação ou omissão" que prejudique os direitos. Entre as formas que ela nomeia estão a recusa de adaptações razoáveis e a recusa de fornecimento de tecnologias assistivas.',
                    exemplo: 'Negar uma vaga ou um serviço por causa de um diagnóstico é discriminação. Recusar uma adaptação que a pessoa pediu também é.',
                    limite: 'A pessoa não é obrigada a fruir de benefícios decorrentes de ação afirmativa (parágrafo 2º). Isso não tira direito nenhum dela.'
                },
                {
                    ref: 'Art. 9º e parágrafo 1º',
                    titulo: 'Atendimento prioritário',
                    simples: 'Você tem direito a atendimento prioritário em bancos, serviços públicos, transporte e repartições. Esse direito se estende ao seu acompanhante ou atendente pessoal.',
                    exemplo: 'Na fila do banco, do hospital ou do ponto de ônibus, você e quem está com você têm prioridade de atendimento.',
                    limite: 'A extensão ao acompanhante não alcança dois itens: a restituição de imposto de renda (inciso VI) e a tramitação processual e judicial (inciso VII). Em emergências médicas, a prioridade segue os protocolos de atendimento (parágrafo 2º).'
                },
                {
                    ref: 'Art. 18, § 4º, V, e Art. 22',
                    titulo: 'Acompanhante no atendimento de saúde',
                    simples: 'Se você está internada ou em observação, a lei assegura o direito a acompanhante ou atendente pessoal e obriga o órgão ou instituição a proporcionar condições adequadas para a permanência em tempo integral.',
                    exemplo: 'Se você está internada e precisa de alguém para te ajudar a comer, ir ao banheiro ou se acalmar, você pode pedir acompanhante. A instituição precisa facilitar a permanência.',
                    limite: 'Se a presença não for possível, o profissional de saúde responsável pelo tratamento precisa justificar por escrito. É essa justificativa escrita que você pode pedir.'
                },
                {
                    ref: 'Art. 21',
                    titulo: 'Atendimento fora do município de residência',
                    simples: 'Quando os meios de atenção à saúde se esgotam no lugar onde você mora, o atendimento deve ser prestado fora do domicílio, com transporte e acomodação garantidas para você e para o acompanhante.',
                    exemplo: 'Se o único tratamento que você precisa fica a horas de distância, o plano de saúde ou o SUS devem pagar a ida e a hospedagem.',
                    limite: 'A lei fala em meios esgotados no local de residência. Não é um direito de escolher tratamento em qualquer lugar; e o direito de receber atenção mesmo morando longe do serviço.'
                },
                {
                    ref: 'Art. 23 e Art. 25',
                    titulo: 'Plano de saúde',
                    simples: 'A lei veda todas as formas de discriminação contra a pessoa com deficiência, inclusive a cobrança de valores diferenciados por planos e seguros privados de saúde. É assegurado o acesso aos serviços de saúde, públicos e privados, bem como as informações prestadas e recebidas, por meio de tecnologia assistiva e de todas as formas de comunicação previstas no art. 3o.',
                    exemplo: 'Se o plano nega um atendimento que oferece aos demais clientes, ou cobra mais porque você é pessoa com deficiência, isso pode ser discriminação.',
                    limite: 'A negação precisa ser avaliada caso a caso. Este texto não diz que toda recusa de plano é ilegal; diz o que a lei veda.'
                },
                {
                    ref: 'Art. 27 e Art. 28',
                    titulo: 'Educação inclusiva e adaptações',
                    simples: 'A lei diz que "a educação constitui direito da pessoa com deficiência". Ela obriga o poder público a criar sistema educacional inclusivo e a garantir, entre outras coisas: adaptações razoáveis para acesso ao curriculo em igualdade de condições, oferta de profissionais de apoio escolar, oferta de Libras, Braille e tecnologia assistiva, e participação do estudante e da família nas decisões da escola.',
                    exemplo: 'Adaptar a avaliação, permitir ledor, oferecer apoio de organização, manter a rotina previsível: tudo isso cabe como adaptação razoável.',
                    limite: 'O parágrafo 1º do art. 28 protege o bolso da família: nas escolas privadas é vedada a cobrança de valores adicionais de qualquer natureza nas mensalidades para cumprir essas determinações.'
                },
                {
                    ref: 'Art. 28, IV, XI e XII',
                    titulo: 'Libras e comunicação',
                    simples: 'A lei prevê oferta de educação bilíngue em Libras, formação e disponibilização de tradutores e intérpretes de Libras, e oferta do ensino de Libras e do Sistema Braille.',
                    exemplo: 'Pedir intérprete de Libras em uma reunião ou em uma aula e um direito previsto na lei.',
                    limite: 'O parágrafo 2º do art. 28 traz requisitos: em educação básica, os tradutores e intérpretes de Libras devem ter ensino médio completo e certificado de proficiência.'
                },
                {
                    ref: 'Art. 30',
                    titulo: 'Faculdade e vestibulares',
                    simples: 'Em processos seletivos de ensino superior, a lei prevê formulário de inscrição com campos para informar os recursos necessários, provas em formatos acessíveis, recursos de acessibilidade e tecnologia assistiva, e dilatação de tempo, ou seja, mais tempo para fazer a prova.',
                    exemplo: 'Se você precisa de mais tempo no vestibular porque o tempo padrão não cabe com a sua forma de processar informação, esse direito existe.',
                    limite: 'A dilatação depende de prévia solicitação é comprovação da necessidade. Pedir na hora do teste, sem ter pedido antes, é outra situação.'
                },
                {
                    ref: 'Art. 34, § 3º',
                    titulo: 'Trabalho: vedada exigência de aptidão plena',
                    simples: 'A lei veda restrição ao trabalho da pessoa com deficiência e qualquer discriminação em razão da sua condição, inclusive nas etapas de recrutamento, seleção, contratação, admissão, exames admissional e periódico. É proibe a exigência de aptidão plena.',
                    exemplo: 'Se a empresa exige que você seja apto para tudo e você não é, isso pode ser discriminação. Recusar você só porque você pediu adaptação para o seu tipo de funcionamento também.',
                    limite: 'Isso não significa que a empresa tenha que aceitar qualquer coisa. Significa que a exigência tem que ser legal, necessária e razoável, e que a resposta padrão não pode ser você.'
                },
                {
                    ref: 'Art. 37',
                    titulo: 'Trabalho com apoio',
                    simples: 'A lei prevê um segundo modo de inclusão além da contratação: o trabalho com apoio. A empresa fornece suportes individualizados que atendam às necessidades específicas da pessoa, inclusive recursos de tecnologia assistiva, agente facilitador e apoio no ambiente de trabalho.',
                    exemplo: 'Se você consegue o trabalho, mas precisa de alguém que te ajude a organizar as tarefas e a se comunicar com o time, isso pode ser trabalho com apoio.',
                    limite: 'A lei também fala em respeito ao perfil vocacional e ao interesse da pessoa apoiada. Apoiar não é decidir por ela.'
                },
                {
                    ref: 'Art. 40',
                    titulo: 'Benefício de Prestação Continuada (BPC)',
                    simples: 'A LBI assegura a pessoa com deficiência que não possua meios para prover a própria subsistência nem de tê-la provida por sua família o benefício mensal de um salário mínimo. A regra está descrita na Lei 8.742/1993.',
                    exemplo: 'O BPC é aquele benefício de um salário mínimo para pessoa com deficiência em situação de vulnerabilidade.',
                    limite: 'A LBI remete a Lei 8.742/1993: os critérios de renda e de avaliação são os dela, não os da LBI.'
                }
            ],

            situacoes: [
                {
                    id: 'escola',
                    rotulo: 'Na escola ou na faculdade',
                    pergunta: 'A escola está atrapalhando a minha aprendizagem de alguma forma?',
                    direito: 'Educação e direito, com sistema inclusivo e adaptações razoáveis',
                    artigos: 'Art. 27, 28 e 30',
                    passos: [
                        'Anote o que acontece de forma concreta: quanto tempo a tarefa leva, qual barulho atrapalha, o que você não consegue fazer do jeito deles.',
                        'Escreva um requerimento para a coordenação, pedindo a adaptação específica. Peça por escrito e guarde a data.',
                        'Peça protocolo do que foi entregue.',
                        'Se não houver resposta, o caminho é a Secretaria de Educação e, se persistir, o Ministério Público.'
                    ],
                    documentos: [
                        'Documento com seu nome',
                        'Registro das adaptações pedidas, com data'
                    ],
                    observacao: 'As adaptações do art. 28 não podem gerar cobrança adicional na mensalidade da escola privada.'
                },
                {
                    id: 'trabalho',
                    rotulo: 'No trabalho',
                    pergunta: 'Estou sendo discriminado no emprego?',
                    direito: 'Direito ao trabalho sem discriminação e sem exigência de aptidão plena',
                    artigos: 'Art. 34 e Art. 37',
                    passos: [
                        'Registre o que aconteceu, com data, hora e o nome de quem estava presente.',
                        'Guarde o que prova: e-mails, mensagens, print de conversa.',
                        'Se o problema é a falta de adaptação, peça por escrito ao RH e peça protocolo.',
                        'Se você precisa de apoio no dia a dia no trabalho, cite o art. 37, que prevê agente facilitador e tecnologia assistiva.'
                    ],
                    documentos: [
                        'Contrato ou comprovante de vínculo',
                        'Registro de ocorrências'
                    ],
                    observacao: 'Demissão por ser neurodivergente e discriminação. Preserve os registros antes de qualquer conversa formal.'
                },
                {
                    id: 'saude',
                    rotulo: 'Na saúde',
                    pergunta: 'Fui negado no plano de saúde ou não tive acompanhante?',
                    direito: 'Sem discriminação em plano de saúde e com direito a acompanhante',
                    artigos: 'Art. 21, 22, 23 e 25',
                    passos: [
                        'Peça a negativa por escrito, com o motivo. Sem o motivo escrito, a discussão fica difícil depois.',
                        'Se foi negada cobertura que o plano oferece aos demais clientes, isso pode ser discriminação e falta de cobertura.',
                        'Se você estava internada e não teve acompanhante, peça a justificativa por escrito.',
                        'Guarde tudo: número de protocolo, nome de quem atendeu, data.'
                    ],
                    documentos: [
                        'Carteira do plano ou cartão do SUS',
                        'Pedido de negativa por escrito'
                    ],
                    observacao: 'Para recorrer de um plano, o caminho habitual é o órgão regulador do próprio plano, além da via judicial.'
                },
                {
                    id: 'acompanhante',
                    rotulo: 'Acompanhante e apoio',
                    pergunta: 'Preciso de alguém para me ajudar no dia a dia. A lei me garante?',
                    direito: 'Acompanhante, atendente pessoal e apoio escolar são figuras distintas',
                    artigos: 'Art. 3º, XII, XIII e XIV; art. 9º; art. 22',
                    passos: [
                        'Defina qual papel a pessoa vai exercer: acompanhante, atendente pessoal ou apoio escolar. As garantias mudam de um para o outro.',
                        'Na saúde, se você estiver internada, exerça o direito do art. 22 e peça as condições de permanência.',
                        'Na escola, peça profissional de apoio escolar, previsto no art. 28, inciso XVII.',
                        'Atenção: acompanhante não é sinônimo de atendente pessoal. A lei distingue os dois.'
                    ],
                    documentos: [
                        'Documento de identidade da pessoa que vai ajudar'
                    ],
                    observacao: 'Os três papéis estão no art. 3º, incisos XII, XIII e XIV. Se você recebeu informação de que são a mesma coisa, o texto da lei diz o contrario.'
                },
                {
                    id: 'comunicacao',
                    rotulo: 'Comunicação e acessibilidade',
                    pergunta: 'Ninguém entende o que eu tento dizer. Isso é um direito?',
                    direito: 'Comunicação acessível é direito, e recusa de adaptação é discriminação',
                    artigos: 'Art. 3º, V e VI; art. 4º; art. 28',
                    passos: [
                        'Peça em registro oficial, por escrito, a adaptação de que você precisa: intérprete de Libras, linguagem simples, texto ampliado ou tempo adicional.',
                        'Peça protocolo do pedido.',
                        'A recusa em fazer adaptação razoável e, ela mesma, discriminação.'
                    ],
                    documentos: [],
                    observacao: 'A LBI inclui linguagem simples entre as formas de comunicação previstas no art. 3o, inciso V.'
                },
                {
                    id: 'bpc',
                    rotulo: 'Benefício de Prestação Continuada',
                    pergunta: 'Recebo menos do que eu poderia?',
                    direito: 'A LBI assegura um salário mínimo; os critérios estão na Lei 8.742/1993',
                    artigos: 'Art. 40',
                    passos: [
                        'A LBI assegura o benefício; os requisitos de renda e a avaliação seguem a Lei 8.742/1993, que também está nesta biblioteca.',
                        'O local de entrada e o CRAS ou a Secretaria de Assistência Social do seu município.',
                        'Guarde o protocolo do requerimento.'
                    ],
                    documentos: [
                        'Documento de identidade',
                        'Comprovante de renda',
                        'Laudo ou avaliação, se houver'
                    ],
                    observacao: 'Veja também o registro da Lei do BPC na biblioteca.'
                }
            ],

            orgaos: [
                { nome: 'Defensoria Pública',
                  quando: 'Quando a resposta é recusada e você precisa de apoio na hora.',
                  escopo: 'Apoio jurídico gratuito para quem não tem condições de arcar com advogado.',
                  custo: 'Gratuito' },
                { nome: 'Ministério Público',
                  quando: 'Quando a violação é coletiva ou a instituição segue errando.',
                  escopo: 'Fiscaliza a aplicação da lei e pode agir contra o órgão que descumpre.',
                  custo: 'Gratuito' },
                { nome: 'CRAS e Secretaria de Assistência Social',
                  quando: 'Para benefício e orientação sobre direitos assistenciais.',
                  escopo: 'Atendimento social, orientação sobre benefícios e encaminhamento.',
                  custo: 'Gratuito' },
                { nome: 'Secretaria de Educação do estado ou do município',
                  quando: 'Quando a escola não atende a adaptação pedida.',
                  escopo: 'Resolução de conflitos sobre adaptações e apoio escolar.',
                  custo: 'Gratuito' },
                { nome: 'Disque 100, Direitos Humanos',
                  quando: 'Para registrar uma violação rapidamente.',
                  escopo: 'Canal de denúncia sobre discriminação, anônima ou identificada.',
                  custo: 'Gratuito' }
            ],

            limites: [
                'Nada nesta página garante resultado. A LBI assegura direitos; o que depende de cada situação e a aplicação deles.',
                'Adaptação razoável significa adaptação que não gera ônus desproporcional. É um conceito que o caso concreto define.',
                'A maior parte dos direitos aqui citados precisa de pedido, registro ou comprovação. Nenhum deles se aplica automaticamente.',
                'Esta página explica a lei em linguagem simples. Ela não substitui aconselhamento jurídico individual.'
            ],
        },

        /* ------------------------------------------------------------------
           BERENICE PIANA — Lei nº 12.764, de 27 de novembro de 2012
           Traz a pessoa com TEA para o mesmo regime da LBI.
           ------------------------------------------------------------------ */
        {
            id: 'berenice-piana',
            idAntigo: 1,
            categoria: 'saude',
            icone: 'fa-solid fa-heart-pulse',
            iconeClasse: 'law-icon-saude',
            tipo: 'lei',
            numero: '12.764',
            ano: 2012,
            data: '2012-11-27',
            nomeOficial: 'Lei nº 12.764, de 27 de novembro de 2012',
            nomePopular: 'Lei Berenice Piana',
            base: true,
            status: 'em-preparacao',
            conferidoEm: '2026-10-10',
            url: 'http://www.planalto.gov.br/ccivil_03/_ato2011-2014/2012/lei/l12764.htm',

            resumo: 'Estabelece direitos da pessoa com Transtorno do Espectro Autista, garantindo acesso à educação e serviços públicos.',

            artigoDestaque: null,
            garante: [],
            documentos: [],
            passos: [],

            // ------------------------------------------------------------------
            // CONTEUDO VERIFICADO NA FONTE OFICIAL
            // ------------------------------------------------------------------
            verificacao: 'CONFERIDO 2026-10-10 no texto oficial do Planalto, artigo por artigo, na redação vigente. Os artigos citados foram lidos um a um. A lei não recebeu alteração no art. 1º § 2º nem no art. 7º desde 2012; o art. 3º e o art. 2º receberam alterações em 2025.',

            artigos: [
                {
                    ref: 'Art. 1º, § 2º',
                    titulo: 'A pessoa com TEA é pessoa com deficiência',
                    simples: 'A lei diz, em uma frase: "A pessoa com transtorno do espectro autista é considerada pessoa com deficiência, para todos os efeitos legais." Não há cláusula, exceção nem "desde que": para todos os efeitos.',
                    exemplo: 'Se um órgão disser que você não tem direito a algo porque a Lei Berenice Piana "só fala de criança", a lei está escrita ao contrário — vale mostrar este parágrafo.',
                    limite: 'Estar dentro da Berenice Piana é estar dentro do regime da LBI: são leis diferentes que conversam.'
                },
                {
                    ref: 'Art. 1º, § 1º',
                    titulo: 'O que a lei entende por transtorno do espectro autista',
                    simples: 'A lei descreve o TEA por dois blocos: um de comunicação e interação social, e outro de comportamentos e interesses. Quem tem diagnóstico fora desses dois blocos pode, pelo texto da lei, não estar nesta lei. Isso não significa que não tem direito ao que a LBI garante.',
                    exemplo: 'Uma pessoa com TDAH, por exemplo, não é TEA pela definição deste parágrafo. Ela continua pessoa com deficiência nos termos da LBI quando o impacto funcional se confirma.',
                    limite: 'A definição é da lei, não do senso comum. Ela não serve para decidir, sozinha, o que alguém é.'
                },
                {
                    ref: 'Art. 2º',
                    titulo: 'As diretrizes da política nacional',
                    simples: 'A lei lista o que o país deve fazer: trabalhar entre setores, ouvir a comunidade na formulação das políticas, dar atenção integral à saúde, estimular a inserção no trabalho, informar a população, formar profissionais e famílias, e pesquisar.',
                    exemplo: 'Quando o atendimento falha, esta lista mostra que a falha não é culpa de uma pessoa: é de um sistema que não cruzou os setores.',
                    limite: 'São diretrizes, não prazos. Não há na lei uma data para o serviço existir.'
                },
                {
                    ref: 'Art. 3º, III',
                    titulo: 'Saúde: diagnóstico, multiprofissional, remédio e nutrição',
                    simples: 'O acesso à saúde inclui cinco coisas nomeadas na lei: diagnóstico precoce — "ainda que não definitivo" —, atendimento multiprofissional, nutrição adequada e terapia nutricional, medicamentos, e informações que ajudem no diagnóstico e no tratamento.',
                    exemplo: '"Ainda que não definitivo" é a parte que mais importa na prática: você não precisa esperar o diagnóstico fechar para começar a ser atendida.',
                    limite: 'A alteração de 2025 deixou claro que nutrição e terapia nutricional são feitas por profissional de saúde legalmente habilitado.'
                },
                {
                    ref: 'Art. 3º, IV',
                    titulo: 'Acesso a educação, moradia, trabalho e previdência',
                    simples: 'A lei garante acesso à educação e ao ensino profissionalizante, à moradia — "inclusive à residência protegida" —, ao mercado de trabalho e à previdência e assistência social.',
                    exemplo: '"Inclusive à residência protegida" é uma porta que quase ninguém conhece: a lei prevê um tipo de moradia específico para pessoas com TEA em situação de dependência.',
                    limite: 'O inciso V das diretrizes trata do estímulo ao trabalho, observadas as peculiaridades da deficiência.'
                },
                {
                    ref: 'Art. 3º, § 1º',
                    titulo: 'Acompanhante especializado na escola',
                    simples: 'Em caso de comprovada necessidade, a pessoa com TEA incluída nas classes comuns do ensino regular tem direito a acompanhante especializado. A redação atual vem da Lei 15.131/2025.',
                    exemplo: 'Este é o apoio escolar que a Berenice Piana nomeia. Ele é diferente do profissional de apoio escolar da LBI, que cobre alimentação, higiene e locomoção: aqui a lei fala em acompanhante especializado.',
                    limite: 'Só na classe comum e só em caso de comprovada necessidade. Não é acompanhante em qualquer sala nem em qualquer circunstância.'
                },
                {
                    ref: 'Art. 3º-A',
                    titulo: 'A Carteira de Identificação da Pessoa com TEA (CIPTEA)',
                    simples: 'A CIPTEA foi criada para garantir "atenção integral, pronto atendimento e prioridade" no acesso aos serviços públicos e privados, em especial nas áreas de saúde, educação e assistência social. Este artigo não está na lei de 2012: foi incluído pela Lei 13.977/2020.',
                    exemplo: 'Quem tem CIPTEA apresenta um documento e passa na frente da fila — sem explicar diagnóstico em voz alta.',
                    limite: 'O órgão que expede é o responsável pela Política Nacional no seu Estado ou município. Não existe uma carteira nacional emitida em Brasília.'
                },
                {
                    ref: 'Art. 4º',
                    titulo: 'O que não pode ser feito com uma pessoa com TEA',
                    simples: 'A pessoa com TEA não pode ser submetida a tratamento desumano ou degradante, não pode ser privada da liberdade ou do convívio familiar, e não pode sofrer discriminação.',
                    exemplo: 'Se alguém tentar internar uma pessoa com TEA contra a vontade dela, este artigo é a norma a ser citada. E, quando a internação for em unidade especializada, a lei manda observar a Lei 10.216/2001.',
                    limite: 'O parágrafo único não dispensa a lei de saúde mental: ele manda aplicá-la.'
                },
                {
                    ref: 'Art. 5º',
                    titulo: 'Plano de saúde',
                    simples: 'A pessoa com TEA não pode ser impedida de participar de planos privados de saúde por causa da sua condição.',
                    exemplo: 'Negar a entrada num plano, ou tratar o TEA como doença excluída, é impedimento de participação — que é o que o artigo proíbe.',
                    limite: 'A lei remete à Lei 9.656/1998, que é a Lei dos Planos de Saúde. A reclamação sobre cobertura é com aquele órgão, não com esta lei.'
                },
                {
                    ref: 'Art. 7º',
                    titulo: 'Escola que recusa matrícula',
                    simples: 'O gestor escolar, ou a autoridade competente, que recusar a matrícula de aluno com TEA — ou com qualquer outra deficiência — é punido com multa de 3 a 20 salários mínimos. Em caso de reincidência, apurada em processo administrativo com contraditório e ampla defesa, há perda do cargo.',
                    exemplo: 'Este é um dos artigos mais concretos do site. Recusa de matrícula não é um mal-entendido: tem nome, tem valor e tem consequência para quem decidiu.',
                    limite: 'A multa é da lei, e quem pode cobrar é o município, pelo processo administrativo. A Defensoria Pública e o Ministério Público ajudam a dar andamento.'
                }
            ],

            situacoes: [
                {
                    id: 'ciptea',
                    rotulo: 'Quero a carteira CIPTEA',
                    pergunta: 'Como eu tiro a CIPTEA?',
                    direito: 'A CIPTEA é emitida pelo órgão do seu estado ou município, com relatório médico e validade de 5 anos',
                    artigos: 'Lei 12.764/2012, art. 3º-A; Lei 13.977/2020',
                    passos: [
                        'Procure o órgão do seu município ou estado responsável pela Política Nacional de Proteção dos Direitos da Pessoa com TEA. É ele que expede a carteira.',
                        'Separe o relatório médico com a indicação do CID. A lei exige esse relatório junto com o requerimento.',
                        'Separe também: documento de identidade, CPF, data de nascimento, foto no formato 3x4, e os dados do responsável legal ou cuidador.',
                        'Vá ao órgão com o requerimento. A lei não marca prazo: leve tudo de uma vez para não repetir a ida.'
                    ],
                    documentos: [
                        'Documento de identidade',
                        'CPF',
                        'Relatório médico com CID',
                        'Foto 3x4',
                        'Dados do responsável legal ou cuidador'
                    ],
                    observacao: 'A lei não diz em quantos dias sai. Se ninguém souber, isso também é falta de informação do poder público.'
                },
                {
                    id: 'laudo',
                    rotulo: 'Laudo, diagnóstico e avaliação',
                    pergunta: 'Preciso de laudo ou de avaliação. Como funciona?',
                    direito: 'A lei prevê diagnóstico precoce, multiprofissional, e não exige que o diagnóstico esteja definido para o atendimento começar',
                    artigos: 'Lei 12.764/2012, art. 1º § 1º e art. 3º III',
                    passos: [
                        'Entenda o que a lei considera TEA: são dois blocos de descrição. Se você não se encaixa neles, isso não tira os seus direitos — a LBI é outra lei e cobre a deficiência em geral.',
                        'Peça o atendimento multiprofissional, que a lei nomeia. Uma consulta médica não é a mesma coisa que isso.',
                        'Guarde o relatório por escrito. Ele é o que serve para pedir a CIPTEA e para explicar uma adaptação em escola ou trabalho.',
                        'Lembre que o art. 3º fala em diagnóstico precoce "ainda que não definitivo": dá para pedir atendimento antes de fechar o diagnóstico.'
                    ],
                    documentos: [
                        'Documento de identidade',
                        'Relatórios e laudos que já existem',
                        'Registro das adaptações que ajudam você'
                    ],
                    observacao: 'Laudo não é sinônimo de avaliação biopsicossocial, que é a da LBI. São coisas diferentes, com finalidades diferentes.'
                },
                {
                    id: 'matricula',
                    rotulo: 'A escola recusou minha matrícula',
                    pergunta: 'A escola não aceitou minha matrícula. E agora?',
                    direito: 'Recusar matrícula é proibido e punido com multa de 3 a 20 salários mínimos; em reincidência, perda do cargo',
                    artigos: 'Lei 12.764/2012, art. 7º',
                    passos: [
                        'Não aceite apenas um não verbal. Peça a recusa por escrito, com o nome de quem decidiu e a data. Sem isso, não há como reclamar do nada.',
                        'Guarde essa recusa. Ela é o documento que abre a reclamação formal.',
                        'Registre a ocorrência. O art. 7º prevê multa de 3 a 20 salários mínimos e, em reincidência, perda do cargo.',
                        'A multa é aplicada pelo município, em processo administrativo. Se a escola é particular, o caminho é o Ministério Público ou a Defensoria Pública.'
                    ],
                    documentos: [
                        'A recusa, por escrito',
                        'Comprovante de matrícula ou de tentativa',
                        'Data e nome de quem atendeu'
                    ],
                    observacao: 'A multa é para o gestor ou a autoridade competente. Ela não substitui a matrícula: dá para cobrar a multa e ainda assim precisar de outro caminho para voltar a estudar.'
                },
                {
                    id: 'saude-autismo',
                    rotulo: 'Atendimento de saúde',
                    pergunta: 'No SUS ou no plano, estou sendo tratado diferente.',
                    direito: 'A lei veda discriminação e tratamento desumano, e proíbe impedir a participação em plano de saúde',
                    artigos: 'Lei 12.764/2012, art. 3º III, art. 4º e art. 5º',
                    passos: [
                        'Peça a negativa por escrito. O art. 4º proíbe discriminação e o art. 5º proíbe impedir participação no plano; sem o motivo escrito, a discussão fica difícil depois.',
                        'Cite o art. 5º se o problema foi recusa de cobertura: ele remete à Lei 9.656/1998, que é a lei dos planos.',
                        'Se você foi tratado de forma desumana ou isolado, o art. 4º é a norma. Quando há internação em unidade especializada, a lei manda observar a Lei 10.216/2001.',
                        'Guarde protocolo, nome de quem atendeu e data.'
                    ],
                    documentos: [
                        'Documento de identidade, cartão do SUS ou do plano',
                        'Protocolos e registros de atendimento',
                        'Pedido de negativa por escrito, se houve'
                    ],
                    observacao: 'O art. 4º proíbe privar da liberdade e do convívio familiar, mas a internação em unidade especializada existe e é regulada por outra lei. Proibir e regular não são a mesma coisa.'
                }
            ],

            orgaos: [
                {
                    nome: 'Órgão do seu município ou estado sobre TEA',
                    quando: 'Sempre que a dúvida for sobre a CIPTEA.',
                    escopo: 'É o responsável pela execução da Política Nacional de Proteção dos Direitos da Pessoa com TEA no seu território, e o que expede a carteira.',
                    custo: 'Gratuito'
                },
                {
                    nome: 'Secretaria de Saúde / SUS',
                    quando: 'Quando o problema for diagnóstico, multiprofissional ou medicação.',
                    escopo: 'O art. 3º, III da lei lista esses direitos e aponta para a atenção integral à saúde.',
                    custo: 'Gratuito'
                },
                {
                    nome: 'Secretaria de Educação',
                    quando: 'Quando for matrícula recusada ou acompanhante especializado.',
                    escopo: 'O art. 7º pune a recusa de matrícula, e o art. 3º, § 1º trata do acompanhante especializado.',
                    custo: 'Gratuito'
                },
                {
                    nome: 'Defensoria Pública',
                    quando: 'Quando for preciso impetrar algo contra o município ou a escola.',
                    escopo: 'Apoio jurídico gratuito para quem não tem condições de arcar com advogado.',
                    custo: 'Gratuito'
                },
                {
                    nome: 'Ministério Público',
                    quando: 'Quando a recusa se repete ou é uma prática da rede.',
                    escopo: 'Fiscaliza a aplicação da lei e pode agir contra o órgão que descumpre.',
                    custo: 'Gratuito'
                }
            ],

            limites: [
                'A Lei Berenice Piana trata de transtorno do espectro autista. Ela não cobre TDAH, dislexia, ansiedade nem qualquer outra neurodivergência: essas são tratadas pela LBI, quando há impacto funcional confirmado.',
                'Esta lei assegura direitos; o que depende de cada situação é a aplicação deles.',
                'A maior parte dos direitos aqui citados precisa de pedido, registro ou comprovação. Nenhum deles se aplica automaticamente.',
                'Esta explicação não substitui a leitura do texto oficial nem aconselhamento jurídico individual.'
            ],
        },

        /* ------------------------------------------------------------------
           ROMEO MION — Lei nº 13.977, de 3 de outubro de 2019
           Cria a CIPTEA. ATENÇÃO: o número real é 13.977/2019.
           A biblioteca anunciava "/2020". Conferir na fonte oficial.
           ------------------------------------------------------------------ */
        {
            id: 'romeo-mion',
            idAntigo: 3,
            categoria: 'social',
            icone: 'fa-solid fa-id-card',
            iconeClasse: 'law-icon-social',
            tipo: 'lei',
            numero: '13.977',
            ano: 2020,
            data: '2020-01-08',
            nomeOficial: 'Lei nº 13.977, de 3 de outubro de 2019',
            nomePopular: 'Lei Romeo Mion',
            base: true,
            status: 'em-preparacao',
            conferidoEm: '2026-10-10',
            verificacao:
                'CONFERIDO 2026-10-10. A biblioteca ja estava certa: Lei nº 13.977, de 8 de janeiro de 2020 (não 2019), no endereço /_ato2019-2022/2020/lei/l13977.htm. A pasta do ano no endereço é do período de publicação, não do ano da lei.',
            url: 'http://www.planalto.gov.br/ccivil_03/_ato2019-2022/2020/lei/l13977.htm',

            resumo: 'Cria a Carteira de Identificação da Pessoa com TEA (CIPTEA), facilitando o acesso a direitos.',

            artigoDestaque: null,
            garante: [],
            documentos: [],
            passos: [],

            observacao: 'ATENÇÃO: a biblioteca anunciava "13.977/2020". O número ' +
                'verificado é 13.977/2019. Conferir antes de publicar.',

            // ------------------------------------------------------------------
            // CONTEUDO VERIFICADO NA FONTE OFICIAL
            // ------------------------------------------------------------------
            verificacao: 'CONFERIDO 2026-10-10 no texto oficial do Planalto. Esta lei tem 5 artigos e nenhum deles cria direito por si: ela altera a Lei 12.764/2012 (Berenice Piana) e a Lei 9.265/1996 (Gratuidade dos Atos de Cidadania). Os artigos 2º e 3º são as alterações; o 4º foi vetado. Por isso o texto das regras está na Berenice Piana, não aqui.',

            artigos: [
                {
                    ref: 'Art. 1º',
                    titulo: 'O que esta lei faz',
                    simples: 'A lei, chamada de "Lei Romeo Mion", altera a Lei 12.764/2012 e a Lei 9.265/1996 "para criar a Carteira de Identificação da Pessoa com Transtorno do Espectro Autista (Ciptea), de expedição gratuita".',
                    exemplo: 'Quando alguém diz "a Lei Romeo Mion criou a CIPTEA", está certo no resultado e impreciso no caminho: a carteira está escrita no art. 3º-A da Berenice Piana.',
                    limite: 'Esta lei não tem artigo de direito próprio. Quem precisa do texto da carteira deve abrir a Berenice Piana.'
                },
                {
                    ref: 'Art. 2º',
                    titulo: 'Como a CIPTEA entra na Berenice Piana',
                    simples: 'Este artigo é o que insere na Lei 12.764/2012 o art. 3º-A, com as regras da carteira: quem expede, o que o requerimento precisa ter, e por quanto tempo vale. Ele também acrescenta o § 3º do art. 1º, que permite o uso da fita quebra-cabeça como símbolo de identificação.',
                    exemplo: 'A regra de que a carteira vale 5 anos não está neste texto — ela foi trazida para dentro do art. 3º-A da Berenice Piana por este artigo.',
                    limite: 'O texto completo da carteira está na Berenice Piana. Aqui está só a alteração que o fez.'
                },
                {
                    ref: 'Art. 3º',
                    titulo: 'Gratuidade do requerimento e da emissão',
                    simples: 'A lei acrescenta um inciso à Lei 9.265/1996, que é a Lei da Gratuidade dos Atos de Cidadania. O inciso novo é: "o requerimento e a emissão de documento de identificação específico, ou segunda via, para pessoa com transtorno do espectro autista".',
                    exemplo: 'Se um órgão cobrar taxa para emitir a CIPTEA ou a segunda via, é este inciso que responde — e ele vale porque está na lei de gratuidade dos atos, não por causa desta lei.',
                    limite: 'A gratuidade aqui é do documento. Não cobre consulta, nem avaliação, nem tratamento.'
                },
                {
                    ref: 'Art. 4º',
                    titulo: 'Artigo vetado',
                    simples: 'O art. 4º foi vetado e não produce efeito. Está na lei publicada por transparência, e é comum ver material de divulgaçãocita-lo como se valesse.',
                    exemplo: 'Se um material lê o art. 4º desta lei como se fosse regra, desconfie: foi vetado.',
                    limite: 'Vetado é vetado. Não há leitura possível que o faça valer.'
                }
            ],

            situacoes: [
                {
                    id: 'ciptea-gratuidade',
                    rotulo: 'Cobrança pela CIPTEA ou pela segunda via',
                    pergunta: 'Cobraram taxa para tirar a CIPTEA. Isso é correto?',
                    direito: 'O requerimento e a emissão da CIPTEA, ou a segunda via, são gratuitos',
                    artigos: 'Lei 13.977/2020, art. 1º e art. 3º',
                    passos: [
                        'Peça por escrito o que estão cobrando: qual taxa, qual base legal, e se é a emissão ou a segunda via.',
                        'A Lei 9.265/1996, com o inciso acrescentado por esta lei, prevê a gratuidade do requerimento e da emissão de documento específico para pessoa com TEA.',
                        'Não é a segunda via de um documento qualquer: é a segunda via da CIPTEA, que é documento de identificação específico.',
                        'Com a cobrança por escrito, o caminho é a Defensoria Pública ou o próprio órgão, à luz do art. 3º desta lei.'
                    ],
                    documentos: [
                        'A cobrança, por escrito',
                        'Protocolo do requerimento da CIPTEA'
                    ],
                    observacao: 'A gratuidade é do documento. Se cobraram consulta, avaliação ou tratamento, esta lei não é a resposta — o art. 5º remete à Lei dos Planos de Saúde e o art. 3º, III, da Berenice Piana fala de saúde.'
                }
            ],

            orgaos: [
                {
                    nome: 'Órgão do seu município ou estado sobre TEA',
                    quando: 'Sempre que a dúvida for sobre a CIPTEA ou sobre a cobrança.',
                    escopo: 'É quem expede a carteira e quem aplica a gratuidade da emissão.',
                    custo: 'Gratuito'
                },
                {
                    nome: 'Defensoria Pública',
                    quando: 'Quando a cobrança não for resolvida no próprio órgão.',
                    escopo: 'Apoio jurídico gratuito para quem não tem condições de arcar com advogado.',
                    custo: 'Gratuito'
                },
                {
                    nome: 'Procon',
                    quando: 'Quando a cobrança vier de um plano ou de um serviço privado.',
                    escopo: 'Órgão de defesa do consumidor do seu estado.',
                    custo: 'Gratuito'
                }
            ],

            limites: [
                'Esta lei não tem artigo de direito próprio: ela altera a Berenice Piana e a Lei de Gratuidade dos Atos de Cidadania. As regras da carteira estão na Berenice Piana.',
                'A gratuidade é do requerimento e da emissão do documento, ou da segunda via. Não cobre consulta, avaliação ou tratamento.',
                'Esta explicação não substitui a leitura do texto oficial nem aconselhamento jurídico individual.'
            ],
        },
            // ------------------------------------------------------------------
        /* ------------------------------------------------------------------
           BPC — Lei nº 8.742, de 7 de dezembro de 1993
           ------------------------------------------------------------------ */
        {
            id: 'bpc',
            idAntigo: 4,
            categoria: 'social',
            icone: 'fa-solid fa-money-bill-wave',
            iconeClasse: 'law-icon-social',
            tipo: 'lei',
            numero: '8.742',
            ano: 1993,
            data: '1993-12-07',
            nomeOficial: 'Lei nº 8.742, de 7 de dezembro de 1993',
            nomePopular: 'BPC - Benefício de Prestação Continuada',
            status: 'em-preparacao',
            conferidoEm: '2026-10-10',
            url: 'http://www.planalto.gov.br/ccivil_03/leis/l8742.htm',

            resumo: 'Garante um salário mínimo mensal à pessoa com deficiência de baixa renda.',

            artigoDestaque: null,
            artigos: [],
            garante: [],
            documentos: [],
            passos: [],
        },
            // ------------------------------------------------------------------
        /* ------------------------------------------------------------------
           COTAS — Lei nº 8.213, de 23 de julho de 1991
           ------------------------------------------------------------------ */
        {
            id: 'cotas-pcd',
            idAntigo: 5,
            categoria: 'social',
            icone: 'fa-solid fa-briefcase',
            iconeClasse: 'law-icon-social',
            tipo: 'lei',
            numero: '8.213',
            ano: 1991,
            data: '1991-07-23',
            nomeOficial: 'Lei nº 8.213, de 23 de julho de 1991',
            nomePopular: 'Lei de Cotas para PCD',
            status: 'em-preparacao',
            conferidoEm: '2026-10-10',
            url: 'http://www.planalto.gov.br/ccivil_03/leis/l8213cons.htm',

            resumo: 'Reserva vagas para pessoas com deficiência em empresas com mais de 100 funcionários.',

            artigoDestaque: null,
            artigos: [],
            situacoes: [],
            garante: [],
            documentos: [],
            passos: [],
            orgaos: [],
            limites: []
        },

        /* ------------------------------------------------------------------
           ACESSIBILIDADE — Lei nº 10.098, de 19 de dezembro de 2000
           ------------------------------------------------------------------ */
        {
            id: 'acessibilidade',
            idAntigo: 6,
            categoria: 'acessibilidade',
            icone: 'fa-solid fa-universal-access',
            iconeClasse: 'law-icon-acessibilidade',
            tipo: 'lei',
            numero: '10.098',
            ano: 2000,
            data: '2000-12-19',
            nomeOficial: 'Lei nº 10.098, de 19 de dezembro de 2000',
            nomePopular: 'Lei de Acessibilidade',
            status: 'em-preparacao',
            conferidoEm: '2026-10-10',
            url: 'https://www.planalto.gov.br/ccivil_03/leis/l10098.htm',

            resumo: 'Normas gerais e critérios básicos para promoção da acessibilidade das pessoas com deficiência.',

            artigoDestaque: null,
            artigos: [],
            situacoes: [],
            garante: [],
            documentos: [],
            passos: [],
            orgaos: [],
            limites: []
        },

        /* ------------------------------------------------------------------
           LIBRAS — Lei nº 10.436, de 24 de abril de 2002
           ------------------------------------------------------------------ */
        {
            id: 'libras',
            idAntigo: 7,
            categoria: 'acessibilidade',
            icone: 'fa-solid fa-hands',
            iconeClasse: 'law-icon-acessibilidade',
            tipo: 'lei',
            numero: '10.436',
            ano: 2002,
            data: '2002-04-24',
            nomeOficial: 'Lei nº 10.436, de 24 de abril de 2002',
            nomePopular: 'Lei da Libras',
            status: 'em-preparacao',
            conferidoEm: '2026-10-10',
            url: 'http://www.planalto.gov.br/ccivil_03/leis/2002/l10436.htm',

            resumo: 'Reconhece a Língua Brasileira de Sinais como meio legal de comunicação e expressão.',

            artigoDestaque: null,
            artigos: [],
            situacoes: [],
            garante: [],
            documentos: [],
            passos: [],
            orgaos: [],
            limites: []
        },

        /* ------------------------------------------------------------------
           DECRETO DE ACESSIBILIDADE — Decreto nº 5.296, de 2 de novembro de 2004
           ESTE NÃO É UMA LEI. É decreto. Ver o campo `tipo`.
           ------------------------------------------------------------------ */
        {
            id: 'decreto-acessibilidade',
            idAntigo: 8,
            categoria: 'acessibilidade',
            icone: 'fa-solid fa-wheelchair',
            iconeClasse: 'law-icon-acessibilidade',
            tipo: 'decreto',
            numero: '5.296',
            ano: 2004,
            data: '2004-11-02',
            nomeOficial: 'Decreto nº 5.296, de 2 de novembro de 2004',
            nomePopular: 'Decreto de Acessibilidade',
            status: 'em-preparacao',
            conferidoEm: '2026-10-10',
            verificacao:
                'CONFERIDO 2026-10-10. É o Decreto nº 5.296/2004 e regulamenta a Lei 10.098/2000. Por isso o card o anuncia como \'Decreto\', e não \'Lei\'.',
            url: 'http://www.planalto.gov.br/ccivil_03/_ato2004-2006/2004/decreto/d5296.htm',

            resumo: 'Regulamenta a acessibilidade em edificações, mobiliário urbano e transporte.',

            artigoDestaque: null,
            artigos: [],
            situacoes: [],
            garante: [],
            documentos: [],
            passos: [],
            orgaos: [],
            limites: [],

            observacao: 'Regulamenta a Lei 10.098/2000. Ao falar desta, citar ' +
                'sempre as duas juntas.'
        },

        /* ------------------------------------------------------------------
           SAÚDE MENTAL — Lei nº 10.216, de 15 de agosto de 2001
           ------------------------------------------------------------------ */
        {
            id: 'saude-mental',
            idAntigo: 9,
            categoria: 'saude',
            icone: 'fa-solid fa-brain',
            iconeClasse: 'law-icon-saude',
            tipo: 'lei',
            numero: '10.216',
            ano: 2001,
            data: '2001-08-15',
            nomeOficial: 'Lei nº 10.216, de 15 de agosto de 2001',
            nomePopular: 'Direito à Saúde Mental',
            status: 'em-preparacao',
            conferidoEm: '2026-10-10',
            url: 'http://www.planalto.gov.br/ccivil_03/leis/leis_2001/l10216.htm',

            resumo: 'Redireciona o modelo assistencial em saúde mental, priorizando o tratamento em comunidade.',

            artigoDestaque: null,
            artigos: [],
            situacoes: [],
            garante: [],
            documentos: [],
            passos: [],
            orgaos: [],
            limites: []
        },

        /* ------------------------------------------------------------------
           EDUCAÇÃO ESPECIAL
           ATENÇÃO: o registro antigo usava "Lei nº 11.788/2008", que é o
           ESTATUTO DA PCD. Isso é domini da LBI, não uma lei separada de
           educação especial. A lei de educação especial é a Lei 9.394/1996,
           alterada pelo Decreto 6.571/2008 e pelo Parecer 17/2001 (CEB).
           VERIFICAR NA FONTE antes de corrigir.
           ------------------------------------------------------------------ */
        {
            id: 'educacao-especial',
            idAntigo: 11,
            categoria: 'educacional',
            icone: 'fa-solid fa-graduation-cap',
            iconeClasse: 'law-icon-educacional',
            tipo: 'lei',
            numero: '11.788',
            ano: 2008,
            data: '2008-07-22',
            nomeOficial: 'Lei nº 11.788, de 22 de julho de 2008',
            nomePopular: 'Lei da Educação Especial',
            status: 'em-preparacao',
            conferidoEm: '2026-10-10',
            verificacao:
                'DIVERGENCIA ENCONTRADA 2026-10-10, NAO CORRIGIDA. O registro se chama \'Lei da Educação Especial\' mas aponta para a Lei nº 11.788/2008, que é o Estatuto da Pessoa com Deficiência. A lei de educação especial é a Lei nº 9.394/1996 (LDB), capítulos V, arts. 58 a 60. Não foi corrigido porque corrigir muda o que a pessoa lê na biblioteca — a decisão é do projeto, não da ferramenta.',
            url: 'http://www.planalto.gov.br/ccivil_03/_ato2007-2010/2008/lei/l11788.htm',

            resumo: 'Diretrizes para a educação especial na perspectiva da educação inclusiva.',

            artigoDestaque: null,
            artigos: [],
            situacoes: [],
            garante: [],
            documentos: [],
            passos: [],
            orgaos: [],
            limites: [],

            observacao: 'Registro corrigido por suspeita. A biblioteca apontava ' +
                'para a Lei 11.788/2008 (Estatuto da PCD) sob o nome de ' +
                '"Lei da Educação Especial". Conferir na fonte oficial antes ' +
                'de qualquer uso.'
        },

        /* ------------------------------------------------------------------
           INCLUSÃO PROFISSIONAL — Lei nº 13.370, de 16 de dezembro de 2016
           Altera a Lei 8.213/1991 — por isso o registro antigo apontava
           para o texto errado. Este aponta para a própria Lei 13.370.
           ------------------------------------------------------------------ */
        {
            id: 'inclusao-profissional',
            idAntigo: 12,
            categoria: 'educacional',
            icone: 'fa-solid fa-user-tie',
            iconeClasse: 'law-icon-educacional',
            tipo: 'lei',
            numero: '13.370',
            ano: 2016,
            data: '2016-12-16',
            nomeOficial: 'Lei nº 13.370, de 16 de dezembro de 2016',
            nomePopular: 'Lei da Inclusão Profissional',
            status: 'em-preparacao',
            conferidoEm: '2026-10-10',
            url: 'http://www.planalto.gov.br/ccivil_03/_ato2015-2018/2016/lei/l13370.htm',

            resumo: 'Estabelece quotas para pessoas com deficiência no mercado de trabalho.',

            artigoDestaque: null,
            artigos: [],
            situacoes: [],
            garante: [],
            documentos: [],
            passos: [],
            orgaos: [],
            limites: []
        },

        /* ==================================================================
           TEMA — ACOMPANHANTE E ATENDENTE PESSOAL
           ------------------------------------------------------------------
           ISSO NÃO É UMA LEI.

           A biblioteca apresentava este item como aentry número 10, com
           número "13.146/2015" — o mesmo da LBI, entrada 2, apontando para
           a mesma URL. Ou seja: a mesma lei contada duas vezes.

           Aqui está como tema, com `temaDe` apontando para a LBI. O campo
           `tipo: 'tema'` é o que impede a renderização de tratar isso como
           um instrumento jurídico independente.
           ================================================================== */
        {
            id: 'tema-acompanhante',
            idAntigo: 10,
            categoria: 'social',
            icone: 'fa-solid fa-user-nurse',
            iconeClasse: 'law-icon-social',
            tipo: 'tema',
            temaDe: 'lbi',
            base: false,
            status: 'em-preparacao',
            conferidoEm: '2026-10-10',

            nomeOficial: 'Acompanhante e atendente pessoal',
            nomePopular: 'Acompanhante e atendente pessoal (LBI)',
            numero: null,
            ano: null,
            url: 'https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2015/lei/l13146.htm',

        resumo: 'A LBI define acompanhante como quem acompanha a pessoa com deficiência, podendo ou não desempenhar as funções de atendente pessoal, e estende a essa pessoa os direitos previstos no art. 21.',

            artigoDestaque: null,
            artigos: [],
            situacoes: [],
            garante: [],
            documentos: [],
            passos: [],
            orgaos: [],
            limites: [],

            observacao: 'Tema associado à Lei nº 13.146/2015. Não é um ' +
                'instrumento jurídico próprio. A terminologia (acompanhante ' +
                '× atendente pessoal) precisa ser conferida na fonte antes ' +
                'de virar orientação.'
        }
    ];

    /* ==========================================================================
       MAPA DE CATEGORIAS

       Continua o mesmo agrupamento que a biblioteca já usava, para não
       quebrar nenhum filtro. A contagem NÃO está escrita aqui de propósito:
       a biblioteca tira a contagem dos próprios dados, então o número nunca
       pode divergir do que existe. (Hoje divergia: o HTML anunciava
       Educação 3 leis e Assistência Social 4; o array tinha 2 e 5.)
       ========================================================================== */
    window.LEIS_CATEGORIAS = {
        educacional: 'Educacional',
        social: 'Assistência Social',
        acessibilidade: 'Acessibilidade',
        saude: 'Saúde'
    };

    /* O mapeamento antigo era por `id` numérico e ficava em direitos.js.
       Aqui fica também, mas em forma de texto: é o que a renderização usa
       para dizer "Lei 13.146/2015" e "Decreto 5.296/2004" corretamente —
       chamar todo mundo de "Lei" seria errado justamente no Decreto. */
    window.LEIS_ETIQUETAS_TIPO = {
        lei: 'Lei',
        decreto: 'Decreto',
        tema: 'Tema'
    };

    /* ==========================================================================
       PERCURSOS — as regras do orientador
       ==========================================================================
       
       Aqui estao as perguntas e as regras do "Vamos encontrar um caminho?". Sao
       dados, como todo o resto deste arquivo: nenhuma logica.
       
       TRÊS REGRAS QUE MOLDARAM ESTE ARQUIVO
       
       1. REGRA EXPLÍCITA, NUNCA INFERÊNCIA. Não há cálculo nem palpite. Cada
          entrada em `regras` diz: SE a resposta for esta, ENTÃO este efeito. Nada
          além disso. Um motor que "adivinha" o que a pessoa tem direito é um motor
          que erra em silêncio.
       
       2. SÓ SITUAÇÕES COM CONTEÚDO CONFERIDO. Cada área aponta para uma
          `situacao` da LBI, escrita lendo o texto oficial. A área de documentação
          apontaria para a Romeo Mion e a Berenice Piana, que ainda não foram
          conferidas — então ela entra com `emPreparacao` e a página mostra o
          aviso com o link do Planalto, em vez de orientação que ninguém leu.
       
       3. NENHUMA PERGUNTA SOBRE DADO SENSÍVEL. Não há campo de nome, diagnóstico,
          CPF, laudo nem relato. As perguntas são sobre a situação, e as respostas
          ficam no navegador.
       ========================================================================== */

    window.PERCURSOS = {

        areas: [
            {
                id: 'escola',
                rotulo: 'Escola, faculdade ou educação',
                icone: 'fa-solid fa-graduation-cap',
                resumo: 'Adaptação, apoio escolar, avaliação ou vestibular.',
                situacao: 'escola',
                lei: 'lbi',
                perguntas: 'escola'
            },
            {
                id: 'trabalho',
                rotulo: 'Emprego, contratação ou cotas',
                icone: 'fa-solid fa-briefcase',
                resumo: 'Seleção, jornada, demissão, cotas ou apoio no trabalho.',
                situacao: 'trabalho',
                lei: 'lbi',
                perguntas: 'trabalho'
            },
            {
                id: 'saude',
                rotulo: 'Saúde ou plano de saúde',
                icone: 'fa-solid fa-heart-pulse',
                resumo: 'Cobertura negada, atendimento, acompanhante ou internação.',
                situacao: 'saude',
                lei: 'lbi',
                perguntas: 'saude'
            },
            {
                id: 'acompanhante',
                rotulo: 'Acompanhante e apoio',
                icone: 'fa-solid fa-user-nurse',
                resumo: 'Quem pode me ajudar no dia a dia, e o que a lei diz.',
                situacao: 'acompanhante',
                lei: 'lbi',
                perguntas: 'acompanhante'
            },
            {
                id: 'acessibilidade',
                rotulo: 'Acessibilidade, atendimento ou comunicação',
                icone: 'fa-solid fa-universal-access',
                resumo: 'Barreira em serviço, escola, saúde, transporte ou internet.',
                situacao: 'comunicacao',
                lei: 'lbi',
                perguntas: 'acessibilidade'
            },
            {
                id: 'documentacao',
                rotulo: 'Documentação e identificação',
                icone: 'fa-solid fa-id-card',
                resumo: 'Carteira do TEA, laudo, avaliação, matrícula recusada ou benefício.',
                situacao: null,
                lei: null,
                // Esta é a única área sem situação fixa: cada RESPOSTA leva a
                // uma lei e uma situação diferentes. É o gatilho — a
                // resposta é o que decide onde a orientação aparece.
                //
                //   CIPTEA     -> Romeo Mion (a gratuidade)
                //   laudo      -> Berenice Piana (diagnóstico)
                //   avaliação  -> Berenice Piana (diagnóstico)
                //   matrícula   -> Berenice Piana (art. 7º, a multa)
                //   benefício  -> BPC, que é outra lei e ainda não foi
                //                  conferida: por isso fica em preparação
                comResposta: {
                    'documento:ciptea': { lei: 'romeo-mion', situacao: 'ciptea-gratuidade' },
                    'documento:laudo': { lei: 'berenice-piana', situacao: 'laudo' },
                    'documento:avaliacao': { lei: 'berenice-piana', situacao: 'laudo' },
                    'documento:matricula': { lei: 'berenice-piana', situacao: 'matricula' },
                    'documento:beneficio': { emPreparacao: true }
                },
                perguntas: 'documentacao'
            },
        ],

        /* As perguntas de cada área. `explica` vai junto da pergunta para dizer,
           na tela, que a resposta não decide nada. */
        perguntas: {
            'escola': [
                {
                    id: 'nivel',
                    texto: 'Em que etapa você está?',
                    opcoes: [
                        { chave: 'pre-escolar', rotulo: 'Educação infantil' },
                        { chave: 'ensino-fundamental', rotulo: 'Ensino fundamental' },
                        { chave: 'ensino-medio', rotulo: 'Ensino médio' },
                        { chave: 'superior', rotulo: 'Faculdade ou técnico' },
                        { chave: 'nao-sei', rotulo: 'Ainda não sei' }
                    ]
                },
                {
                    id: 'pediu',
                    texto: 'Você já pediu alguma adaptação por escrito?',
                    opcoes: [
                        { chave: 'sim-tenho', rotulo: 'Sim, e tenho o registro' },
                        { chave: 'sim-perdi', rotulo: 'Sim, mas não guardei' },
                        { chave: 'nao', rotulo: 'Ainda não pedi' },
                        { chave: 'nao-quero', rotulo: 'Prefiro não pedir' }
                    ]
                }
            ],
            'trabalho': [
                {
                    id: 'momento',
                    texto: 'Em que momento isso acontece?',
                    opcoes: [
                        { chave: 'selecao', rotulo: 'Na seleção ou na entrevista' },
                        { chave: 'contratacao', rotulo: 'Ao ser contratado(a)' },
                        { chave: 'permanencia', rotulo: 'Depois, no dia a dia' },
                        { chave: 'desligamento', rotulo: 'Foi o desligamento' }
                    ]
                },
                {
                    id: 'quer',
                    texto: 'O que você quer agora?',
                    opcoes: [
                        { chave: 'explicar', rotulo: 'Entender o que aconteceu' },
                        { chave: 'registrar', rotulo: 'Registrar por escrito' },
                        { chave: 'apoio', rotulo: 'Saber se existe apoio no trabalho' }
                    ]
                }
            ],
            'saude': [
                {
                    id: 'onde',
                    texto: 'Onde aconteceu?',
                    opcoes: [
                        { chave: 'plano', rotulo: 'Plano de saúde privado' },
                        { chave: 'sus', rotulo: 'SUS ou posto de saúde' },
                        { chave: 'hospital', rotulo: 'Hospital ou internação' },
                        { chave: 'clinica', rotulo: 'Clínica ou consultório' }
                    ]
                },
                {
                    id: 'tipo',
                    texto: 'O que foi negado ou dificultado?',
                    opcoes: [
                        { chave: 'cobertura', rotulo: 'Uma cobertura do plano' },
                        { chave: 'acompanhante', rotulo: 'Acompanhante junto' },
                        { chave: 'atendimento', rotulo: 'O atendimento em si' },
                        { chave: 'fila', rotulo: 'Espera ou fila' }
                    ]
                }
            ],
            'acompanhante': [
                {
                    id: 'papel',
                    texto: 'De que tipo de apoio você está precisando?',
                    opcoes: [
                        { chave: 'acompanhar', rotulo: 'Só me acompanhar' },
                        { chave: 'cuidados', rotulo: 'Ajudar no dia a dia' },
                        { chave: 'escola', rotulo: 'Ajudar na escola' },
                        { chave: 'internacao', rotulo: 'Ficar comigo no hospital' },
                        { chave: 'nao-sei', rotulo: 'Não sei ainda' }
                    ]
                }
            ],
            'acessibilidade': [
                {
                    id: 'local',
                    texto: 'Onde é difícil?',
                    opcoes: [
                        { chave: 'servico', rotulo: 'Serviço público ou banco' },
                        { chave: 'escola', rotulo: 'Escola ou trabalho' },
                        { chave: 'saude', rotulo: 'Serviço de saúde' },
                        { chave: 'transporte', rotulo: 'Transporte ou calle' },
                        { chave: 'online', rotulo: 'Atendimento pela internet' }
                    ]
                },
                {
                    id: 'comunicacao',
                    texto: 'O problema é de comunicação?',
                    opcoes: [
                        { chave: 'sim', rotulo: 'Sim, não consigo me fazer entender' },
                        { chave: 'parcial', rotulo: 'Às vezes, dependendo do dia' },
                        { chave: 'nao', rotulo: 'Não, é outro problema' }
                    ]
                }
            ],
            'documentacao': [
                {
                    id: 'documento',
                    texto: 'Que documento ou situação?',
                    opcoes: [
                        { chave: 'ciptea', rotulo: 'Carteira do TEA (CIPTEA)' },
                        { chave: 'laudo', rotulo: 'Laudo ou diagnóstico' },
                        { chave: 'avaliacao', rotulo: 'Avaliação para o BPC' },
                        { chave: 'matricula', rotulo: 'A escola recusou minha matrícula' },
                        { chave: 'beneficio', rotulo: 'Comprovante para benefício' }
                    ]
                }
            ]
        },

        /* As regras. Cada linha é: SE pergunta = resposta, ENTÃO efeito.
           Não há regra do tipo "esta resposta significa que a pessoa tem o
           direito X" — e essa ausência é deliberada. */
        regras: [
            // ---- documentacao: cada resposta puxa um aviso próprio
            { area: 'documentacao', pergunta: 'documento', resposta: 'ciptea', efeito: 'nota',
              texto: 'A regra completa da carteira está no art. 3º-A da Lei Berenice Piana. A Lei Romeo Mion é a que a inseriu ali e a que tornou a emissão gratuita. São duas leis que se complementam, não uma só.' },
            { area: 'documentacao', pergunta: 'documento', resposta: 'matricula', efeito: 'nota',
              texto: 'Aqui a lei é dura: o art. 7º da Berenice Piana pune a recusa de matrícula com multa de 3 a 20 salários mínimos, e em reincidência com perda do cargo.' },
            { area: 'documentacao', pergunta: 'documento', resposta: 'laudo', efeito: 'nota',
              texto: 'Laudo não é a mesma coisa que avaliação biopsicossocial, que é a da LBI. Se o que você precisa é a avaliação, o caminho é outro.' },
            { area: 'documentacao', pergunta: 'documento', resposta: 'avaliacao', efeito: 'orgaos',
              orgaos: ['Secretaria de Saúde / SUS'] },
            { area: 'escola', pergunta: 'nivel', resposta: 'superior', efeito: 'nota',
              texto: 'No ensino superior existe um artigo específico sobre vestibular e provas: ele prevê mais tempo e formatos acessíveis, mas pede solicitação prévia, com comprovação. Não é demais pedir e pedir de novo.' },
            { area: 'escola', pergunta: 'pediu', resposta: 'nao', efeito: 'destaque', passo: 1 },
            { area: 'escola', pergunta: 'pediu', resposta: 'nao-quero', efeito: 'nota',
              texto: 'Você pode escolher não pedir. Vale conhecer esse caminho antes de decidir que não quer: pedir por escrito é um passo pequeno, e dá para recuar depois.' },
            { area: 'escola', pergunta: 'pediu', resposta: 'sim-perdi', efeito: 'destaque', passo: 2 },
            { area: 'trabalho', pergunta: 'momento', resposta: 'desligamento', efeito: 'nota',
              texto: 'Demissão por ser neurodivergente é discriminação. Antes de qualquer conversa, guarde o que você tem: e-mail, mensagem, data. Preservar registro não é agressão, é defesa.' },
            { area: 'trabalho', pergunta: 'momento', resposta: 'selecao', efeito: 'nota',
              texto: 'A lei veda discriminação também na etapa de seleção e na admissão. Não é preciso provar nada para pedir o registro do que aconteceu.' },
            { area: 'trabalho', pergunta: 'quer', resposta: 'apoio', efeito: 'orgaos',
              orgaos: ['CRAS e Secretaria de Assistência Social'] },
            { area: 'saude', pergunta: 'tipo', resposta: 'cobertura', efeito: 'nota',
              texto: 'Negar cobertura que o plano oferece aos demais clientes pode ser discriminação. O primeiro passo é pedir a negativa por escrito, com o motivo.' },
            { area: 'saude', pergunta: 'tipo', resposta: 'acompanhante', efeito: 'destaque', passo: 3 },
            { area: 'saude', pergunta: 'onde', resposta: 'hospital', efeito: 'nota',
              texto: 'Se você está internada, existe um artigo específico sobre acompanhante: o órgão ou a instituição precisa facilitar a permanência em tempo integral.' },
            { area: 'saude', pergunta: 'onde', resposta: 'plano', efeito: 'orgaos',
              orgaos: ['Ministério Público'] },
            { area: 'acompanhante', pergunta: 'papel', resposta: 'cuidados', efeito: 'destaque', passo: 0 },
            { area: 'acompanhante', pergunta: 'papel', resposta: 'internacao', efeito: 'destaque', passo: 1 },
            { area: 'acompanhante', pergunta: 'papel', resposta: 'nao-sei', efeito: 'nota',
              texto: 'A própria lei separa os papéis: acompanhante, atendente pessoal e apoio escolar têm garantias diferentes. Começar por essa distinção evita pedir a coisa errada e ouvir não.' },
            { area: 'acessibilidade', pergunta: 'comunicacao', resposta: 'sim', efeito: 'destaque', passo: 0 },
            { area: 'acessibilidade', pergunta: 'local', resposta: 'online', efeito: 'nota',
              texto: 'Atendimento pela internet também é serviço público quando o órgão presta o serviço por ali. Se o formulário não tem alternativa, isso é uma barreira que a lei trata.' },
        ]
    };
})();