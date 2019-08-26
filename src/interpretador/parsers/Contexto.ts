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
import Dispositivo from '../../dispositivos/Dispositivo';

export default class Contexto {
    public ultimoItem: Dispositivo<any> | null = null;
    public textoAnterior: string = '';
    public articulacao: Dispositivo<any>[] = [];
    public escape: IEscape[] = [];

    getUltimoItemTipo(tipo: any): Dispositivo<any> | null {
        let item = this.ultimoItem;

        if (item === null) {
            return null;
        }

        if (typeof tipo === 'function') {
            while (item && !(item instanceof tipo)) {
                item = (item as Dispositivo<any>).$parent as Dispositivo<any>;
            }
        } else if (tipo instanceof Array) {
            do {
                let j;

                for (j = 0; j < tipo.length; j++) {
                    if (item instanceof tipo[j]) {
                        return item;
                    }
                }

                item = (item as Dispositivo<any>).$parent as Dispositivo<any>;
            } while (item);
        } else {
            throw new Error('Argumento inválido: ' + tipo);
        }

        return item;
    }

    adicionar(tipoUltimoItem: any, dispositivo: Dispositivo<any>) {
        const ultimoItem = this.getUltimoItemTipo(tipoUltimoItem);

        if (ultimoItem) {
            ultimoItem.adicionar(dispositivo);
        } else {
            this.articulacao.push(dispositivo);
        }

        this.ultimoItem = dispositivo;
    }
}

export interface IEscape {
    trecho: string;
    idx: number;
}
