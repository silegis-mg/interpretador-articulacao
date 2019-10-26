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
import { EscapeAspas } from '../../../src/interpretador/escapamento/EscapeAspas';

describe('Escapamento de aspas', () => {
    it('Deve suportar dispositivos revogados', () => {
        const texto = `Art. 139 – (Revogado pelo art. 111 da Resolução da ALMG nº 5.511, de 1º/12/2015.)
Dispositivo revogado:
“Art. 139 – Para efeito de contagem, os votos relativos ao parecer são:
I – favoráveis, os “pela conclusão”, os “com restrição” e os “em separado” não divergentes da conclusão;
II – contrários, os divergentes da conclusão.
Parágrafo único – Considerar-se-á voto vencido o parecer rejeitado.”`;
        const objeto = parser.interpretarArticulacao(texto);

        expect(objeto).toEqual({
            textoAnterior: '',
            articulacao: [
                new parser.Artigo('139', `(Revogado pelo art. 111 da Resolução da ALMG nº 5.511, de 1º/12/2015.)
Dispositivo revogado:
“Art. 139 – Para efeito de contagem, os votos relativos ao parecer são:
I – favoráveis, os “pela conclusão”, os “com restrição” e os “em separado” não divergentes da conclusão;
II – contrários, os divergentes da conclusão.
Parágrafo único – Considerar-se-á voto vencido o parecer rejeitado.”`
                )
            ]
        });
    });

    it('Deve suportar várias aspas.', () => {
        const texto = 'Art. 1º - Este é um "teste.\nArt 2º - Este é outro teste."'
            + ' para ver o "escapamento\nArt. 2º - em funcionamento.".';
        const objeto = parser.interpretarArticulacao(texto);

        expect(objeto).toEqual({
            textoAnterior: '',
            articulacao: [
                new parser.Artigo('1', 'Este é um "teste.\nArt 2º - Este é outro teste."' +
                    ' para ver o "escapamento\nArt. 2º - em funcionamento.".')
            ]
        });
    });

    it('Não deve confundir apóstrofo', () => {
        const texto = 'Art 1º - Marca d’água.';
        const escape = new EscapeAspas();

        escape.escapar(texto, () => fail('Não deveria escapar.'));
    });
});
