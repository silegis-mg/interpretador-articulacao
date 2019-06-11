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
import { transformarQuebrasDeLinhaEmP } from "./util";

describe('transfomarQuebrasDeLinhaEmP', function () {
    it('Deve envolver única linha', function () {
        var fragmento = transformarQuebrasDeLinhaEmP('linha única');

        expect(fragmento.childNodes.length).toBe(1);
        expect(fragmento.firstElementChild!.outerHTML).toBe('<p>linha única</p>');
    });

    it('Deve separar duas linhas', function () {
        var fragmento = transformarQuebrasDeLinhaEmP('linha 1\nlinha 2');

        expect(fragmento.childNodes.length).toBe(2);
        expect(fragmento.firstElementChild!.outerHTML).toBe('<p>linha 1</p>');
        expect(fragmento.lastElementChild!.outerHTML).toBe('<p>linha 2</p>');
    });

    it('Deve separar três linhas', function () {
        var fragmento = transformarQuebrasDeLinhaEmP('linha 1\nlinha 2\nlinha 3');

        expect(fragmento.childNodes.length).toBe(3);
        expect(fragmento.firstElementChild!.outerHTML).toBe('<p>linha 1</p>');
        expect(fragmento.children[1].outerHTML).toBe('<p>linha 2</p>');
        expect(fragmento.lastElementChild!.outerHTML).toBe('<p>linha 3</p>');
    });

    it('Deve ignorar linhas vazias', function () {
        var fragmento = transformarQuebrasDeLinhaEmP('linha 1\n\nlinha 2\n\n\nlinha 3');

        expect(fragmento.childNodes.length).toBe(3);
        expect(fragmento.firstElementChild!.outerHTML).toBe('<p>linha 1</p>');
        expect(fragmento.children[1].outerHTML).toBe('<p>linha 2</p>');
        expect(fragmento.lastElementChild!.outerHTML).toBe('<p>linha 3</p>');
    });
});
