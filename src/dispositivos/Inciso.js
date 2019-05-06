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
import { Alinea } from '../interpretadorArticulacao';

export default class Inciso extends Dispositivo {
    constructor(numero, descricao) {
        super('inciso', numero, descricao, ['alineas']);
        this.alineas = [];
    }

    adicionar(alinea) {
        var self = this;

        if (!(alinea instanceof Alinea)) {
            throw 'Tipo não suportado.';
        }

        Object.defineProperty(alinea, '$parent', {
            get: function () {
                return self;
            }
        });

        this.alineas.push(alinea);
    }
}