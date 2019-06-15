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
import Capitulo from './Capitulo';
import Divisao from './Divisao';

export default class Titulo extends Divisao<Capitulo | Artigo> {
    public capitulos: Capitulo[] = [];
    public artigos: Artigo[] = [];
    constructor(numero: string, descricao: string) {
        super(TipoAgrupador.TITULO, numero, descricao, ['artigos', 'capitulos', 'secoes']);
    }
}
