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
import { TipoDispositivoOuAgrupador } from "./dispositivos/Dispositivo";
import { transformarNumeroRomano, transformarLetra } from "./util/transformarNumeros";
import { QualquerDispositivo } from "./dispositivos/tipos";

export type OpcoesValidacao = {
    formatacaoEsperada?: Formatacao
}

export class Validacao {
    constructor(public readonly dispositivo: QualquerDispositivo, public readonly formatacaoNumerica: boolean, public readonly sequenciaNumerica: boolean, public readonly derivacoesValidas: boolean) { }

    get valido() {
        return this.formatacaoNumerica && this.sequenciaNumerica && this.derivacoesValidas;
    }
}

export function validarArticulacao(dispositivos: QualquerDispositivo[], opcoes: OpcoesValidacao = {}) {
    let contadorArtigos = 0;
    const ultimos: { [tipo in TipoDispositivoOuAgrupador]?: QualquerDispositivo } = {}

    function _validarArticulacao(dispositivos: QualquerDispositivo[]) {
        const contadores: {
            [tipo in TipoDispositivoOuAgrupador]: number
        } = {
            preambulo: 0,
            titulo: 0,
            capitulo: 0,
            subcapitulo: 0,
            secao: 0,
            subsecao: 0,
            get artigo() { return  contadorArtigos },
            set artigo(valor) { contadorArtigos = valor; },
            inciso: 0,
            alinea: 0,
            item: 0,
            paragrafo: 0
        };
    
        if (!opcoes.formatacaoEsperada) {
            opcoes.formatacaoEsperada = {};
        }
    
        const dispositivosInvalidos: Validacao[] = [];
    
        dispositivos.forEach(dispositivo => {
            if (!dispositivo) {
                return new Validacao(dispositivo, false, false, false);
            }

            const tipo = dispositivo.tipo;
            const formatacao = inferirFormatacao(dispositivo.numero);
            const validacaoSequencia = verificarNumeracao(dispositivo, ultimos[tipo], ++contadores[tipo], formatacao);

            if (validacaoSequencia.emendado) {
                contadores[tipo]--;
            }
    
            ultimos[tipo] = dispositivo;
    
            const subvalidacao = _validarArticulacao(dispositivo.subitens);
    
            const validacao = new Validacao(
                dispositivo,
                !opcoes.formatacaoEsperada![tipo] || opcoes.formatacaoEsperada![tipo] == formatacao || formatacao === FormatacaoNumerica.PARAGRAFO_UNICO,
                validacaoSequencia.sequenciaNumericaValida,
                subvalidacao.length === 0
            );
    
            // Parágrafo único não é considerado como formatação esperada
            if (formatacao !== FormatacaoNumerica.PARAGRAFO_UNICO) {
                opcoes.formatacaoEsperada![tipo] = formatacao;
            }
    
            dispositivosInvalidos.push(...subvalidacao);
    
            if (!validacao.valido) {
                 dispositivosInvalidos.push(validacao);
            }
        });
    
        return dispositivosInvalidos;
    }

    return _validarArticulacao(dispositivos);
}


function verificarNumeracao(dispositivo: QualquerDispositivo, anterior: QualquerDispositivo | undefined, contador: number, formatacao: FormatacaoNumerica) {
    const mEmenda = /^(.+?)-([a-z])$/i.exec(dispositivo.numero || '');

    let sequenciaNumericaValida: boolean;

    if (mEmenda) {
        const mEmendaAnterior = anterior ? /^(.+?)(?:-([a-z]))?$/i.exec(anterior.numero || '') : null;

        sequenciaNumericaValida = !!mEmendaAnterior && mEmenda[1] === mEmendaAnterior[1] &&
            (!mEmendaAnterior[2] && mEmenda[2].toUpperCase() === 'A' ||
                !!mEmendaAnterior[2] && mEmenda[2].charCodeAt(0) === mEmendaAnterior[2].charCodeAt(0) + 1);
    } else {
        sequenciaNumericaValida = dispositivo.numero === formatar(contador, formatacao);
    }

    return {
        sequenciaNumericaValida,
        emendado: !!mEmenda
    };
}

export enum FormatacaoNumerica {
    NENHUMA, ARABICO, ROMANO, ALFABETO_MINUSCULO, ALFABETO_MAIUSCULO, PARAGRAFO_UNICO
}

export type Formatacao = {
    [key in TipoDispositivoOuAgrupador]?: FormatacaoNumerica
};

function inferirFormatacao(numero: string | null): FormatacaoNumerica {
    if (!numero) {
        return FormatacaoNumerica.NENHUMA;
    }

    if (/^\d/.test(numero)) {
        return FormatacaoNumerica.ARABICO;
    }

    if (numero.localeCompare('Parágrafo único', 'pt-BR', { sensitivity: 'base' }) === 0) {
        return FormatacaoNumerica.PARAGRAFO_UNICO;
    }

    if (/^[a-z]/.test(numero)) {
        return FormatacaoNumerica.ALFABETO_MINUSCULO;
    }

    if (/^[IVXLCDM]+(?:-[A-Za-z])?$/.test(numero)) {
        return FormatacaoNumerica.ROMANO;
    }

    if (/^[A-Z]/.test(numero)) {
        return FormatacaoNumerica.ALFABETO_MAIUSCULO;
    }

    throw new Error(`Não foi possível identificar a formatação numérica para ${numero}.`);
}

function formatar(numero: number | null, formatacao: FormatacaoNumerica): string | null {
    switch (formatacao) {
        case FormatacaoNumerica.NENHUMA:
            return null;

        case FormatacaoNumerica.ARABICO:
            return numero!.toString();

        case FormatacaoNumerica.ROMANO:
            return transformarNumeroRomano(numero!);

        case FormatacaoNumerica.ALFABETO_MINUSCULO:
            return transformarLetra(numero!, false);

        case FormatacaoNumerica.ALFABETO_MAIUSCULO:
            return transformarLetra(numero!, true);

        case FormatacaoNumerica.PARAGRAFO_UNICO:
            return 'Parágrafo único';

        default:
            throw new Error('Formatação desconhecida: ' + formatacao);
    }
}