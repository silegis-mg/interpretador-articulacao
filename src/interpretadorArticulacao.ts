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
import { Preambulo, Titulo, Capitulo, Secao, Subsecao, Divisao } from './dispositivos/agrupadores';
import Dispositivo from './dispositivos/Dispositivo';

export enum FormatoDestino {
    OBJETO = 'objeto',
    LEXML = 'lexml',
    LEXML_STRING = 'lexml-string'
}

export enum FormatoOrigem {
    TEXTO = 'texto',
    HTML = 'html'
}

/**
 * Resultado da interpretação de articulação.
 */
export interface ArticulacaoInterpretada {
    /**
     * Texto que antecede primeiro dispositivo interpretado.
     * Se a interpretação compreendeu todo o texto,
     * este atributo deve vir vazio.
     */
    textoAnterior: string;

    /**
     * Articulação interpretada.
     */
    articulacao: QualquerDispositivo[];
}

export type QualquerDispositivo = Artigo | Paragrafo | Inciso | Alinea | Item | Preambulo | Titulo | Capitulo | Secao | Subsecao;

class Contexto {
    public ultimoItem: Dispositivo<any> | null = null;
    public textoAnterior: string = '';
    public articulacao: Dispositivo<any>[] = [];

    getUltimoItemTipo(tipo: any): Dispositivo<any> | null {
        var item = this.ultimoItem;


        if (item === null) {
            return null;
        }

        if (typeof tipo === 'function') {
            while (item && !(item instanceof tipo)) {
                item = (item as Dispositivo<any>).$parent as Dispositivo<any>;
            }
        } else if (tipo instanceof Array) {
            do {
                var j;

                for (j = 0; j < tipo.length; j++) {
                    if (item instanceof tipo[j]) {
                        return item;
                    }
                }

                item = (item as Dispositivo<any>).$parent as Dispositivo<any>;
            } while (item);
        } else {
            throw 'Argumento inválido';
        }

        return item;
    }
}

/**
 * Interpreta conteúdo de articulação.
 * 
 * @param {String} textoOriginal Texto a ser interpretado
 */
function parseTexto(textoOriginal: string): ArticulacaoInterpretada {
    var contexto = new Contexto();
    var regexpAspas = /(“[\s\S]*?”|"[\s\S]*?")/g;
    var regexpLinhas = [
        {
            item: 'parentesis',
            regexp: /^\(.+\)$/,
            onMatch: function (contexto: Contexto, m: RegExpExecArray) {
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
            requisito: [Preambulo, Titulo, Capitulo, Secao, Subsecao],
            onMatch: function (contexto: Contexto, m: RegExpExecArray) {
                if (!contexto.ultimoItem!.descricao) {
                    contexto.ultimoItem!.descricao = m[1];
                } else {
                    contexto.ultimoItem!.descricao += m[1];
                }

                return contexto.ultimoItem;
            },
            reiniciar: true
        }, {
            item: 'artigo',
            regexp: /^\s*(?:Art\.?|Artigo)\s*(\d+(?:-[a-z])?)\s*.\s*[-–]?\s*(.+)/i,
            onMatch: function (contexto: Contexto, m: RegExpExecArray) {
                var item = new Artigo(m[1], m[2]);

                contexto.articulacao.push(item);

                return item;
            }
        }, {
            item: 'paragrafo',
            regexp: /^\s*(?:Parágrafo único|§\s*(\d+))\s*.?\s*[-–]?\s*(.+)/i,
            onMatch: function (contexto: Contexto, m: RegExpExecArray) {
                var item = new Paragrafo(m[1] || 'Parágrafo único', m[2]);
                var container = contexto.getUltimoItemTipo(Artigo);

                if (!container) {
                    container = new Artigo('', contexto.textoAnterior);
                    contexto.articulacao.push(container);
                    contexto.textoAnterior = '';
                }

                container.adicionar(item);

                return item;
            }
        }, {
            item: 'inciso',
            regexp: /^\s*([IXVDLM]+)\s*[-–). ]\s*(.+)/i,
            onMatch: function (contexto: Contexto, m: RegExpExecArray) {
                var item = new Inciso(m[1], m[2]);
                var container = contexto.getUltimoItemTipo([Artigo, Paragrafo]);

                if (!container) {
                    container = new Artigo('', contexto.textoAnterior);
                    contexto.articulacao.push(container);
                    contexto.textoAnterior = '';
                }

                container.adicionar(item);

                return item;
            }
        }, {
            item: 'alinea',
            //requisito: [Inciso, Alinea, Item],
            regexp: /^\s*([a-z])\s*[-–).]\s*(.*)/i,
            onMatch: function (contexto: Contexto, m: RegExpExecArray) {
                var item = new Alinea(m[1], m[2]);
                var container = contexto.getUltimoItemTipo(Inciso);

                if (!container) {
                    let artigo = contexto.getUltimoItemTipo([Artigo, Paragrafo]);

                    if (!artigo) {
                        artigo = new Artigo('', '');
                        contexto.articulacao.push(artigo);
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
            onMatch: function (contexto: Contexto, m: RegExpExecArray) {
                var item = new Item(m[1], m[2]);
                var container = contexto.getUltimoItemTipo(Alinea);

                if (!container) {
                    container = new Alinea('', contexto.textoAnterior);

                    let inciso = contexto.getUltimoItemTipo(Inciso);

                    if (!inciso) {
                        let artigo = contexto.getUltimoItemTipo([Artigo, Paragrafo]);

                        if (!artigo) {
                            artigo = new Artigo('', '');
                            contexto.articulacao.push(artigo);
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
            item: 'preambulo',
            regexp: /^\s*PR[EÉ]-?[AÂ]MBULO\s*$/i,
            onMatch: function (contexto: Contexto, m: RegExpExecArray) {
                var item = new Preambulo('');
                contexto.articulacao.push(item);
                return item;
            }
        }, {
            item: 'titulo',
            regexp: /^\s*T[ÍI]TULO\s*([IXVDLM]+)(?:\s*[-–]\s*(.+))?/i,
            onMatch: function (contexto: Contexto, m: RegExpExecArray) {
                var item = new Titulo(m[1], m[2] || '');

                contexto.articulacao.push(item);

                return item;
            }
        }, {
            item: 'capitulo',
            regexp: /^\s*CAP[ÍI]TULO\s*([IXVDLM]+)(?:\s*[-–]\s*(.+))?/i,
            onMatch: function (contexto: Contexto, m: RegExpExecArray) {
                var item = new Capitulo(m[1], m[2] || '');

                contexto.articulacao.push(item);

                return item;
            }
        }, {
            item: 'secao',
            regexp: /^\s*SE[ÇC][ÃA]O\s*([IXVDLM]+)(?:\s*[-–]\s*(.+))?/i,
            onMatch: function (contexto: Contexto, m: RegExpExecArray) {
                var item = new Secao(m[1], m[2] || '');

                contexto.articulacao.push(item);

                return item;
            }
        }, {
            item: 'subsecao',
            regexp: /^\s*SUBSE[ÇC][ÃA]O\s*([IXVDLM]+)(?:\s*[-–]\s*(.+))?/i,
            onMatch: function (contexto: Contexto, m: RegExpExecArray) {
                var item = new Subsecao(m[1], m[2] || '');

                contexto.articulacao.push(item);

                return item;
            }
        },

    ];

    /* Para cada citação, isto é, texto entre aspas, substitui-se o seu conteúdo
     * por \0 e o conteúdo substituído é inserido na pilha de aspas, para evitar
     * que o conteúdo seja também interpretado.
     */
    var aspas: string[] = [];
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
                        contexto.ultimoItem.descricao = contexto.ultimoItem.descricao.replace(/\0/g, () => aspas.shift()!);

                        if (regexp.reiniciar) {
                            contexto.ultimoItem = null;
                        }
                    }

                    return;
                }
            }
        }

        linha = linha.replace(/\0/g, () => aspas.shift()!);

        if (contexto.ultimoItem) {
            contexto.ultimoItem.descricao += '\n' + linha;
        } else if (contexto.articulacao.length > 0 && contexto.articulacao[contexto.articulacao.length - 1] instanceof Divisao) {
            contexto.articulacao[contexto.articulacao.length - 1].descricao += '\n' + linha;
        } else if (contexto.textoAnterior.length === 0) {
            contexto.textoAnterior = linha;
        } else {
            contexto.textoAnterior += '\n' + linha;
        }
    });

    return {
        textoAnterior: contexto.textoAnterior,
        articulacao: contexto.articulacao
    };
}

/**
 * Interpreta conteúdo de articulação.
 * 
 * @param {String} texto Texto a ser interpretado
 * @param {String} formatoDestino Formato a ser retornado: 'objeto', 'lexml' (padrão) ou "lexmlString".
 * @param {String} formatoOrigem Formatao a ser processado: 'texto' (padrão), 'html'.
 * @returns {Object|DocumentFragment}
 */
function interpretarArticulacao(texto: string, formatoOrigem: FormatoOrigem = FormatoOrigem.TEXTO): ArticulacaoInterpretada {
    switch ((formatoOrigem || 'texto').toLowerCase()) {
        case 'texto':
            return parseTexto(texto);

        case 'html':
            let div = document.createElement('div');
            div.innerHTML = texto;
            return parseTexto(removerEntidadeHtml(div.innerHTML.replace(/<P(?:\s+.*?)?>(.+?)<\/P>/gi, '$1\n').replace(/<.+?>/g, '').trim()));

        default:
            throw 'Formato não suportado.';
    }
}

function removerEntidadeHtml(html: string) {
    var safeXmlEntities = ["&lt;", "&gt;", "&quot;", "&amp;", "&apos;"];

    return html.replace(/&.+?;/g, (entidade: string) => {
        if (safeXmlEntities.indexOf(entidade) >= 0) {
            return entidade;
        } else {
            /* A entidade não é uma das predefinidas no xml e é suportada só no HTML. Por exemplo: &nbsp; ou &copy;.
             * Nesse caso, converte para texto e no replace abaixo substitui pela notação unicode.
             */
            var span = document.createElement('span');
            span.innerHTML = entidade;
            return span.textContent!;
        }
    });
}

export default interpretarArticulacao;