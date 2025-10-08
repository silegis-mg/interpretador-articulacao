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
import Alinea from '../../dispositivos/Alinea';
import Artigo from '../../dispositivos/Artigo';
import Dispositivo from '../../dispositivos/Dispositivo';
import Inciso from '../../dispositivos/Inciso';
import Item from '../../dispositivos/Item';
import Paragrafo from '../../dispositivos/Paragrafo';
import Contexto from './Contexto';
import ParserLinha from './ParserLinha';

export default class ParserItem extends ParserLinha {
    constructor(private readonly hierarquiaRigida = false) {
        super(/^\s*(\d(?:-[a-z])?)\s*[-–).]\s*(.*)/);
    }

    onMatch(contexto: Contexto, m: RegExpExecArray): Dispositivo<any> | null {
        const item = new Item(m[1], m[2]);
        let container = contexto.getUltimoItemTipo(this.hierarquiaRigida ? [Alinea] : [Alinea, Inciso, Paragrafo, Artigo]);

        if (!container) {
            container = new Alinea('', '');

            let inciso = contexto.getUltimoItemTipo(Inciso);

            if (!inciso) {
                let artigo = contexto.getUltimoItemTipo([Artigo, Paragrafo]);

                if (!artigo) {
                    artigo = new Artigo('', '');
                    contexto.articulacao.push(artigo);
                }

                inciso = new Inciso('', '');
                artigo.adicionar(inciso);
            }

            inciso.adicionar(container);
        }

        container.adicionar(item);

        return item;
    }
}
