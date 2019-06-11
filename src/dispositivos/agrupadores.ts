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

import Dispositivo from './Dispositivo';
import Artigo from './Artigo';
import { TipoAgrupador } from './Dispositivo';

export abstract class Divisao<T extends Dispositivo<any>> extends Dispositivo<T> {
    constructor(tipo: TipoAgrupador, numero: string | null, descricao: string, derivacoes?: string[]) {
        super(tipo, numero, descricao, derivacoes);
    }
}

export class Preambulo extends Divisao<Titulo | Artigo> {
    public titulos: Titulo[] = [];
    public artigos: Artigo[] = [];

    constructor(descricao: string) {
        super(TipoAgrupador.PREAMBULO, null, descricao, ['artigos', 'titulos', 'capitulos', 'secoes']);
    }
}

export class Titulo extends Divisao<Capitulo | Artigo> {
    public capitulos: Capitulo[] = [];
    public artigos: Artigo[] = [];

    constructor(numero: string, descricao: string) {
        super(TipoAgrupador.TITULO, numero, descricao, ['artigos', 'capitulos', 'secoes']);
    }
}

export class Capitulo extends Divisao<Secao | Artigo> {
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

export class Secao extends Divisao<Subsecao | Artigo> {
    public subsecoes: Subsecao[] = [];
    public artigos: Artigo[] = [];

    constructor(numero: string, descricao: string) {
        super(TipoAgrupador.SECAO, numero, descricao, ['artigos', 'subsecoes']);
    }

    adicionar(dispositivo: Subsecao | Artigo): void {
        Object.defineProperty(dispositivo, '$parent', { value: this });

        if (dispositivo instanceof Subsecao) {
            this.subsecoes.push(dispositivo);
        } else if (dispositivo instanceof Artigo) {
            this.artigos.push(dispositivo);
        } else {
            throw new Error('Derivação não suportada.');
        }
    }
}

export class Subsecao extends Divisao<Artigo> {
    public artigos: Artigo[] = [];

    constructor(numero: string, descricao: string) {
        super(TipoAgrupador.SUBSECAO, numero, descricao, ['artigos']);
    }
}
