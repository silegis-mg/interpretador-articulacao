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

export default abstract class Dispositivo<TiposDerivaveis> {
    constructor(tipo: TipoDispositivoOuAgrupador, public numero: string | null, public descricao: string, derivacoes?: string[]) {
        Object.defineProperty(this, 'tipo', {
            value: tipo
        });

        if (derivacoes) {
            Object.defineProperty(this, 'subitens', {
                get: function() {
                    return derivacoes.reduce((prev, item) => prev.concat(this[item]), []);
                }
            });
        }
    }

    public $parent? : Dispositivo<any>;

    /**
     * Adiciona um dispositivo a este.
     * 
     * @param {TiposDerivaveis} dispositivo 
     */
    abstract adicionar(dispositivo: TiposDerivaveis): void;

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