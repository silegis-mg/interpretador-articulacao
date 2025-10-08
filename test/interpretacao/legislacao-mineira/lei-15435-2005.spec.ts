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
import { describe, it, expect } from '@jest/globals';
import { readFileSync } from 'fs';
import { interpretarArticulacao, validarArticulacao, TipoDispositivo, Titulo } from '../../../src';
import { contarDispositivos } from '../../testUtil';

describe('Lei 15.435/2005', () => {
    const regimento = readFileSync('test/interpretacao/legislacao-mineira/lei-15435-2005.txt').toString();
    const interpretacao = interpretarArticulacao(regimento);

    it('Deve alertar dispositivo vetado', () => {
        const validacao = validarArticulacao(interpretacao.articulacao);

        expect(validacao).toMatchSnapshot();
    });

    it('Deve descartar epígrafe e pré-âmbulo',  () => {
        expect(interpretacao.textoAnterior).toMatchSnapshot();
    });

    it('Deve possuir 11 artigos', () => {
        const contagem = contarDispositivos(interpretacao, TipoDispositivo.ARTIGO);
        expect(contagem).toBe(11);
    });

    it('Deve interpretar toda a lei', () => {
        expect(interpretacao.articulacao).toMatchSnapshot();
    });
});
