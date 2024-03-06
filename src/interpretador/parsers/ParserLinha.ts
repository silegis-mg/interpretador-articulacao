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
import Contexto from './Contexto';

export interface IParserLinha {
    processar(contexto: Contexto, linha: string): boolean;
}

export default abstract class ParserLinha implements IParserLinha {
    private readonly requisitos: Function[];

    constructor(private readonly regexp: RegExp, ...requisitos: Function[]) {
        this.requisitos = requisitos;
    }

    public processar(contexto: Contexto, linha: string): boolean {
        if (this.atendeRequisitos(contexto)) {
            const m = this.regexp.exec(linha);

            if (m) {
                const resultado = this.onMatch(contexto, m);

                if (resultado) {
                    contexto.ultimoItem = resultado;
                    return true;
                }
            }
        }

        return false;
    }

    protected abstract onMatch(contexto: Contexto, m: RegExpExecArray): Dispositivo<any> | null;

    protected atendeRequisitos(contexto: Contexto): boolean {
        return this.requisitos.length === 0 || !!this.requisitos.find((r) => contexto.ultimoItem instanceof r);
    }
}
