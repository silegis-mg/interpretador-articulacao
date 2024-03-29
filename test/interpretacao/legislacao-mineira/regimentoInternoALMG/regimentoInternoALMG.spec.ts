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
import { readFileSync } from 'fs';
import { TipoDispositivo } from '../../../../src/dispositivos/Dispositivo';
import { Titulo } from '../../../../src/dispositivos/agrupadores';
import interpretarArticulacao from '../../../../src/interpretador/interpretarArticulacao';
import { validarArticulacao } from '../../../../src/interpretador/validadorArticulacao';
import { contarDispositivos } from '../../../testUtil';

describe('Regimento Interno da ALMG', () => {
    const regimento = readFileSync('test/interpretacao/legislacao-mineira/regimentoInternoALMG/regimento-almg.txt').toString();
    const interpretacao = interpretarArticulacao(regimento);

    it('Deve estar válida a interpretação do regimento interno da ALMG', () => {
        const validacao = validarArticulacao(interpretacao.articulacao);

        expect(validacao).toEqual([]);
    });

    it('Não deve ficar nenhum texto de fora.',  () => {
        expect(interpretacao.textoAnterior).toBe('');
    });

    it('Deve possuir 14 títulos', () => {
        expect(interpretacao.articulacao.length).toBe(14);
        expect(interpretacao.articulacao[13].numero).toBe('XIV');
        expect(interpretacao.articulacao[13].descricao).toEqual('DISPOSIÇÕES FINAIS E TRANSITÓRIAS');
    });

    it('Deve possuir 332 artigos', () => {
        const contagem = contarDispositivos(interpretacao, TipoDispositivo.ARTIGO);
        expect(contagem).toBe(319 + 9 /* emendas -A */ + 3 /* -B */ + 1 /* -C */);
    });

    it('O último artigo deve possuir o número 319', () => {
        expect((interpretacao.articulacao[13] as Titulo).artigos[6].numero).toBe('319');
    });

    it('Deve interpretar todo  regimento interno', () => {
        expect(interpretacao.articulacao).toMatchSnapshot();
    });
});
