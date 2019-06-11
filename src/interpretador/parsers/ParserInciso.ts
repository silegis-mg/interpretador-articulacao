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
import Inciso from "../../dispositivos/Inciso";
import { transformarNumeroRomanoEmArabico } from "../../util/transformarNumeros";
import Artigo from "../../dispositivos/Artigo";
import Paragrafo from "../../dispositivos/Paragrafo";
import Alinea from "../../dispositivos/Alinea";

export default class ParserInciso extends ParserLinha {
    constructor() {
        super(/^\s*([IXVDLM]+(?:-[a-z])?)\s*[-–). ]\s*(.+)/i);
    }

    onMatch(contexto: Contexto, m: RegExpExecArray): Dispositivo<any> | null {
        const numero = m[1];

        if (numero.length === 1 && contexto.ultimoItem && contexto.ultimoItem instanceof Alinea) {
            // Pode ser que, na verdade, trata-se de uma alínea sendo confundida com um inciso.
            const ultimoInciso = contexto.getUltimoItemTipo(Inciso);

            if (!ultimoInciso || (contexto.ultimoItem.numero && numero.charCodeAt(0) === contexto.ultimoItem.numero.charCodeAt(0) + 1
                && transformarNumeroRomanoEmArabico(ultimoInciso.numero!) !== transformarNumeroRomanoEmArabico(numero) + 1)) {
                // Trata-se da sequência da alínea!
                return null;
            }

            if (/[A-Z]+/.test(ultimoInciso.numero!) && /[a-z]+/.test(numero)) {
                // Não está na sequência, mas a caixa indica que se trata de alínea.
                return null;
            }
        }

        const item = new Inciso(m[1], m[2]);
        var container = contexto.getUltimoItemTipo([Artigo, Paragrafo]);

        if (!container) {
            container = new Artigo('', contexto.textoAnterior);
            contexto.articulacao.push(container);
            contexto.textoAnterior = '';
        }

        container.adicionar(item);

        return item;
    }
}