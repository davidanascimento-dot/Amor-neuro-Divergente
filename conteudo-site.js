/* ============================================================================
   CONTEUDO-SITE.JS — a fonte unica do conteudo editorial do site
   ============================================================================

   Este arquivo foi extraido do HTML das proprias paginas, nao escrito a mao:
     - blog/blog.html          -> os 8 cards <article class="editorial-card">
     - Recursos/recursos.html  -> os 9 <a class="externo-card">
     - Recursos/eventos.html   -> os 4 <article class="event-card">

   O painel de descoberta e estas paginas leem daqui. Nao existe segunda copia:
   quando um post mudar, muda aqui, e os dois lados acompanham.

   Na extracao, todas as urls internas foram conferidas contra o disco e
   nenhuma estava quebrada. As externas sao de fontes reais, ja usadas pelas
   proprias paginas.

   O que o site NAO tem, e por isso nao esta aqui — e nao pode ser inventado:
     - autor do post     (nunca foi registrado)
     - tempo de leitura  (nunca foi registrado)
     - newsletter        (nao ha tabela que receba e-mail no Supabase)

   `window.LEIS` continua sendo a fonte dos direitos e `window.BUSCA_INDICE` a
   das paginas. Este arquivo cobre o conteudo editorial.
   ============================================================================ */

window.CONTEUDO_SITE = {
    blog: [
        {
            url: '/blog/post-masking.html',
            titulo: 'O dia em que você para de sobreviver e começa a viver',
            imagem: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&q=80',
            categoria: 'autismo'
        },
        {
            url: '/blog/post-procrastinacao.html',
            titulo: 'O método dos “5 minutos” para começar uma tarefa',
            imagem: 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=800&q=80',
            altImagem: 'Relógio e caderno sobre uma mesa',
            categoria: 'tdah',
            resumo: 'Você olha para uma tarefa, sabe que precisa começar, e continua adiando. A saída é diminuir o tamanho do primeiro passo.'
        },
        {
            url: '/Recursos/autismo/autismo.html',
            titulo: 'Compreendendo o Espectro Autista: muito além dos estereótipos',
            imagem: 'https://images.unsplash.com/photo-1573497620053-ea5300f94f21?w=800&q=80',
            altImagem: 'Grupo diverso de pessoas em um círculo de apoio',
            categoria: 'autismo',
            resumo: 'Diagnóstico, stimming, comunicação e vida adulta — o que a pessoa é, e não o que a bookstores do stéréotype.'
        },
        {
            url: '/Recursos/autismo/Tdah.html',
            titulo: 'TDAH: entendendo a atenção, a impulsividade e a rotina',
            imagem: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800&q=80',
            altImagem: 'Pessoa concentrada em uma mesa de trabalho',
            categoria: 'tdah',
            resumo: 'O que é TDAH, o que muda em cada idade e por que a rotina pesa tanto.'
        },
        {
            url: '/Recursos/autismo/dislexia.html',
            titulo: 'Dislexia: quando ler e escrever exigem outros caminhos',
            imagem: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&q=80',
            altImagem: 'Pessoa lendo um livro',
            categoria: 'aprendizagem',
            resumo: 'A dislexia é uma diferença específica de aprendizagem. O que ela é e o que a escola pode fazer.'
        },
        {
            url: '/Recursos/autismo/saúde.html',
            titulo: 'Saúde mental: cuidar de como estamos também importa',
            imagem: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=800&q=80',
            altImagem: 'Pessoa em um ambiente calmo e arejado',
            categoria: 'saude-mental',
            resumo: 'Cuidar da saúde mental é parte de cuidar da saúde como um todo.'
        },
        {
            url: '/Recursos/autismo/altas-abilidades.html',
            titulo: 'Altas habilidades: quando os caminhos de aprendizagem são diferentes',
            imagem: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&q=80',
            altImagem: 'Ambiente de aprendizagem com livros e cadernos',
            categoria: 'habilidades',
            resumo: 'Desempenho ou potencial elevado em certas áreas não significa o mesmo desempenho em todas.'
        },
        {
            url: '/Recursos/autismo/talentos.html',
            titulo: 'Talentos neurodivergentes: descubra aquilo que faz sentido para você',
            imagem: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&q=80',
            altImagem: 'Mesa com materiais de criação e desenho',
            categoria: 'talentos',
            resumo: 'Nem toda habilidade aparece em uma prova, em uma nota ou em um currículo.'
        }
    ],

    recursos: [
        {
            url: 'https://www.nhs.uk/conditions/autism/',
            titulo: 'Autism',
            descricao: 'O que é autismo, quais são os sinais mais comuns e como conseguir ajuda.',
            imagem: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&h=400&fit=crop',
            fonte: 'NHS',
            oficial: 'true'
        },
        {
            url: 'https://www.nhs.uk/conditions/dyslexia/',
            titulo: 'Dyslexia in children',
            descricao: 'Como a dislexia aparece na infância e o que o NICE recomenda.',
            imagem: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=600&h=400&fit=crop',
            fonte: 'NHS',
            oficial: 'true'
        },
        {
            url: 'https://www.apa.org/topics/adhd/',
            titulo: 'Topics / ADHD',
            descricao: 'Página de referência da APA sobre TDAH: sintomas, diagnóstico e tratamento.',
            imagem: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=600&h=400&fit=crop',
            fonte: 'American Psychological Association',
            oficial: 'true'
        },
        {
            url: '/Recursos/autismo/autismo.html',
            titulo: 'Autismo (TEA)',
            descricao: 'Artigos sobre diagnóstico, stimming, comunicação, vida adulta, e tudo que envolve o universo autista.',
            imagem: '/img/recursos-hero-DaGrMSNl - Copia.jpg',
            fonte: 'Categoria',
            oficial: 'false'
        },
        {
            url: '/Recursos/autismo/Tdah.html',
            titulo: 'TDAH',
            descricao: 'Estratégias práticas para rotina, funções executivas, organização, e tudo sobre viver com TDAH.',
            imagem: '/img/blog-post-2-Dk5Jy2bJ - Copia.jpg',
            fonte: 'Categoria',
            oficial: 'false'
        },
        {
            url: '/Recursos/autismo/altas-abilidades.html',
            titulo: 'Altas Habilidades e Superdotação',
            descricao: 'Dupla excepcionalidade, desenvolvimento de talentos e desafios emocionais.',
            imagem: '/img/blog-post-3-EqM0ehGW - Copia.jpg',
            fonte: 'Categoria',
            oficial: 'false'
        },
        {
            url: '/Recursos/autismo/dislexia.html',
            titulo: 'Dislexia e Dificuldades de Aprendizagem',
            descricao: 'Guia para famílias, adaptações escolares e métodos que respeitam o ritmo de cada pessoa.',
            imagem: '/img/community-hero-CbAAq485 (1) - Copia.jpg',
            fonte: 'Categoria',
            oficial: 'false'
        },
        {
            url: '/Recursos/autismo/saúde.html',
            titulo: 'Saúde Mental e Bem-estar',
            descricao: 'Burnout neurodivergente, ansiedade, autocuidado e como cuidar da sua saúde emocional.',
            imagem: '/img/hero-inicio-5eoimK6p.jpg',
            fonte: 'Categoria',
            oficial: 'false'
        },
        {
            url: '/Direitos/direitos.html',
            titulo: 'Direitos e Legislação',
            descricao: 'Informação prática sobre leis, benefícios, inclusão escolar e direitos trabalhistas.',
            imagem: '/img/Documento com selo oficial e uma caneta, representando direitos legais.png',
            fonte: 'Categoria',
            oficial: 'false'
        }
    ],

    eventos: [
        {
            titulo: 'Grupo de Apoio: Pais de Crianças Autistas',
            descricao: 'Encontro quinzenal mediado por psicóloga neurodivergente. Espaço seguro para compartilhar experiências da parentalidade atípica.',
            imagem: 'https://images.unsplash.com/photo-1573497620053-ea5300f94f21?w=400&h=300&fit=crop',
            dia: '22',
            mes: 'JUN',
            etiquetas: [
                'Online'
            ],
            horario: '19h - 20h30',
            onde: 'Zoom',
            url: '/Quem somos/CONTATE-NOS/contate.html'
        },
        {
            titulo: 'Workshop: Estratégias Sensoriais para Casa',
            descricao: 'Aprenda a criar um ambiente acolhedor com recursos simples e baratos. Para famílias e pessoas neurodivergentes.',
            imagem: 'https://images.unsplash.com/photo-1573497620053-ea5300f94f21?w=400&h=300&fit=crop',
            dia: '05',
            mes: 'JUL',
            etiquetas: [
                'Presencial'
            ],
            horario: '14h - 16h',
            url: '/Quem somos/CONTATE-NOS/contate.html'
        },
        {
            titulo: 'Roda de Conversa: TDAH na Vida Adulta',
            descricao: 'Compartilhe estratégias, desafios e conquistas. Mediação de psicólogo especializado em TDAH adulto.',
            imagem: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=400&h=300&fit=crop',
            dia: '18',
            mes: 'JUL',
            etiquetas: [
                'Online'
            ],
            horario: '20h - 21h30',
            onde: 'Google Meet',
            url: '/Quem somos/CONTATE-NOS/contate.html'
        },
        {
            titulo: 'Palestra: Direitos Neurodivergentes na Educação',
            descricao: 'Advogada especializada explica as principais leis e como garantir adaptações escolares para crianças e adultos.',
            imagem: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=400&h=300&fit=crop',
            dia: '10',
            mes: 'AGO',
            etiquetas: [
                'Híbrido'
            ],
            horario: '10h - 12h',
            url: '/Quem somos/CONTATE-NOS/contate.html'
        }
    ]
};
