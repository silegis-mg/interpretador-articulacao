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
import { EscapeAspas } from './escapamento/EscapeAspas';
import EscapeInterpretacao from './escapamento/EscapeInterpretacao';
import EscapeSimboloEscape from './escapamento/EscapeSimboloEscape';
import Contexto from './parsers/Contexto';
import ParserAlinea from './parsers/ParserAlinea';
import ParserArtigo from './parsers/ParserArtigo';
import ParserCapitulo from './parsers/ParserCapitulo';
import ParserContinuacaoDivisao from './parsers/ParserContinuacaoDivisao';
import ParserInciso from './parsers/ParserInciso';
import ParserItem from './parsers/ParserItem';
import ParserLinha from './parsers/ParserLinha';
import ParserParagrafo from './parsers/ParserParagrafo';
import ParserSecao from './parsers/ParserSecao';
import ParserSubsecao from './parsers/ParserSubsecao';
import ParserTitulo from './parsers/ParserTitulo';

export interface IOpcoesInterpretacao {
    parsersExtras?: ParserLinha[];
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
    const regexpLinhas: ParserLinha[] = [
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

    if (opcoes.parsersExtras) {
        regexpLinhas.push(...opcoes.parsersExtras);
    }

    /* Para cada citação, isto é, texto entre aspas, substitui-se o seu conteúdo
     * por \0 e o conteúdo substituído é inserido na pilha de aspas, para evitar
     * que o conteúdo seja também interpretado.
     */
    const texto = escapar(textoOriginal, contexto, opcoes.escapesExtras || []);

    texto.split('\n').forEach((linha) => {
        let escapou = false;
        const linhaSemEscapes = contexto.escape.length > 0
                              ? linha.replace(EscapeInterpretacao.ESCAPES_REGEXP, () => {
                                  escapou = true;
                                  return '';
                              })
                              : linha;

        if (regexpLinhas.find((regexp) => regexp.processar(contexto, linhaSemEscapes))) {
            if (escapou) {
                const item = contexto.ultimoItem!;
                let idxDescricao = linhaSemEscapes.indexOf(item.descricao);
                let idxEscape;
                let nEscapesAnteriores = 0;

                // Ajusta o índice da descrição, para torná-la relativa à linha com escapes.
                for (idxEscape = linha.indexOf(EscapeInterpretacao.ESCAPE);
                     idxEscape !== -1 && idxEscape <= idxDescricao;
                     idxEscape = linha.indexOf(EscapeInterpretacao.ESCAPE,
                                               idxEscape + EscapeInterpretacao.ESCAPE.length)) {
                    idxDescricao += EscapeInterpretacao.ESCAPE.length;
                    nEscapesAnteriores++;
                }

                // Ajusta o índice da descrição para escapes imediatamente anterior a ela.
                while (linha.lastIndexOf(EscapeInterpretacao.ESCAPE, idxDescricao - 1)
                       + EscapeInterpretacao.ESCAPE.length === idxDescricao) {
                    idxDescricao -= EscapeInterpretacao.ESCAPE.length;
                    nEscapesAnteriores--;
                }

                // Remove os escapes do rótulo.
                while (nEscapesAnteriores-- > 0) {
                    contexto.escape.shift();
                }

                // Desfaz os escapes.
                item.descricao = linha.substr(idxDescricao).replace(
                    EscapeInterpretacao.ESCAPES_REGEXP, () => contexto.escape.shift()!.trecho);
            }
        } else {
            if (escapou) {
                linha = linha.replace(EscapeInterpretacao.ESCAPES_REGEXP, () => contexto.escape.shift()!.trecho);
            }

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
    });

    return {
        textoAnterior: contexto.textoAnterior,
        articulacao: contexto.articulacao
    };
}

function escapar(textoOriginal: string, contexto: Contexto, escapesExtras: EscapeInterpretacao[]) {
    const escapes = [new EscapeSimboloEscape(), new EscapeAspas(), ...escapesExtras];

    const textoEscapado = escapes.reduce((prev, cur) => {
            const escapesAnteriores = [...contexto.escape];

            return cur.escapar(prev, (trecho: string, idx: number) => {
                // Ajusta o índice à posição no texto original considerando os escapamentos anteriores.
                for (let i = 0; i < escapesAnteriores.length && escapesAnteriores[i].idx <= idx; i++) {
                    idx += escapesAnteriores[i].trecho.length - EscapeInterpretacao.ESCAPE.length;
                }

                // Substitui todos os escapes contidos dentro deste novo escape pelo texto original.
                trecho = trecho.replace(EscapeInterpretacao.ESCAPES_REGEXP, (escape, idxARestaurar) => {
                    const aRemover = contexto.escape.findIndex((item) => item.idx === idxARestaurar + idx);

                    if (aRemover === -1) {
                        throw new Error(`Falha durante escapamento de ${trecho}.`);
                    }

                    const [escapeAnterior] = contexto.escape.splice(aRemover, 1);
                    idx += escapeAnterior.trecho.length - EscapeInterpretacao.ESCAPE.length;

                    return escapeAnterior.trecho;
                });

                contexto.escape.push({trecho, idx});

                return EscapeInterpretacao.ESCAPE;
            });
        }, textoOriginal)
        .replace(/\s*\n+\s*/g, '\n');

    contexto.escape.sort((a, b) => a.idx - b.idx);

    return textoEscapado;
}

export default interpretarArticulacao;
