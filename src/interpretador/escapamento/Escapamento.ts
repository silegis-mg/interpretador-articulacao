/* Copyright 2023 Assembleia Legislativa de Minas Gerais
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
import { IEscape } from '../parsers/Contexto';
import EscapeInterpretacao from './EscapeInterpretacao';
import { EscapeAspas } from './impl/EscapeAspas';
import EscapeSimboloEscape from './impl/EscapeSimboloEscape';

interface IContextoEscapamento {
    trechoComEscapes: string;
    escapou: boolean;
    trechoSemEscapes: string;
}

/**
 * Processa um texto, omitindo trechos que não devem fazer parte do processamento.
 */
export default class Escapamento {

    private contexto: IContextoEscapamento | null = null;
    private readonly escapes: IEscape[] = [];
    private readonly textoEscapado;

    /**
     * Prepara o processamento, escapando o texto.
     * 
     * @param textoOriginal Texto a ser processado.
     * @param escapesExtras Escapadores a serem utilizados.
     */
    constructor(textoOriginal: string, ...escapesExtras: EscapeInterpretacao[]) {
        const escapadores = [new EscapeSimboloEscape(), ...escapesExtras];
    
        /*
         * Para cada citação, isto é, texto entre aspas, substitui-se o seu conteúdo
         * por \0 e o conteúdo substituído é inserido na pilha de aspas, para evitar
         * que o conteúdo seja também interpretado.
         * 
         * Desta maneira, de forma transparente, por meio do método processar, é
         * possível iterar por todas linhas sem o conteúdo escapado para realizar
         * o devido processamento textual.
         */
        this.textoEscapado = escapadores.reduce((prev, cur) => {
            const escapesAnteriores = [...this.escapes];
    
            /**
             * Determina o índice em que deve inserir o escape de forma ordenada
             * no contexto.
             */
            let idxAdicaoVetorEscape = 0;
    
            return cur.escapar(prev, (trecho: string, idx: number) => {
                // Ajusta o índice à posição no texto original considerando os escapamentos anteriores.
                for (let i = 0; i < escapesAnteriores.length && escapesAnteriores[i].idx <= idx; i++) {
                    idx += escapesAnteriores[i].trecho.length - EscapeInterpretacao.ESCAPE.length;
                }
    
                // Substitui todos os escapes contidos dentro deste novo escape pelo texto original.
                let idxBaseRestauracao = idx;
    
                trecho = trecho.replace(EscapeInterpretacao.ESCAPES_REGEXP, (escape, idxARestaurar) => {
                    const idxCorrigido = idxARestaurar + idxBaseRestauracao;
                    const aRemover = this.escapes.findIndex((item) => item.idx === idxCorrigido);
    
                    if (aRemover === -1) {
                        throw new Error('Falha durante escapamento.');
                    }
    
                    const [escapeAnterior] = this.escapes.splice(aRemover, 1);
                    idxBaseRestauracao += escapeAnterior.trecho.length - EscapeInterpretacao.ESCAPE.length;
    
                    return escapeAnterior.trecho;
                });
                
                while (idxAdicaoVetorEscape > 0 && this.escapes[idxAdicaoVetorEscape].idx > idx) {
                    idxAdicaoVetorEscape--;
                }
    
                while (this.escapes.length > idxAdicaoVetorEscape && this.escapes[idxAdicaoVetorEscape].idx < idx) {
                    idxAdicaoVetorEscape++;
                }
    
                this.escapes.splice(idxAdicaoVetorEscape, 0, { trecho: trecho, idx });
    
                return EscapeInterpretacao.ESCAPE;
            });
        }, textoOriginal);
    }


    *processar(): Generator<string, void, unknown> {
        for (const trecho of this.textoEscapado.split('\n')) {
            if (this.escapes.length === 0) {
                this.contexto = {
                    trechoComEscapes: trecho,
                    escapou: false,
                    trechoSemEscapes: trecho
                };
            } else {
                const trechoSemEscapes = trecho.replace(EscapeInterpretacao.ESCAPES_REGEXP, '');

                this.contexto = {
                    trechoComEscapes: trecho,
                    trechoSemEscapes,
                    escapou: trechoSemEscapes.length !== trecho.length
                }
            }

            yield this.contexto.trechoSemEscapes;
        }
    }

    desfazerEscapes(): string;
    desfazerEscapes(trecho: string): string;
    desfazerEscapes(trecho?: string): string | void {
        if (!this.contexto) {
            throw new Error('Contexto de escapamento está nulo.');
        }

        try {
            if (!this.contexto.escapou) {
                return trecho ?? this.contexto.trechoComEscapes;
            } else if (trecho === undefined) {
                return this.contexto.trechoComEscapes.replace(EscapeInterpretacao.ESCAPES_REGEXP, () => this.escapes.shift()!.trecho);
            } else {
                let idxTrecho = this.contexto.trechoSemEscapes.indexOf(trecho);
                let idxEscape;
                let nEscapesAnteriores = 0;

                // Ajusta o índice da descrição, para torná-la relativa à linha com escapes.
                for (idxEscape = this.contexto.trechoComEscapes.indexOf(EscapeInterpretacao.ESCAPE);
                    idxEscape !== -1 && idxEscape <= idxTrecho;
                    idxEscape = this.contexto.trechoComEscapes.indexOf(EscapeInterpretacao.ESCAPE,
                                            idxEscape + EscapeInterpretacao.ESCAPE.length)) {
                    idxTrecho += EscapeInterpretacao.ESCAPE.length;
                    nEscapesAnteriores++;
                }

                // Ajusta o índice da descrição para escapes imediatamente anterior a ela.
                while (nEscapesAnteriores > 0 && this.contexto.trechoComEscapes.lastIndexOf(EscapeInterpretacao.ESCAPE, idxTrecho - 1)
                    + EscapeInterpretacao.ESCAPE.length === idxTrecho) {
                    idxTrecho -= EscapeInterpretacao.ESCAPE.length;
                    nEscapesAnteriores--;
                }

                // Remove os escapes do rótulo.
                while (nEscapesAnteriores-- > 0) {
                    this.escapes.shift();
                }

                return this.contexto.trechoComEscapes.substring(idxTrecho).replace(
                    EscapeInterpretacao.ESCAPES_REGEXP, () => this.escapes.shift()!.trecho);
            }
        } finally {
            this.contexto = null;
        }
    }
}