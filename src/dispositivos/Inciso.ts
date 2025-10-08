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

import Alinea from './Alinea';
import Dispositivo, { TipoDispositivo } from './Dispositivo';
import Item from './Item';

export default class Inciso extends Dispositivo<Alinea | Item> {
    public alineas: Alinea[] = [];
    public itens?: Item[];

    constructor(numero: string, descricao: string) {
        super(TipoDispositivo.INCISO, numero, descricao, ['alineas']);
    }

    adicionar(dispositivo: Alinea | Item) {
        if (dispositivo instanceof Alinea) {
            this.alineas.push(dispositivo);
        } else if (dispositivo instanceof Item) {
            if (!this.itens) {
                this.itens = [dispositivo];
                this.derivacoes!.push('itens');
            } else {
                this.itens.push(dispositivo);
            }
        } else {
            throw new Error('Tipo não suportado.');
        }

        Object.defineProperty(dispositivo, '$parent', { value: this });
    }
}
