/* ==========================================================================
   ORIENTADOR.JS — "Vamos encontrar um caminho?"

   O que este arquivo faz, e o que ele se recusa a fazer.

   ELE FAZ
   Pergunta a situação, mostra as perguntas que importam para ela, reúne os
   passos e os órgãos, e entrega um caminho. Cada passo vem de uma situação
   que foi escrita lendo o texto oficial da lei.

   ELE NÃO FAZ
   Não decide se a pessoa tem ou não tem um direito. Não calcula nada. Não
   há modelo de linguagem aqui dentro: a única lógica é um `if` que
   confere a resposta com a tabela de regras e aplica o efeito escrito
   naquela linha.

   A diferença não é preciosismo. Um orientador que infere o direito da
   pessoa erra em silêncio, e quem erra em silêncio sobre direito perde
   tempo demais antes de descobrir que errou. Por isso a página diz, na
   tela, que as respostas não decidem nada — e o botão de resultado leva
   sempre ao texto oficial.

   ONDE FICA O CONTEÚDO
   Tudo vem de `window.PERCURSOS` e `window.LEIS`. Este arquivo não tem
   texto jurídico nenhum: se um passo mudar, muda no arquivo de dados, e a
   orientação do orientador e a da página da lei continuam iguais.

   PRIVACIDADE
   Nenhuma pergunta pede nome, diagnóstico, CPF, laudo ou relato. As
   respostas vivem em duas variáveis, nesta aba. Nada sai do aparelho.
   O botão de "enviar o resumo" não envia: ele monta o texto e deixa a
   pessoa decidir para onde vai, porque um site sem servidor de verdade não
   pode fingir que recebeu algo.
   ========================================================================== */

(function () {
    'use strict';

    /* ---------------------------------------------------------------------
       Estado. Duas variáveis e nada mais.
       --------------------------------------------------------------------- */
    var areaEscolhida = null;   // o objeto da area
    var respostas = {};         // { perguntaId: chaveDaOpcao }

    /* ---------------------------------------------------------------------
       Utilidades
       --------------------------------------------------------------------- */

    function $(id) { return document.getElementById(id); }

    function esc(t) {
        if (t == null) return '';
        var d = document.createElement('div');
        d.textContent = String(t);
        return d.innerHTML;
    }

    function el(tag, classe, texto) {
        var e = document.createElement(tag);
        if (classe) e.className = classe;
        if (texto != null) e.textContent = texto;
        return e;
    }

    function limpar(caixa) {
        while (caixa.firstChild) caixa.removeChild(caixa.firstChild);
    }

    function icone(classe) {
        var i = document.createElement('i');
        i.className = classe;
        i.setAttribute('aria-hidden', 'true');
        return i;
    }

    function registro(id) {
        var lista = window.LEIS || [];
        for (var i = 0; i < lista.length; i++) {
            if (lista[i].id === id) return lista[i];
        }
        return null;
    }

    function situacaoDe(area) {
        var lei = registro(area.lei);
        if (!lei || !area.situacao) return null;
        var s = null;
        for (var i = 0; i < lei.situacoes.length; i++) {
            if (lei.situacoes[i].id === area.situacao) s = lei.situacoes[i];
        }
        return s ? { lei: lei, situacao: s } : null;
    }

    /* ---------------------------------------------------------------------
       Áreas sem situação fixa: a RESPOSTA escolhe a lei.

       A área de documentação é o caso. Não existe "a lei da documentação":
       a CIPTEA está na Romeo Mion e na Berenice Piana, o laudo está na
       Berenice Piana, e o benefício é da Lei 8.742/1993, que ainda não foi
       conferida. O que decide é a opção marcada, lida de `comResposta`.

       A chave é `pergunta:chaveDaOpcao`, e a tabela é escrita no arquivo
       de dados — não há inferência aqui.
       --------------------------------------------------------------------- */
    function destinoDaResposta(area) {
        if (area.situacao && area.lei) {
            return situacaoDe(area);
        }

        var mapa = area.comResposta;
        if (!mapa) return null;

        for (var chave in mapa) {
            if (!Object.prototype.hasOwnProperty.call(mapa, chave)) continue;
            var partes = chave.split(':');
            var resposta = respostas[partes[1]];
            if (!resposta || resposta !== partes[1]) continue;

            var alvo = mapa[chave];
            if (alvo.emPreparacao) return { emPreparacao: true };
            var achado = situacaoDe({ lei: alvo.lei, situacao: alvo.situacao });
            if (achado) return achado;
        }

        // Nenhuma resposta casou: mostra o aviso de "em preparação" da área,
        // se houver, em vez de um resultado vazio.
        return area.emPreparacao || area.preparacao ? { emPreparacao: true } : null;
    }

    /* ---------------------------------------------------------------------
       O motor. Isto é tudo: confere a tabela, aplica o efeito escrito.

       Uma linha de `window.PERCURSOS.regras` tem esta forma:
           { area, pergunta, resposta, efeito, ... }

       Efeitos possíveis: 'destaque' (realça um passo), 'nota' (mostra um
       aviso para este caso), 'orgaos' (põe órgãos à frente).

       Não existe efeito que diga "você tem o direito a X". A regra mais
       forte que este motor aceita é "isto provavelmente se aplica a você,
       Here's o porquê" — e ela não está na tabela, por decisão.
       --------------------------------------------------------------------- */
    function efeitosDaArea(area) {
        var out = { destaques: [], notas: [], orgaosPrioritarios: [] };
        var tabela = (window.PERCURSOS && window.PERCURSOS.regras) || [];

        for (var i = 0; i < tabela.length; i++) {
            var r = tabela[i];
            if (r.area !== area.id) continue;
            if (respostas[r.pergunta] !== r.resposta) continue;

            if (r.efeito === 'destaque' && typeof r.passo === 'number') {
                out.destaques.push(r.passo);
            } else if (r.efeito === 'nota' && r.texto) {
                out.notas.push(r.texto);
            } else if (r.efeito === 'orgaos' && r.orgaos) {
                out.orgaosPrioritarios = out.orgaosPrioritarios.concat(r.orgaos);
            }
        }
        return out;
    }

    /* ---------------------------------------------------------------------
       PASSO 1 — a situação
       --------------------------------------------------------------------- */

    function mostrarAreas() {
        var caixa = $('orAreas');
        limpar(caixa);

        var areas = (window.PERCURSOS && window.PERCURSOS.areas) || [];
        areas.forEach(function (area) {
            var b = document.createElement('button');
            b.type = 'button';
            b.className = 'or-area';
            b.setAttribute('data-area', area.id);

            var topo = document.createElement('span');
            topo.className = 'or-area__topo';
            topo.appendChild(icone(area.icone));
            topo.appendChild(el('span', 'or-area__rotulo', area.rotulo));
            b.appendChild(topo);

            b.appendChild(el('span', 'or-area__resumo', area.resumo));

            if (area.emPreparacao) {
                var aviso = el('span', 'or-area__aviso', 'Em preparação');
                aviso.title = 'O texto oficial desta parte ainda não foi conferido.';
                b.appendChild(aviso);
            }

            b.addEventListener('click', function () { escolherArea(area, b); });
            caixa.appendChild(b);
        });

        $('orPasso1').hidden = false;
        $('orPasso2').hidden = true;
        $('orPasso3').hidden = true;
        $('orProgresso').dataset.passo = '1';
    }

    function escolherArea(area, botao) {
        areaEscolhida = area;
        respostas = {};

        var botoes = document.querySelectorAll('.or-area');
        for (var i = 0; i < botoes.length; i++) {
            var ativo = botoes[i] === botao;
            botoes[i].setAttribute('aria-pressed', ativo ? 'true' : 'false');
            botoes[i].classList.toggle('or-area--ativo', ativo);
        }

        // Área sem conteúdo conferido: não há perguntas para fazer. Digo
        // isso e mostro o texto oficial. Perguntar e depois responder "não
        // temos orientação ainda" seria pior do que já dizer.
        if (area.emPreparacao) {
            mostrarPreparacao(area);
            return;
        }

        mostrarPerguntas(area);
    }

    function mostrarPreparacao(area) {
        $('orPasso1').hidden = true;
        $('orPasso2').hidden = true;
        $('orPasso3').hidden = false;
        $('orProgresso').dataset.passo = '3';

        var caixa = $('orResultado');
        limpar(caixa);

        var p = area.preparacao || {};
        var cartao = el('div', 'or-prep');

        var h = el('h3', 'or-prep__titulo');
        h.appendChild(icone('fa-solid fa-flask'));
        h.appendChild(document.createTextNode(' ' + (p.titulo || 'Em preparação')));
        cartao.appendChild(h);

        cartao.appendChild(el('p', 'or-prep__texto', p.texto || ''));

        if (p.links && p.links.length) {
            var lista = el('ul', 'or-prep__links');
            p.links.forEach(function (lk) {
                var li = document.createElement('li');
                var a = document.createElement('a');
                a.href = lk.url;
                a.target = '_blank';
                a.rel = 'noopener noreferrer';
                a.appendChild(icone('fa-solid fa-arrow-up-right-from-square'));
                a.appendChild(document.createTextNode(' ' + lk.rotulo));
                li.appendChild(a);
                lista.appendChild(li);
            });
            cartao.appendChild(lista);
        }

        cartao.appendChild(el('p', 'or-prep__rodape',
            'Nada aqui é orientação jurídica. É um aviso de que ainda não '
            + 'conferimos esta parte, com o caminho para você conferir por conta própria.'));

        caixa.appendChild(cartao);
        caixa.appendChild(botaoReiniciar());
    }

    /* ---------------------------------------------------------------------
       PASSO 2 — as perguntas complementares
       --------------------------------------------------------------------- */

    function mostrarPerguntas(area) {
        var caixa = $('orPerguntas');
        limpar(caixa);

        var grupos = (window.PERCURSOS && window.PERCURSOS.perguntas) || {};
        var lista = grupos[area.perguntas] || [];

        // Só um passo visível por vez. Sem isto o passo 1 continuava na tela
        // junto com o passo 2, e a pessoa via duas listas de uma vez.
        $('orPasso1').hidden = true;
        $('orPasso2').hidden = false;
        $('orPasso3').hidden = true;
        $('orProgresso').dataset.passo = '2';
        $('orPerguntaArea').textContent = area.rotulo;

        if (!lista.length) {
            // Sem perguntas complementares: vai direto ao resultado, sem
            // fingir que há uma etapa.
            mostrarResultado();
            return;
        }

        lista.forEach(function (p, indice) {
            var bloco = el('fieldset', 'or-pergunta');
            bloco.appendChild(el('legend', 'or-pergunta__legenda', p.texto));

            var opcoes = el('div', 'or-opcoes');
            opcoes.setAttribute('role', 'radiogroup');
            opcoes.setAttribute('aria-label', p.texto);

            p.opcoes.forEach(function (o) {
                var id = 'or-' + p.id + '-' + o.chave;
                var label = document.createElement('label');
                label.className = 'or-opcao';
                label.setAttribute('for', id);

                var input = document.createElement('input');
                input.type = 'radio';
                input.name = 'or-' + p.id;
                input.id = id;
                input.value = o.chave;
                input.addEventListener('change', function () {
                    respostas[p.id] = o.chave;
                });

                label.appendChild(input);
                label.appendChild(el('span', null, o.rotulo));
                opcoes.appendChild(label);
            });

            bloco.appendChild(opcoes);
            caixa.appendChild(bloco);

            // A primeira pergunta entra no foco: quem entrou aqui quer
            // responder, e não ler.
            if (indice === 0) {
                var primeiro = opcoes.querySelector('input');
                if (primeiro) primeiro.focus();
            }
        });
    }

    /* ---------------------------------------------------------------------
       PASSO 3 — o caminho
       --------------------------------------------------------------------- */

    function mostrarResultado() {
        var caixa = $('orResultado');
        limpar(caixa);

        // Só o resultado na tela. Mesmo cuidado do passo 2.
        $('orPasso1').hidden = true;
        $('orPasso2').hidden = true;
        $('orPasso3').hidden = false;
        $('orProgresso').dataset.passo = '3';

        var achado = situacaoDe(areaEscolhida);
        if (!achado) { mostrarPreparacao(areaEscolhida); return; }

        var efeitos = efeitosDaArea(areaEscolhida);
        var lei = achado.lei;
        var sit = achado.situacao;

        // ---------- 1. O que você precisa entender
        var b1 = blocoResultado('1', 'O que você precisa entender', 'fa-solid fa-book-open');
        b1.appendChild(el('p', 'or-b1__texto', sit.direito));

        if (sit.pergunta) {
            var q = el('p', 'or-b1__pergunta');
            q.appendChild(icone('fa-solid fa-circle-question'));
            q.appendChild(document.createTextNode(' ' + sit.pergunta));
            b1.appendChild(q);
        }

        b1.appendChild(el('p', 'or-b1__artigos', 'Base: ' + (sit.artigos || '')));
        caixa.appendChild(b1);

        // ---------- 2. Quais leis podem ser relevantes
        var b2 = blocoResultado('2', 'Quais leis podem ser relevantes', 'fa-solid fa-scale-balanced');

        // Aqui não há link. A página detalhada por lei foi removida, e o
        // bloco 2 nunca foi navegação: é a identificação de qual lei
        // escreve sobre a situação. O texto oficial tem o próprio botão
        // no bloco 5, dois abaixo.
        var linhaLei = el('div', 'or-b2__lei');
        linhaLei.appendChild(el('span', 'or-b2__lei-nome', lei.nomePopular || lei.nomeOficial));
        var ident = (window.LEIS_ETIQUETAS_TIPO || {})[lei.tipo] || 'Lei';
        if (lei.numero && lei.ano) ident += ' nº ' + lei.numero + '/' + lei.ano;
        linhaLei.appendChild(el('span', 'or-b2__lei-ident', ident));

        b2.appendChild(linhaLei);

        b2.appendChild(el('p', 'or-b2__porque',
            'Ela aparece aqui porque a situação que você escolheu está descrita em ' +
            (sit.artigos || 'um destes artigos') + '. Isso não quer dizer que a lei se ' +
            'aplica a você — quer dizer que é por ali que a resposta está escrita.'));

        if (efeitos.notas.length) {
            var ul = el('ul', 'or-b2__notas');
            efeitos.notas.forEach(function (n) {
                var li = document.createElement('li');
                li.appendChild(icone('fa-solid fa-circle-info'));
                li.appendChild(el('span', null, n));
                ul.appendChild(li);
            });
            b2.appendChild(ul);
        }
        caixa.appendChild(b2);

        // ---------- 3. O que você pode fazer agora
        var b3 = blocoResultado('3', 'O que você pode fazer agora', 'fa-solid fa-list-check');
        var passos = el('ol', 'or-passos');
        (sit.passos || []).forEach(function (p, indice) {
            var li = document.createElement('li');
            if (efeitos.destaques.indexOf(indice) !== -1) {
                li.className = 'or-passo--destaque';
            }
            li.appendChild(el('span', null, p));
            passos.appendChild(li);
        });
        b3.appendChild(passos);

        if (efeitos.destaques.length) {
            b3.appendChild(el('p', 'or-b3__legenda',
                'O passo marcado apareceu por causa do que você respondeu.'));
        }
        if (sit.documentos && sit.documentos.length) {
            var docs = el('div', 'or-docs');
            docs.appendChild(el('h4', 'or-docs__titulo', 'Vale reunir'));
            var dl = el('ul', 'or-docs__lista');
            sit.documentos.forEach(function (d) { dl.appendChild(el('li', null, d)); });
            docs.appendChild(dl);
            docs.appendChild(el('p', 'or-docs__nota',
                'Nenhum destes documentos é obrigatório para todos os casos. '
                + 'O que vale depende do que você está pedindo.'));
            b3.appendChild(docs);
        }
        if (sit.observacao) {
            b3.appendChild(el('p', 'or-b3__obs', sit.observacao));
        }
        caixa.appendChild(b3);

        // ---------- 4. Onde buscar orientação
        var b4 = blocoResultado('4', 'Onde buscar orientação', 'fa-solid fa-landmark');
        var orgaos = (lei.orgaos || []).slice();
        // Quem a regra_priorizou sobe para o topo. Sem regra, a ordem é a
        // que está no arquivo — que também é a ordem em que foram
        // conferidas.
        if (efeitos.orgaosPrioritarios.length) {
            // Comparador com os dois argumentos. Um comparador que olha só
            // para `a` devolve um posto fixo, não uma diferença — e a
            // ordenação fica a cargo do algoritmo, que pode deixá-la como
            // estava. `posicao(a) - posicao(b)` é a diferença que o
            // `sort` precisa para mover mesmo.
            function posicao(orgao) {
                var i = efeitos.orgaosPrioritarios.indexOf(orgao.nome);
                return i === -1 ? 99 : i;
            }
            orgaos.sort(function (a, b) { return posicao(a) - posicao(b); });
        }
        var ul4 = el('ul', 'or-orgaos');
        orgaos.forEach(function (o, i) {
            var li = document.createElement('li');
            li.className = 'or-orgao';
            if (i === 0 && efeitos.orgaosPrioritarios.length) li.className += ' or-orgao--prioritario';
            var topo = document.createElement('div');
            topo.className = 'or-orgao__topo';
            topo.appendChild(el('span', 'or-orgao__nome', o.nome));
            if (o.custo) topo.appendChild(el('span', 'or-orgao__custo', o.custo));
            li.appendChild(topo);
            if (o.quando) li.appendChild(el('p', 'or-orgao__quando', o.quando));
            if (o.escopo) li.appendChild(el('p', 'or-orgao__escopo', o.escopo));
            ul4.appendChild(li);
        });
        b4.appendChild(ul4);
        caixa.appendChild(b4);

        // ---------- 5. Consulte a fonte original
        var b5 = blocoResultado('5', 'Consulte a fonte original', 'fa-solid fa-book');
        var assinatura = el('dl', 'or-fonte');
        [
            ['Nome oficial', lei.nomeOficial || lei.nomePopular],
            ['Tipo', (window.LEIS_ETIQUETAS_TIPO || {})[lei.tipo] || 'Lei'],
            ['Onde é publicado', 'Portal da Legislação, em planalto.gov.br'],
            ['Última conferência', lei.conferidoEm || 'ainda não conferida']
        ].forEach(function (par) {
            assinatura.appendChild(el('dt', null, par[0]));
            assinatura.appendChild(el('dd', null, par[1]));
        });
        b5.appendChild(assinatura);

        var oficial = document.createElement('a');
        oficial.className = 'or-btn or-btn--oficial';
        oficial.href = lei.url;
        oficial.target = '_blank';
        oficial.rel = 'noopener noreferrer';
        oficial.appendChild(icone('fa-solid fa-arrow-up-right-from-square'));
        oficial.appendChild(document.createTextNode(' Abrir o texto oficial'));
        b5.appendChild(oficial);

        b5.appendChild(el('p', 'or-fonte__nota',
            'Esta orientação não diz se você tem ou não tem um direito. '
            + 'Ela aponta onde a lei escreve sobre a sua situação.'));

        if (lei.limites && lei.limites.length) {
            var lim = el('div', 'or-limites');
            lim.appendChild(el('h4', 'or-limites__titulo', 'O que esta orientação não garante'));
            var ull = el('ul', 'or-limites__lista');
            lei.limites.forEach(function (t) { ull.appendChild(el('li', null, t)); });
            lim.appendChild(ull);
            b5.appendChild(lim);
        }
        caixa.appendChild(b5);

        caixa.appendChild(botaoEnviarResumo());
        caixa.appendChild(botaoReiniciar());

        // Foco no início do resultado: quem acabou de responder quer ver o
        // que respondeu, não ter que subir até o topo.
        var primeiro = caixa.querySelector('.or-bloco__titulo');
        if (primeiro) {
            primeiro.setAttribute('tabindex', '-1');
            primeiro.focus();
        }
    }

    function blocoResultado(numero, titulo, ic) {
        var sec = el('section', 'or-bloco');
        var cab = el('header', 'or-bloco__cabecalho');
        var selo = el('span', 'or-bloco__numero', numero);
        cab.appendChild(selo);
        var h = el('h3', 'or-bloco__titulo');
        h.appendChild(icone(ic));
        h.appendChild(document.createTextNode(' ' + titulo));
        cab.appendChild(h);
        sec.appendChild(cab);
        return sec;
    }

    /* ---------------------------------------------------------------------
       Enviar o resumo

       Não há servidor. Este botão NÃO envia nada, e a interface não finge
       que envia. Ele monta o texto e oferece duas saídas que funcionam de
       verdade: copiar, ou abrir o programa de e-mail da pessoa. Quem decide
       para onde vai e quando é a própria pessoa.
       --------------------------------------------------------------------- */

    function resumoEmTexto() {
        var achado = situacaoDe(areaEscolhida);
        if (!achado) return '';
        var efeitos = efeitosDaArea(areaEscolhida);
        var linhas = [];

        linhas.push('Meu caminho no Amor NeuroDivergente');
        linhas.push('====================================');
        linhas.push('');
        linhas.push('Situação: ' + areaEscolhida.rotulo);

        var grupos = (window.PERCURSOS && window.PERCURSOS.perguntas) || {};
        (grupos[areaEscolhida.perguntas] || []).forEach(function (p) {
            var chave = respostas[p.id];
            if (!chave) return;
            var achada = null;
            p.opcoes.forEach(function (o) { if (o.chave === chave) achada = o.rotulo; });
            linhas.push('- ' + p.texto + ' ' + (achada || chave));
        });

        linhas.push('');
        linhas.push('O que a LBI diz sobre isso (art. ' +
            (achado.situacao.artigos || 'ver na página') + '):');
        linhas.push('  ' + achado.situacao.direito);
        linhas.push('');
        linhas.push('Passos que a página sugere:');
        (achado.situacao.passos || []).forEach(function (t, i) {
            linhas.push('  ' + (i + 1) + '. ' + t);
        });

        if (efeitos.notas.length) {
            linhas.push('');
            linhas.push('Observações para este caso:');
            efeitos.notas.forEach(function (n) { linhas.push('  - ' + n); });
        }

        linhas.push('');
        linhas.push('Texto oficial: ' + achado.lei.url);
        linhas.push('');
        linhas.push('Aviso: este resumo é uma orientação geral, não parecer jurídico.');
        return linhas.join('\n');
    }

    function botaoEnviarResumo() {
        var caixa = el('div', 'or-envio');

        var titulo = el('h3', 'or-envio__titulo',
            'Quer levar esse caminho com você?');
        caixa.appendChild(titulo);

        caixa.appendChild(el('p', 'or-envio__texto',
            'As respostas ficaram só neste navegador, e é assim que deve ser. '
            + 'Nenhuma informação sua saiu daqui. Se quiser falar com alguém '
            + 'sobre isso, você pode copiar o resumo e mandar do jeito que '
            + 'preferir — ou abrir no seu e-mail, preencher o destinatário '
            + 'e enviar.'));

        var acoes = el('div', 'or-envio__acoes');

        var copiar = el('button', 'or-btn or-btn--primario');
        copiar.type = 'button';
        copiar.appendChild(icone('fa-solid fa-copy'));
        copiar.appendChild(document.createTextNode(' Copiar resumo'));
        copiar.addEventListener('click', function () {
            var texto = resumoEmTexto();
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(texto).then(
                    function () { avisar('Resumo copiado.'); },
                    function () { mostrarTextoParaCopiar(texto, caixa); }
                );
            } else {
                mostrarTextoParaCopiar(texto, caixa);
            }
        });
        acoes.appendChild(copiar);

        var email = el('button', 'or-btn or-btn--secundario');
        email.type = 'button';
        email.appendChild(icone('fa-solid fa-envelope'));
        email.appendChild(document.createTextNode(' Abrir no e-mail'));
        email.addEventListener('click', function () {
            var texto = resumoEmTexto();
            var link = 'mailto:?subject=' + encodeURIComponent('Meu caminho no Amor NeuroDivergente') +
                       '&body=' + encodeURIComponent(texto);
            window.location.href = link;
        });
        acoes.appendChild(email);

        caixa.appendChild(acoes);
        caixa.appendChild(el('p', 'or-envio__nota',
            'Este site não recebe o seu resumo. Ele abre o seu programa de '
            + 'e-mail com o texto pronto, e quem envia é você.'));
        return caixa;
    }

    /* Sem API de área de transferência: mostra o texto num campo para a
       pessoa selecionar à mão. Funciona em qualquer navegador, o que a
       área de transferência não garante. */
    function mostrarTextoParaCopiar(texto, caixa) {
        var antigo = caixa.querySelector('.or-envio__campo');
        if (antigo) antigo.remove();

        var rotulo = el('label', 'or-envio__rotulo',
            'Seu navegador não deixou copiar direto. Selecione e copie:');
        var area = document.createElement('textarea');
        area.className = 'or-envio__campo';
        area.readOnly = true;
        area.rows = 8;
        area.value = texto;

        caixa.insertBefore(area, caixa.querySelector('.or-envio__nota'));
        caixa.insertBefore(rotulo, area);
        area.focus();
        area.select();
    }

    function avisar(texto) {
        var alvo = $('orAviso');
        if (!alvo) return;
        alvo.textContent = texto;
        alvo.hidden = false;
        window.setTimeout(function () { alvo.hidden = true; }, 3200);
    }

    function botaoReiniciar() {
        var b = el('button', 'or-btn or-btn--fantasma');
        b.type = 'button';
        b.appendChild(icone('fa-solid fa-rotate-left'));
        b.appendChild(document.createTextNode(' Recomeçar'));
        b.addEventListener('click', function () {
            areaEscolhida = null;
            respostas = {};
            var aviso = $('orAviso');
            if (aviso) aviso.hidden = true;
            mostrarAreas();
            var topo = $('orPasso1');
            if (topo) topo.scrollIntoView({ block: 'start' });
            var area = $('orPasso1');
            if (area) area.setAttribute('tabindex', '-1');
        });
        return b;
    }

    /* ---------------------------------------------------------------------
       Início
     --------------------------------------------------------------------- */
    function iniciar() {
        var areas = $('orAreas');
        if (!areas) return;                 // a página não é esta

        // Os dois botões do passo 2 são fixos no HTML; o resto é montado.
        $('orVerResultado').addEventListener('click', mostrarResultado);
        $('orVoltarAreas').addEventListener('click', function () {
            areaEscolhida = null;
            respostas = {};
            mostrarAreas();
            var primeiro = document.querySelector('.or-area');
            if (primeiro) primeiro.focus();
        });

        if (!window.PERCURSOS || !window.PERCURSOS.areas) {
            // Sem as regras, mostrar as áreas seria fingir que o orientador
            // existe. A biblioteca continua normal logo abaixo.
            var bloco = $('orOrientador');
            if (bloco) bloco.hidden = true;
            return;
        }

        mostrarAreas();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', iniciar);
    } else {
        iniciar();
    }
})();