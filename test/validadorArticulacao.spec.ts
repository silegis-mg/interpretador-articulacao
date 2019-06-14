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
import { validarArticulacao, Validacao } from "../src/validadorArticulacao";
import Artigo from "../src/dispositivos/Artigo";
import { Paragrafo, Alinea } from "../src";

describe('Validação', () => {
    it('Deve considerar válida uma articulação perfeita.', () => {
        const articulacao = [
            new Artigo('1', 'Primeiro.'),
            new Artigo('2', 'Segundo.'),
            new Artigo('3', 'Terceiro.'),
        ];
        const invalidos = validarArticulacao(articulacao);

        expect(invalidos).toEqual([]);
    });

    it('Deve ser capaz de identificar a numeração não sequencial.', () => {
        const articulacao = [
            new Artigo('1', 'Primeiro.'),
            new Artigo('2', 'Segundo.'),
            new Artigo('4', 'Terceiro.'),
        ];
        const invalidos = validarArticulacao(articulacao);

        expect(invalidos).toEqual([
            new Validacao(articulacao[2], true, false, true)
        ]);
    });

    it('Deve invalidar apenas o artigo duplicado.', () => {
        const articulacao = [
            new Artigo('1', 'Primeiro.'),
            new Artigo('2', 'Segundo.'),
            new Artigo('2', 'Duplicado.'),
            new Artigo('3', 'Terceiro.'),
            new Artigo('4', 'Quarto.'),
        ];
        const invalidos = validarArticulacao(articulacao);

        expect(invalidos).toEqual([
            new Validacao(articulacao[2], true, false, true)
        ]);
    });

    it('Deve suportar parágrafo único.', () => {
        const artigo = new Artigo('1', 'Primeiro.');
        const paragrafo = new Paragrafo('Parágrafo único', 'Teste do parágrafo único.');

        artigo.adicionar(paragrafo);

        const invalidos = validarArticulacao([artigo]);
        expect(invalidos).toEqual([]);
    });

    it('Deve aceitar ausência de alíneas k, w e y.', () => {
        const alineas = [];
        const ultimo = 'z'.charCodeAt(0);
        const k = 'k'.charCodeAt(0);
        const w = 'w'.charCodeAt(0);
        const y = 'y'.charCodeAt(0);

        for (let i = 'a'.charCodeAt(0); i <= ultimo; i++) {
            if (i !== k && i !== w && i !== y) {
                alineas.push(new Alinea(String.fromCharCode(i), 'teste;'));
            }
        }

        const invalidos = validarArticulacao(alineas);
        expect(invalidos).toEqual([]);
    });
})