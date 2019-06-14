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

import Dispositivo, { TipoDispositivo } from './Dispositivo';
import { transformarQuebrasDeLinhaEmP } from '../util/htmlUtil';
import Inciso from './Inciso';
import Paragrafo from './Paragrafo';

export default class Artigo extends Dispositivo<Inciso | Paragrafo> {
    public incisos: Inciso[] = [];
    public paragrafos: Paragrafo[] = [];

    constructor(numero: string, caput: string) {
        super(TipoDispositivo.ARTIGO, numero, caput, ['incisos', 'paragrafos']);
    }

    adicionar(incisoOuParagrafo: Inciso | Paragrafo) {
        Object.defineProperty(incisoOuParagrafo, '$parent', { value: this });

        if (incisoOuParagrafo instanceof Inciso) {
            this.incisos.push(incisoOuParagrafo);
        } else if (incisoOuParagrafo instanceof Paragrafo) {
            this.paragrafos.push(incisoOuParagrafo);
        } else {
            throw 'Tipo não suportado.';
        }
    }

    transformarConteudoEmFragmento() {
        return transformarQuebrasDeLinhaEmP(this.descricao);
    }

}

