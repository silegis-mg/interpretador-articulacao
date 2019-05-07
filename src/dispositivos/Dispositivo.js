/* Copyright 2017 Assembleia Legislativa de Minas Gerais
 * 
 * This file is part of Interpretador-Articulacao.
 *
 * Editor-Articulacao is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, version 3.
 *
 * Editor-Articulacao is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with Editor-Articulacao.  If not, see <http://www.gnu.org/licenses/>.
 */

export default class Dispositivo {
    constructor(tipo, numero, descricao, derivacoes) {
        this.numero = numero;
        this.descricao = descricao;

        Object.defineProperty(this, 'tipo', {
            value: tipo
        });

        if (derivacoes) {
            Object.defineProperty(this, 'subitens', {
                get: function() {
                    return derivacoes.reduce((prev, item) => prev.concat(this[item]), []);
                }
            });
        }
    }

    /**
     * Adiciona um dispositivo a este.
     * 
     * @param {Dispositivo} dispositivo 
     */
    adicionar(dispositivo) {
        throw 'Não implementado';
    }

    /**
     * Transforma o conteúdo na descrição em fragmento do DOM.
     */
    transformarConteudoEmFragmento() {
        var fragmento = document.createDocumentFragment();

        let p = document.createElement('p');
        p.textContent = this.descricao.replace(/\n+/g, ' '); // Transforma quebras de linha em espaços

        fragmento.appendChild(p);
        
        return fragmento;
    }
}