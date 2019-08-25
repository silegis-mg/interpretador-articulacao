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
import * as parser from '../../../src/index';

describe('Escapamento de tags', () => {
    it('Deve suportar tags de HTML', () => {
        const texto = `<label>Art. 1 –</label> <i>Lorem ipsum.</i>`;
        const objeto = parser.interpretarArticulacao(texto, { escapesExtras: [new parser.EscapeTags()] });

        expect(objeto).toEqual({
            textoAnterior: '',
            articulacao: [
                new parser.Artigo('1', `<i>Lorem ipsum.</i>`)
            ]
        });

        expect(parser.validarArticulacao(objeto.articulacao, { escapes: [new parser.EscapeTags()] })).toEqual([]);
    });
});
