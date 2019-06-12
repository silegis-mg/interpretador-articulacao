/* Copyright 2017 Assembleia Legislativa de Minas Gerais
 * 
 * This file is part of Interpretador-Articulacao.
 *
 * Interpretador-Articulacao is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, version 3.
 *
 * Interpretador-Articulacao is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with Interpretador-Articulacao.  If not, see <http://www.gnu.org/licenses/>.
 */

import { Divisao } from '../dispositivos/agrupadores';
import { ArticulacaoInterpretada } from './ArticulacaoInterpretada';
import Contexto from './parsers/Contexto';
import ParserLinha from './parsers/ParserLinha';
import ParserParentesis from './parsers/ParserParentesis';
import ParserContinuacaoDivisao from './parsers/ParserContinuacaoDivisao';
import ParserParagrafo from './parsers/ParserParagrafo';
import ParserArtigo from './parsers/ParserArtigo';
import ParserInciso from './parsers/ParserInciso';
import ParserAlinea from './parsers/ParserAlinea';
import ParserItem from './parsers/ParserItem';
import ParserPreambulo from './parsers/ParserPreambulo';
import ParserTitulo from './parsers/ParserTitulo';
import ParserCapitulo from './parsers/ParserCapitulo';
import ParserSecao from './parsers/ParserSecao';
import ParserSubsecao from './parsers/ParserSubsecao';

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
 * Interpreta conteúdo de articulação.
 * 
 * @param {String} textoOriginal Texto a ser interpretado
 */
function parseTexto(textoOriginal: string): ArticulacaoInterpretada {
    var contexto = new Contexto();
    var regexpLinhas: ParserLinha[] = [
        new ParserParentesis(),
        new ParserContinuacaoDivisao(),
        new ParserArtigo(),
        new ParserParagrafo(),
        new ParserInciso(),
        new ParserAlinea(),
        new ParserItem(),
        new ParserPreambulo(),
        new ParserTitulo(),
        new ParserCapitulo(),
        new ParserSecao(),
        new ParserSubsecao()
    ];

    /* Para cada citação, isto é, texto entre aspas, substitui-se o seu conteúdo
     * por \0 e o conteúdo substituído é inserido na pilha de aspas, para evitar
     * que o conteúdo seja também interpretado.
     */
    var texto = escaparAspas(textoOriginal, contexto).replace(/\s*\n+\s*/g, '\n');

    texto.split('\n').forEach(function (linha) {
        if (!regexpLinhas.find(regexp => regexp.processar(contexto, linha))) {
            linha = linha.replace(/\0/g, () => contexto.aspas.shift()!);

            if (contexto.ultimoItem) {
                if (/[.:;!?$][)\0]?$/.test(contexto.ultimoItem.descricao)) {
                    contexto.ultimoItem.descricao += '\n' + linha;
                } else {
                    contexto.ultimoItem.descricao += ' ' + linha;
                }
            } else if (contexto.articulacao.length > 0 && contexto.articulacao[contexto.articulacao.length - 1] instanceof Divisao) {
                contexto.articulacao[contexto.articulacao.length - 1].descricao += '\n' + linha;
            } else if (contexto.textoAnterior.length === 0) {
                contexto.textoAnterior = linha;
            } else {
                contexto.textoAnterior += '\n' + linha;
            }
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
    const safeXmlEntities = ["&lt;", "&gt;", "&quot;", "&amp;", "&apos;"];

    return html.replace(/&.+?;/g, (entidade: string) => {
        if (safeXmlEntities.indexOf(entidade) >= 0) {
            return entidade;
        } else {
            /* A entidade não é uma das predefinidas no xml e é suportada só no HTML. Por exemplo: &nbsp; ou &copy;.
             * Nesse caso, converte para texto e no replace abaixo substitui pela notação unicode.
             */
            const span = document.createElement('span');
            span.innerHTML = entidade;
            return span.textContent!;
        }
    });
}

/**
 * Escapa as aspas, substituindo-as por \0, que funciona como
 * placeholder das aspsas. Ao final de cada parser de dispositivo,
 * o \0 é substituído pelas aspas armazenadas no contexto do parser.
 * 
 * @param texto Texto a ser escapado.
 * @param contexto Contexto do parser.
 */
function escaparAspas(texto: string, contexto: Contexto): string {
    const regexpAspas = /[“”"]/g;
    let m, resultado = '', ultimo = 0;
    let abertura: number, nAberturas = 0;

    while (m = regexpAspas.exec(texto)) {
        switch (m[0]) {
            case '“':
                if (nAberturas++ === 0) {
                    abertura = m.index;
                }
                continue;

            case '”':
                if (nAberturas-- > 1) {
                    continue;
                }
                break;

            case '"':
                if (nAberturas === 0) {
                    nAberturas++;
                    abertura = m.index;
                    continue;
                } else if (nAberturas-- > 1) {
                    continue;
                }
                break;
        }

        resultado += texto.substr(ultimo, abertura! - ultimo) + '\0';
        ultimo = m.index + 1;

        contexto.aspas.push(texto.substr(abertura!, m.index));
    }

    resultado += texto.substr(ultimo);

    return resultado;
}

export default interpretarArticulacao;