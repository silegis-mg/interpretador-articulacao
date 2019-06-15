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
import { Capitulo, Preambulo, Secao, Subsecao, Titulo } from './dispositivos/agrupadores';
import Alinea from './dispositivos/Alinea';
import Artigo from './dispositivos/Artigo';
import Inciso from './dispositivos/Inciso';
import Item from './dispositivos/Item';
import Paragrafo from './dispositivos/Paragrafo';
import interpretarArticulacao from './interpretador/interpretarArticulacao';
import { validarArticulacao } from './validadorArticulacao';

export {
    Artigo, Paragrafo, Inciso, Alinea, Item, Preambulo, Titulo,
    Capitulo, Secao, Subsecao, interpretarArticulacao, validarArticulacao
};