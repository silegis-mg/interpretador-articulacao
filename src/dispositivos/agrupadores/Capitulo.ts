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
import Artigo from '../Artigo';
import { TipoAgrupador } from '../Dispositivo';
import Divisao from './Divisao';
import Secao from './Secao';

export default class Capitulo extends Divisao<Secao | Artigo> {
    public secoes: Secao[] = [];
    public artigos: Artigo[] = [];
    constructor(numero: string, descricao: string) {
        super(TipoAgrupador.CAPITULO, numero, descricao, ['artigos', 'secoes']);
    }
    adicionar(dispositivo: Secao | Artigo): void {
        Object.defineProperty(dispositivo, '$parent', { value: this });
        if (dispositivo instanceof Secao) {
            this.secoes.push(dispositivo);
        } else if (dispositivo instanceof Artigo) {
            this.artigos.push(dispositivo);
        } else {
            throw new Error('Derivação não suportada.');
        }
    }
}
