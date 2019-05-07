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

import Dispositivo from './Dispositivo';
import { transformarQuebrasDeLinhaEmP } from '../util';
import { Inciso, Paragrafo } from '../interpretadorArticulacao';

export default class Artigo extends Dispositivo {
    constructor(numero, caput) {
        super('artigo', numero, caput, ['incisos', 'paragrafos']);
        this.incisos = [];
        this.paragrafos = [];
    }

    adicionar(incisoOuParagrafo) {
        var self = this;

        Object.defineProperty(incisoOuParagrafo, '$parent', {
            get: function () {
                return self;
            }
        });

        if (incisoOuParagrafo instanceof Inciso) {
            this.incisos.push(incisoOuParagrafo);
        } else if (incisoOuParagrafo instanceof Paragrafo) {
            this.paragrafos.push(incisoOuParagrafo);
        } else {
            throw 'Tipo não suportado.';
        }
    }

    transformarConteudoEmFragmento() {
        return transformarQuebrasDeLinhaEmP(this.descricao);
    }

}

