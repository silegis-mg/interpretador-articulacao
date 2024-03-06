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
import Escapamento from './escapamento/Escapamento';
import EscapeInterpretacao from './escapamento/EscapeInterpretacao';
import { EscapeAspas } from './escapamento/impl/EscapeAspas';
import Contexto from './parsers/Contexto';
import ParserAlinea from './parsers/ParserAlinea';
import ParserArtigo from './parsers/ParserArtigo';
import ParserCapitulo from './parsers/ParserCapitulo';
import ParserContinuacaoDivisao from './parsers/ParserContinuacaoDivisao';
import ParserInciso from './parsers/ParserInciso';
import ParserItem from './parsers/ParserItem';
import ParserLinha, { IParserLinha } from './parsers/ParserLinha';
import ParserParagrafo from './parsers/ParserParagrafo';
import ParserSecao from './parsers/ParserSecao';
import ParserSubsecao from './parsers/ParserSubsecao';
import ParserTitulo from './parsers/ParserTitulo';

export interface IOpcoesInterpretacao {
    parsersExtras?: IParserLinha[];
    escapesExtras?: EscapeInterpretacao[];
}

/**
 * Interpreta conteúdo de articulação.
 *
 * @param {String} textoOriginal Texto a ser interpretado.
 * @returns {IArticulacaoInterpretada} Resultado da interpretação.
 */
function interpretarArticulacao(textoOriginal: string,
                                opcoes: IOpcoesInterpretacao = {}): IArticulacaoInterpretada {
    const contexto = new Contexto();
    const regexpLinhas: IParserLinha[] = [
        ...(opcoes.parsersExtras ?? []),
        new ParserContinuacaoDivisao(),
        new ParserArtigo(),
        new ParserParagrafo(),
        new ParserInciso(),
        new ParserAlinea(),
        new ParserItem(),
        new ParserTitulo(),
        new ParserCapitulo(),
        new ParserSecao(),
        new ParserSubsecao()
    ];

    /* Para cada citação, isto é, texto entre aspas, substitui-se o seu conteúdo
     * por \0 e o conteúdo substituído é inserido na pilha de aspas, para evitar
     * que o conteúdo seja também interpretado.
     */
    const escapamento = new Escapamento(textoOriginal.replace(/\s*\n+\s*/g, '\n'), new EscapeAspas(), ...(opcoes.escapesExtras ?? []));

    for (const linhaSemEscapes of escapamento.processar()) {
        if (regexpLinhas.find((regexp) => regexp.processar(contexto, linhaSemEscapes))) {
            const item = contexto.ultimoItem!;

            // Desfaz os escapes.
            item.descricao = escapamento.desfazerEscapes(item.descricao);
        } else {
            const linha = escapamento.desfazerEscapes();

            if (contexto.ultimoItem) {
                // Como não foi possível processar, inclui a linha inteira no dispositivo atual.
                if (/[.:;!?$][)]?$/.test(contexto.ultimoItem.descricao) || linha.startsWith('(')) {
                    contexto.ultimoItem.descricao += '\n' + linha;
                } else {
                    contexto.ultimoItem.descricao += ' ' + linha;
                }
            } else if (contexto.articulacao.length > 0
                && contexto.articulacao[contexto.articulacao.length - 1] instanceof Divisao) {
                // TODO: Rever! Isto aqui ainda é alcansável? Se for, explicar!
                contexto.articulacao[contexto.articulacao.length - 1].descricao += '\n' + linha;
            } else if (contexto.textoAnterior.length === 0) {
                // Como não foi possível processar, registramos como texto anterior à articulação.
                contexto.textoAnterior = linha;
            } else {
                // Como não foi possível processar, acrescentamos no texto anterior à articulação.
                contexto.textoAnterior += '\n' + linha;
            }
        }
    }

    return {
        textoAnterior: contexto.textoAnterior,
        articulacao: contexto.articulacao
    };
}

export default interpretarArticulacao;
