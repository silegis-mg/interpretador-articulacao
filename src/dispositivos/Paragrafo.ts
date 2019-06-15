/* Copyright 2017 Assembleia Legislativa de Minas Gerais
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

import Dispositivo, { TipoDispositivo } from './Dispositivo';
import Inciso from './Inciso';

export default class Paragrafo extends Dispositivo<Inciso> {
    public incisos: Inciso[] = [];

    constructor(numero: string, descricao: string) {
        super(TipoDispositivo.PARAGRAFO, numero, descricao, ['incisos']);
    }

    adicionar(inciso: Inciso) {
        if (!(inciso instanceof Inciso)) {
            throw new Error('Tipo não suportado.');
        }

        Object.defineProperty(inciso, '$parent', { value: this });

        this.incisos.push(inciso);
    }
}
