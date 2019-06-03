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
export enum TipoDispositivo {
    ARTIGO = 'artigo',
    PARAGRAFO = 'paragrafo',
    INCISO = 'inciso',
    ALINEA = 'alinea',
    ITEM = 'item'
}

export enum TipoAgrupador {
    PREAMBULO = 'preambulo',
    TITULO = 'titulo',
    CAPITULO = 'capitulo',
    SUBCAPITULO = 'subcapitulo',
    SECAO = 'secao',
    SUBSECAO = 'subsecao'
}

export type TipoDispositivoOuAgrupador = TipoDispositivo | TipoAgrupador;

export default abstract class Dispositivo<TiposDerivaveis extends Dispositivo<any>> {
    constructor(public readonly tipo: TipoDispositivoOuAgrupador, public numero: string | null, public descricao: string, private derivacoes?: string[]) {
    }

    public $parent? : Dispositivo<any>;

    public get subitens(): Dispositivo<TiposDerivaveis>[] {
        return this.derivacoes ? this.derivacoes.reduce((prev, item) => item in this ? prev.concat((this as any)[item]) : prev, []) : [];
    }

    /**
     * Adiciona um dispositivo a este.
     * 
     * @param {TiposDerivaveis} dispositivo 
     */
    adicionar(dispositivo: TiposDerivaveis): void {
        const tipo = dispositivo.tipo;
        const atributo = tipo + 's';

        if (!(atributo in this)) {
            throw new Error(`Derivação "${tipo}" não suportada em "${this.tipo}".`);
        }

        (this as any)[atributo].push(dispositivo);
        Object.defineProperty(dispositivo, '$parent', { value: this });
    }

    /**
     * Transforma o conteúdo na descrição em fragmento do DOM.
     */
    transformarConteudoEmFragmento(): DocumentFragment {
        var fragmento = document.createDocumentFragment();

        let p = document.createElement('p');
        p.textContent = this.descricao.replace(/\n+/g, ' '); // Transforma quebras de linha em espaços

        fragmento.appendChild(p);
        
        return fragmento;
    }
}