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
import ParserLinha from "./ParserLinha";
import Contexto from "./Contexto";
import Dispositivo from "../../dispositivos/Dispositivo";
import Paragrafo from "../../dispositivos/Paragrafo";
import Artigo from "../../dispositivos/Artigo";

export default class ParserParagrafo extends ParserLinha {
    constructor() {
        super(/^\s*(?:Parágrafo único|§\s*(\d+(?:-[a-z])?))\s*.?\s*[-–]?\s*(.+)/i);
    }

    onMatch(contexto: Contexto, m: RegExpExecArray): Dispositivo<any> | null {
        var item = new Paragrafo(m[1] || 'Parágrafo único', m[2]);
        var container = contexto.getUltimoItemTipo(Artigo);

        if (!container) {
            container = new Artigo('', contexto.textoAnterior);
            contexto.articulacao.push(container);
            contexto.textoAnterior = '';
        }

        container.adicionar(item);

        return item;
    }
}