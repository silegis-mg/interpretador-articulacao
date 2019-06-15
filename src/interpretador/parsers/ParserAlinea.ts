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
import Paragrafo from '../../dispositivos/Paragrafo';
import Contexto from './Contexto';
import ParserLinha from './ParserLinha';

export default class ParserAlinea extends ParserLinha {
    constructor() {
        super(/^\s*([a-z](?:-[a-z])?)\s*[-–).]\s*(.*)/i);
    }

    onMatch(contexto: Contexto, m: RegExpExecArray): Dispositivo<any> | null {
        const item = new Alinea(m[1], m[2]);
        let container = contexto.getUltimoItemTipo(Inciso);

        if (!container) {
            let artigo = contexto.getUltimoItemTipo([Artigo, Paragrafo]);

            if (!artigo) {
                artigo = new Artigo('', '');
                contexto.articulacao.push(artigo);
            }

            container = new Inciso('', contexto.textoAnterior);
            artigo.adicionar(container);
            contexto.textoAnterior = '';
        }

        container.adicionar(item);

        return item;
    }
}
