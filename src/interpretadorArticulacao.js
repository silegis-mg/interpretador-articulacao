/* Copyright 2017 Assembleia Legislativa de Minas Gerais
 * 
 * This file is part of Editor-Articulacao.
 *
 * Editor-Articulacao is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, version 3.
 *
 * Editor-Articulacao is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with Editor-Articulacao.  If not, see <http://www.gnu.org/licenses/>.
 */

import Artigo from './dispositivos/Artigo';
import Paragrafo from './dispositivos/Paragrafo';
import Inciso from './dispositivos/Inciso';
import Alinea from './dispositivos/Alinea';
import Item from './dispositivos/Item';
import {Titulo, Capitulo, Secao, Subsecao} from './dispositivos/agrupadores'

/**
 * Interpreta conteúdo de articulação.
 * 
 * @param {String} textoOriginal Texto a ser interpretado
 */
function parseTexto(textoOriginal) {
    var contexto = {
        ultimoItem: null,
        textoAnterior: '',
        artigos: [],
        getUltimoItemTipo: function (tipo) {
            var item = this.ultimoItem;

            if (item === null) {
                return null;
            }

            if (typeof tipo === 'function') {
                while (item && !(item instanceof tipo)) {
                    item = item.$parent;
                }
            } else if (tipo instanceof Array) {
                do {
                    var j;

                    for (j = 0; j < tipo.length; j++) {
                        if (item instanceof tipo[j]) {
                            return item;
                        }
                    }

                    item = item.$parent;
                } while (item);
            } else {
                throw 'Argumento inválido';
            }

            return item;
        }
    };
    var regexpAspas = /(“[\s\S]*?”|"[\s\S]*?")/g;
    var regexpLinhas = [
        {
            item: 'parentesis',
            regexp: /^\(.+\)$/,
            onMatch: function (contexto, m) {
                if (contexto.ultimoItem) {
                    if (!contexto.ultimoItem.descricao) {
                        contexto.ultimoItem.descricao = m[0];
                    } else {
                        contexto.ultimoItem.descricao += m[0];
                    }
                }
                
                return contexto.ultimoItem;
            }
        }, {
            item: 'continuacao-divisao',
            regexp: /^\s*(.*)?\s*$/,
            requisito: [Titulo, Capitulo, Secao, Subsecao],
            onMatch: function (contexto, m) {
                if (!contexto.ultimoItem.descricao) {
                    contexto.ultimoItem.descricao = m[1];
                } else {
                    contexto.ultimoItem.descricao += m[1];
                }

                return contexto.ultimoItem;
            },
            reiniciar: true
        }, {
            item: 'artigo',
            regexp: /^\s*(?:Art\.?|Artigo)\s*(\d+(?:-[a-z])?)\s*.\s*[-–]?\s*(.+)/i,
            onMatch: function (contexto, m) {
                var item = new Artigo(m[1], m[2]);

                contexto.artigos.push(item);

                return item;
            }
        }, {
            item: 'paragrafo',
            regexp: /^\s*(?:Parágrafo único|§\s*(\d+))\s*.?\s*[-–]?\s*(.+)/i,
            onMatch: function (contexto, m) {
                var item = new Paragrafo(m[1] || 'Parágrafo único', m[2]);
                var container = contexto.getUltimoItemTipo(Artigo);

                if (!container) {
                    container = new Artigo('', contexto.textoAnterior);
                    contexto.artigos.push(container);
                    contexto.textoAnterior = '';
                }

                container.adicionar(item);

                return item;
            }
        }, {
            item: 'inciso',
            regexp: /^\s*([IXVDLM]+)\s*[-–). ]\s*(.+)/i,
            onMatch: function (contexto, m) {
                var item = new Inciso(m[1], m[2]);
                var container = contexto.getUltimoItemTipo([Artigo, Paragrafo]);

                if (!container) {
                    container = new Artigo('', contexto.textoAnterior);
                    contexto.artigos.push(container);
                    contexto.textoAnterior = '';
                }

                container.adicionar(item);

                return item;
            }
        }, {
            item: 'alinea',
            //requisito: [Inciso, Alinea, Item],
            regexp: /^\s*([a-z])\s*[-–).]\s*(.*)/i,
            onMatch: function (contexto, m) {
                var item = new Alinea(m[1], m[2]);
                var container = contexto.getUltimoItemTipo(Inciso);

                if (!container) {
                    let artigo = contexto.getUltimoItemTipo([Artigo, Paragrafo]);
                    
                    if (!artigo) {
                        artigo = new Artigo('', '');
                        contexto.artigos.push(artigo);
                    }

                    container = new Inciso('', contexto.textoAnterior);
                    artigo.adicionar(container);
                    contexto.textoAnterior = '';
                }

                container.adicionar(item);

                return item;
            }
        }, {
            item: 'item',
            //requisito: [Alinea, Item],
            regexp: /^\s*(\d)\s*[-–).]\s*(.*)/,
            onMatch: function (contexto, m) {
                var item = new Item(m[1], m[2]);
                var container = contexto.getUltimoItemTipo(Alinea);

                if (!container) {
                    container = new Alinea('', contexto.textoAnterior);

                    let inciso = contexto.getUltimoItemTipo(Inciso);

                    if (!inciso) {
                        let artigo = contexto.getUltimoItemTipo([Artigo, Paragrafo]);

                        if (!artigo) {
                            artigo = new Artigo('', '');
                            contexto.artigos.push(artigo);
                        }

                        inciso = new Inciso('', '');
                        artigo.adicionar(inciso);
                    }

                    inciso.adicionar(container);
                    contexto.textoAnterior = '';
                }

                container.adicionar(item);

                return item;
            }
        }, {
            item: 'titulo',
            regexp: /^\s*T[ÍI]TULO\s*([IXVDLM]+)(?:\s*[-–]\s*(.+))?/i,
            onMatch: function (contexto, m) {
                var item = new Titulo(m[1], m[2] ||'');

                contexto.artigos.push(item);
                
                return item;
            }
        }, {
            item: 'capitulo',
            regexp: /^\s*CAP[ÍI]TULO\s*([IXVDLM]+)(?:\s*[-–]\s*(.+))?/i,
            onMatch: function (contexto, m) {
                var item = new Capitulo(m[1], m[2] || '');

                contexto.artigos.push(item);
                
                return item;
            }
        }, {
            item: 'secao',
            regexp: /^\s*SE[ÇC][ÃA]O\s*([IXVDLM]+)(?:\s*[-–]\s*(.+))?/i,
            onMatch: function (contexto, m) {
                var item = new Secao(m[1], m[2] || '');

                contexto.artigos.push(item);
                
                return item;
            }
        }, {
            item: 'subsecao',
            regexp: /^\s*SUBSE[ÇC][ÃA]O\s*([IXVDLM]+)(?:\s*[-–]\s*(.+))?/i,
            onMatch: function (contexto, m) {
                var item = new Subsecao(m[1], m[2] || '');

                contexto.artigos.push(item);
                
                return item;
            }
        },
        
    ];

    /* Para cada citação, isto é, texto entre aspas, substitui-se o seu conteúdo
     * por \0 e o conteúdo substituído é inserido na pilha de aspas, para evitar
     * que o conteúdo seja também interpretado.
     */
    var aspas = [];
    var texto = textoOriginal.replace(regexpAspas, function (aspa) {
        aspas.push(aspa.replace(/[“”]/g, '"'));
        return '\0';
    }).replace(/\s*\n+\s*/g, '\n');

    texto.split('\n').forEach(function (linha) {
        var i, regexp, m, atendeRequisito;

        for (i = 0; i < regexpLinhas.length; i++) {
            regexp = regexpLinhas[i];

            // Verifica se a expressão está adequado ao contexto atual.
            if (regexp.requisito) {
                var j;

                atendeRequisito = false;

                for (j = 0; j < regexp.requisito.length; j++) {
                    if (contexto.ultimoItem instanceof regexp.requisito[j]) {
                        atendeRequisito = true;
                        break;
                    }
                }
            } else {
                atendeRequisito = true;
            }

            if (atendeRequisito) {
                m = regexp.regexp.exec(linha);

                if (m) {
                    contexto.ultimoItem = regexp.onMatch(contexto, m);

                    if (contexto.ultimoItem) {
                        contexto.ultimoItem.descricao = contexto.ultimoItem.descricao.replace(/\0/g, aspas.shift.bind(aspas));

                        if (regexp.reiniciar) {
                            contexto.ultimoItem = null;
                        }
                    }

                    return;
                }
            }
        }

        linha = linha.replace(/\0/g, function () {
            return aspas.shift();
        });

        if (contexto.ultimoItem) {
            contexto.ultimoItem.descricao += '\n' + linha;
        } else if (contexto.artigos.length > 0 && contexto.artigos[contexto.artigos.length - 1] instanceof Divisao) {
            contexto.artigos[contexto.artigos.length - 1].descricao += '\n' + linha;
        } else if (contexto.textoAnterior.length === 0) {
            contexto.textoAnterior = linha;
        } else {
            contexto.textoAnterior += '\n' + linha;
        }
    });

    return {
        textoAnterior: contexto.textoAnterior,
        articulacao: contexto.artigos
    };
}

function transformarEmLexML(objetoArticulacao) {
    function reducaoInciso(prev, inciso, idx, array) {

        var idInciso = array.prefixo + "_inc" + (idx + 1);

        return prev + '<Inciso id="' + idInciso + '"><Rotulo>' + inciso.numero + '</Rotulo><p>' + inciso.descricao + '</p>' +
            (inciso.alineas || []).reduce(function (prev, alinea, idx) {
                return prev + '<Alinea id="' + idInciso + '_ali' + (idx + 1) + '"><Rotulo>' + alinea.numero + '</Rotulo><p>' + alinea.descricao + '</p></Alinea>';
            }, '') + '</Inciso>';
    }

    var lexml = '<Articulacao xmlns="http://www.lexml.gov.br/1.0">' +
        objetoArticulacao.articulacao.reduce(function (prev, artigo, idx) {
            var idArt = 'art' + (idx + 1);
            var texto = prev + '<Artigo id="' + idArt + '"><Rotulo>Art. ' + (idx + 1) + (idx < 9 ? 'º' : '') + ' –</Rotulo><Caput id="' + idArt + '_cpt"><p>' + artigo.descricao + '</p>';

            if (artigo.incisos && artigo.incisos.length > 0) {
                artigo.incisos.prefixo = idArt + '_cpt';
                texto += artigo.incisos.reduce(reducaoInciso, '');
            }

            texto += '</Caput>';

            if (artigo.paragrafos && artigo.paragrafos.length > 0) {
                texto += artigo.paragrafos.reduce(function (prev, paragrafo, idx, paragrafos) {
                    var idPar = idArt + '_par' + (idx + 1);
                    if (paragrafo.incisos) {
                        paragrafo.incisos.prefixo = idPar;
                    }

                    return prev + '<Paragrafo id="' + idPar + '"><Rotulo>' +
                        (paragrafos.length === 1 ? 'Parágrafo único' : '§' + ((idx + 1) + (idx < 9 ? 'º' : ''))) +
                        ' –</Rotulo><p>' + paragrafo.descricao + '</p>' +
                        (paragrafo.incisos || []).reduce(reducaoInciso, '') +
                        '</Paragrafo>';
                }, '');
            }

            return texto + '</Artigo>';
        }, '') + '</Articulacao>';

    return lexml;
}

/**
 * Interpreta conteúdo de articulação.
 * 
 * @param {String} texto Texto a ser interpretado
 * @param {String} formatoDestino Formato a ser retornado: 'objeto', 'lexml' (padrão) ou "lexmlString".
 * @param {String} formatoOrigem Formatao a ser processado: 'texto' (padrão), 'html'.
 * @returns {Object|DocumentFragment}
 */
function interpretarArticulacao(texto, formatoDestino, formatoOrigem) {
    var objetoArticulacao;

    try {
        switch ((formatoOrigem || 'texto').toLowerCase()) {
            case 'texto':
                objetoArticulacao = parseTexto(texto);
                break;

            case 'html':
                let div = document.createElement('div');
                div.innerHTML = texto;
                objetoArticulacao = parseTexto(removerEntidadeHtml(div.innerHTML.replace(/<P>(.+?)<\/P>/gi, '$1\n').trim()));
                break;
        
            default:
                throw 'Formato não suportado.';
        }

        switch ((formatoDestino || 'lexml').toLowerCase()) {
            case 'objeto':
            case 'json':    // Apenas por compatibilidade. A terminologia JSON é inadequada.
                return objetoArticulacao;

            case 'lexml':
                return transformarEmLexMLFragmento(objetoArticulacao);

            case 'lexmlstring':
            case 'lexml-string':
                return transformarEmLexML(objetoArticulacao);

            default:
                throw 'Formato não suportado: ' + formatoDestino;
        }
    } catch (e) {
        throw {
            mensagem: 'Erro interpretando articulação.',
            item: texto,
            formato: formatoDestino,
            erroOriginal: e
        };
    }
}

function removerEntidadeHtml(html) {
    var safeXmlEntities = ["&lt;", "&gt;", "&quot;", "&amp;", "&apos;"];

    return html.replace(/&.+?;/g, function(entidade) {
        if(safeXmlEntities.indexOf(entidade)>=0) {
            return entidade;
        } else {
            /* A entidade não é uma das predefinidas no xml e é suportada só no HTML. Por exemplo: &nbsp; ou &copy;.
             * Nesse caso, converte para texto e no replace abaixo substitui pela notação unicode.
             */
            var span = document.createElement('span');
            span.innerHTML = entidade;
            return span.textContent;
        }
    });
}

function transformarEmLexMLFragmento(json) {
    let lexml = transformarEmLexML(json);
    let container = document.createElement('div');
    container.innerHTML = lexml;

    let fragmento = document.createDocumentFragment();

    while (container.firstChild) {
        fragmento.appendChild(container.firstChild);
    }

    return fragmento;
}

export default {
    Artigo: Artigo,
    Paragrafo: Paragrafo,
    Inciso: Inciso,
    Alinea: Alinea,
    Item: Item,
    Titulo: Titulo,
    Capitulo: Capitulo,
    Secao: Secao,
    Subsecao: Subsecao,
    interpretar: interpretarArticulacao,
};

export { Artigo, Paragrafo, Inciso, Alinea, Item, Titulo, Capitulo, Secao, Subsecao, interpretarArticulacao };