/* Copyright 2017 Assembleia Legislativa de Minas Gerais
 * 
 * This file is part of Interpretador-Articulacao.
 *
 * Editor-Articulacao is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, version 3.
 *
 * Editor-Articulacao is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with Editor-Articulacao.  If not, see <http://www.gnu.org/licenses/>.
 */

import Dispositivo, { TipoDispositivoOuAgrupador } from './Dispositivo';
import Artigo from './Artigo';
import { TipoAgrupador } from './Dispositivo';

export abstract class Divisao<T> extends Dispositivo<T> {
    public subitens: T[] = [];

    constructor(tipo: TipoDispositivoOuAgrupador, numero: string | null, descricao: string) {
        super(tipo, numero, descricao);
    }
    
    adicionar(item: T) {
        this.subitens.push(item);
    }
}

export class Preambulo extends Divisao<Titulo | Artigo> {
    constructor(descricao: string) {
        super(TipoAgrupador.PREAMBULO, null, descricao);
    }
}

export class Titulo extends Divisao<Capitulo | Artigo> {
    constructor(numero: string, descricao: string) {
        super(TipoAgrupador.TITULO, numero, descricao);
    }
}

export class Capitulo extends Divisao<Secao | Artigo> {
    constructor(numero: string, descricao: string) {
        super(TipoAgrupador.CAPITULO, numero, descricao);
    }
}

export class Secao extends Divisao<Subsecao | Artigo> {
    constructor(numero: string, descricao: string) {
        super(TipoAgrupador.SECAO, numero, descricao);
    }
}

export class Subsecao extends Divisao<Artigo> {
    constructor(numero: string, descricao: string) {
        super(TipoAgrupador.SUBSECAO, numero, descricao);
    }
}
