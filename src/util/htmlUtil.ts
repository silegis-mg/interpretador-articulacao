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

 /**
 * Transforma as quebras de linha em elementos P.
 * 
 * @param {String} texto 
 * @returns {String}
 */
export function transformarQuebrasDeLinhaEmP(texto: string): DocumentFragment {
    var fragmento = document.createDocumentFragment();

    if (texto.indexOf('\n') === -1) {
        let p = document.createElement('p');
        p.textContent = texto;
        fragmento.appendChild(p);
    } else {
        let partes = texto.split(/\n+/g);

        partes.forEach(parte => {
            let p = document.createElement('p');
            p.textContent = parte;
            fragmento.appendChild(p);
        });
    }

    return fragmento;
}
