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
import { validarArticulacao, Validacao } from "./validadorArticulacao";
import Artigo from "./dispositivos/Artigo";
import { Paragrafo } from ".";

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

    it('Deve suportar parágrafo único', () => {
        const artigo = new Artigo('1', 'Primeiro.');
        const paragrafo = new Paragrafo('Parágrafo único', 'Teste do parágrafo único.');
        
        artigo.adicionar(paragrafo);
        
        const invalidos = validarArticulacao([artigo]);
        expect(invalidos).toEqual([]);
    })
})