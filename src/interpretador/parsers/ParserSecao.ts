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
import { Capitulo, Preambulo, Secao, Titulo } from '../../dispositivos/agrupadores';
import Dispositivo from '../../dispositivos/Dispositivo';
import Contexto from './Contexto';
import ParserLinha from './ParserLinha';

export default class ParserSecao extends ParserLinha {
    constructor() {
        super(/^\s*SE[ÇC][ÃA]O\s*([IXVDLM]+(?:-[a-z])?)(?:\s*[-–]\s*(.+))?/i);
    }

    onMatch(contexto: Contexto, m: RegExpExecArray): Dispositivo<any> | null {
        const item = new Secao(m[1], m[2] || '');
        contexto.adicionar([Capitulo, Titulo, Preambulo], item);
        return item;
    }
}
