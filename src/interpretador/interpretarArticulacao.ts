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
import { IArticulacaoInterpretada } from './ArticulacaoInterpretada';
import Contexto from './parsers/Contexto';
import ParserAlinea from './parsers/ParserAlinea';
import ParserArtigo from './parsers/ParserArtigo';
import ParserCapitulo from './parsers/ParserCapitulo';
import ParserContinuacaoDivisao from './parsers/ParserContinuacaoDivisao';
import ParserInciso from './parsers/ParserInciso';
import ParserItem from './parsers/ParserItem';
import ParserLinha from './parsers/ParserLinha';
import ParserParagrafo from './parsers/ParserParagrafo';
import ParserParentesis from './parsers/ParserParentesis';
import ParserPreambulo from './parsers/ParserPreambulo';
import ParserSecao from './parsers/ParserSecao';
import ParserSubsecao from './parsers/ParserSubsecao';
import ParserTitulo from './parsers/ParserTitulo';

/**
 * Interpreta conteúdo de articulação.
 *
 * @param {String} textoOriginal Texto a ser interpretado.
 * @returns {IArticulacaoInterpretada} Resultado da interpretação.
 */
function interpretarArticulacao(textoOriginal: string): IArticulacaoInterpretada {
    const contexto = new Contexto();
    const regexpLinhas: ParserLinha[] = [
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
    const texto = escaparAspas(textoOriginal, contexto).replace(/\s*\n+\s*/g, '\n');

    texto.split('\n').forEach((linha) => {
        if (!regexpLinhas.find((regexp) => regexp.processar(contexto, linha))) {
            linha = linha.replace(/\0/g, () => contexto.aspas.shift()!);

            if (contexto.ultimoItem) {
                if (/[.:;!?$][)\0]?$/.test(contexto.ultimoItem.descricao)) {
                    contexto.ultimoItem.descricao += '\n' + linha;
                } else {
                    contexto.ultimoItem.descricao += ' ' + linha;
                }
            } else if (contexto.articulacao.length > 0
                && contexto.articulacao[contexto.articulacao.length - 1] instanceof Divisao) {

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
 * Escapa as aspas, substituindo-as por \0, que funciona como
 * placeholder das aspsas. Ao final de cada parser de dispositivo,
 * o \0 é substituído pelas aspas armazenadas no contexto do parser.
 *
 * @param texto Texto a ser escapado.
 * @param contexto Contexto do parser.
 */
function escaparAspas(texto: string, contexto: Contexto): string {
    const regexpAspas = /[“”"]/g;
    let resultado = '';
    let ultimo = 0;
    let abertura: number;
    let nAberturas = 0;

    for (let m = regexpAspas.exec(texto); m; m = regexpAspas.exec(texto)) {
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

        contexto.aspas.push(texto.substr(abertura!, m.index - abertura! + 1));
    }

    resultado += texto.substr(ultimo);

    return resultado;
}

export default interpretarArticulacao;
