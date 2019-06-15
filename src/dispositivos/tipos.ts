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
import { Capitulo, Preambulo, Secao, Subsecao, Titulo } from './agrupadores';
import Alinea from './Alinea';
import Artigo from './Artigo';
import Inciso from './Inciso';
import Item from './Item';
import Paragrafo from './Paragrafo';

export type QualquerDispositivo = Artigo | Paragrafo | Inciso | Alinea | Item
    | Preambulo | Titulo | Capitulo | Secao | Subsecao;
