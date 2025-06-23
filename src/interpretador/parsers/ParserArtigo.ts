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
import Capitulo from '../../dispositivos/agrupadores/Capitulo';
import Secao from '../../dispositivos/agrupadores/Secao';
import Subsecao from '../../dispositivos/agrupadores/Subsecao';
import Titulo from '../../dispositivos/agrupadores/Titulo';
import Livro from '../../dispositivos/agrupadores/Livro';
import Artigo from '../../dispositivos/Artigo';
import Dispositivo from '../../dispositivos/Dispositivo';
import Contexto from './Contexto';
import ParserLinha from './ParserLinha';

export default class ParserArtigo extends ParserLinha {
    constructor() {
        super(/^\s*(?:Art\.?|Artigo)\s*(\d+(?:-[a-z])?)\s*.\s*[-–]?\s*(.*)/i);
    }

    onMatch(contexto: Contexto, m: RegExpExecArray): Dispositivo<any> | null {
        const item = new Artigo(m[1], m[2]);
        contexto.adicionar([Livro, Titulo, Capitulo, Secao, Subsecao], item);
        return item;
    }
}
