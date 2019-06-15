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
import { Artigo } from '.';
import { TipoDispositivoOuAgrupador } from './dispositivos/Dispositivo';
import { QualquerDispositivo } from './dispositivos/tipos';
import {
    interpretarLetra, interpretarNumeroRomano,
    transformarLetra, transformarNumeroRomano
} from './util/transformarNumeros';

export interface IOpcoesValidacao {
    formatacaoEsperada?: Formatacao;
}

export class Validacao {
    constructor(public readonly dispositivo: QualquerDispositivo,
                public readonly formatacaoNumerica: boolean,
                public readonly sequenciaNumerica: boolean,
                public readonly derivacoesValidas: boolean) {
    }

    get valido() {
        return this.formatacaoNumerica && this.sequenciaNumerica && this.derivacoesValidas;
    }
}

export function validarArticulacao(dispositivosOriginais: QualquerDispositivo[],
                                   opcoes: IOpcoesValidacao = {}): Validacao[] {
    let ultimoArtigo: Artigo;

    function _validarArticulacao(dispositivos: QualquerDispositivo[]) {
        const ultimos: { [tipo in TipoDispositivoOuAgrupador]?: QualquerDispositivo } = {
            get artigo() { return ultimoArtigo; },
            set artigo(artigo) { ultimoArtigo = artigo; }
        };

        if (!opcoes.formatacaoEsperada) {
            opcoes.formatacaoEsperada = {};
        }

        const dispositivosInvalidos: Validacao[] = [];

        dispositivos.forEach((dispositivo) => {
            if (!dispositivo) {
                return new Validacao(dispositivo, false, false, false);
            }

            const tipo = dispositivo.tipo;
            const formatacao = inferirFormatacao(dispositivo.numero);
            const validacaoSequencia = verificarNumeracao(dispositivo, ultimos[tipo], formatacao);

            ultimos[tipo] = dispositivo;

            const subvalidacao = _validarArticulacao(dispositivo.subitens);
            const validacaoFormatacaoNumerica = !opcoes.formatacaoEsperada![tipo]
                || opcoes.formatacaoEsperada![tipo] === formatacao
                || formatacao === FormatacaoNumerica.PARAGRAFO_UNICO;

            const validacao = new Validacao(
                dispositivo,
                validacaoFormatacaoNumerica,
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

    return _validarArticulacao(dispositivosOriginais);
}

function verificarNumeracao(dispositivo: QualquerDispositivo,
                            anterior: QualquerDispositivo | undefined,
                            formatacao: FormatacaoNumerica) {
    const mEmenda = /^(.+?)-([a-z])$/i.exec(dispositivo.numero || '');
    let sequenciaNumericaValida: boolean;

    if (mEmenda) {
        const mEmendaAnterior = anterior ? /^(.+?)(?:-([a-z]))?$/i.exec(anterior.numero || '') : null;

        sequenciaNumericaValida = !!mEmendaAnterior && mEmenda[1] === mEmendaAnterior[1] &&
            (!mEmendaAnterior[2] && mEmenda[2].toUpperCase() === 'A' ||
                !!mEmendaAnterior[2] && mEmenda[2].charCodeAt(0) === mEmendaAnterior[2].charCodeAt(0) + 1);
    } else {
        const proximoNumero = anterior ? interpretarNumero(anterior.numero, formatacao) + 1 : 1;

        sequenciaNumericaValida = dispositivo.numero === formatar(proximoNumero, formatacao) ||
            !!anterior && !!anterior.numero && !!dispositivo.numero &&
            (
                formatacao === FormatacaoNumerica.ALFABETO_MINUSCULO ||
                formatacao === FormatacaoNumerica.ALFABETO_MAIUSCULO
            ) && (
                interpretarLetra(dispositivo.numero) !== interpretarLetra(anterior.numero) + 1 &&
                interpretarLetra(dispositivo.numero, false) === interpretarLetra(anterior.numero, false) + 1
            );
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

function interpretarNumero(numero: string | null, formatacao: FormatacaoNumerica): number {
    if (numero === null) {
        return 0;
    }

    [numero] = numero.split('-', 1);

    switch (formatacao) {
        case FormatacaoNumerica.NENHUMA:
            return 0;

        case FormatacaoNumerica.ARABICO:
            return parseInt(numero);

        case FormatacaoNumerica.PARAGRAFO_UNICO:
            return 1;

        case FormatacaoNumerica.ALFABETO_MAIUSCULO:
        case FormatacaoNumerica.ALFABETO_MINUSCULO:
            return interpretarLetra(numero);

        case FormatacaoNumerica.ROMANO:
            return interpretarNumeroRomano(numero);

        default:
            throw new Error('Formatação desconhecida: ' + formatacao);
    }
}
