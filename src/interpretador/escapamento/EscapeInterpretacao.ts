/* Copyright 2019 Assembleia Legislativa de Minas Gerais
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

export default abstract class EscapeInterpretacao {
    /**
     * Valor a ser colocado no trecho escapado.
     */
    static readonly ESCAPE = '\0';

    /**
     * Expressão regular para encontrar todos os escapes.
     */
    static readonly ESCAPES_REGEXP = /\0/g;

    /**
     * Função de escape, que, a partir da entrada e do contexto,
     * processa a entrada, realizando os devidos escapes, retornando
     * o texto a ser considerado.
     */
    abstract escapar(entrada: string, substituir: SubstituirCallback): string;
}

export type SubstituirCallback = (trechoEscapado: string) => string;
