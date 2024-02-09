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
import { Artigo, EscapeInterpretacao } from '..';
import { Divisao } from '../dispositivos/agrupadores';
import { TipoDispositivo, TipoDispositivoOuAgrupador } from '../dispositivos/Dispositivo';
import { QualquerDispositivo } from '../dispositivos/tipos';
import {
    FormatacaoNumerica, formatar,
    inferirFormatacao, interpretarLetra, interpretarNumero
} from '../util/transformarNumeros';

export interface IOpcoesValidacao {
    formatacaoEsperada?: Formatacao;
    escapes?: EscapeInterpretacao[];
}

export class Validacao {
    constructor(public readonly dispositivo: QualquerDispositivo,
                public readonly formatacaoNumerica: boolean,
                public readonly sequenciaNumerica: boolean,
                public readonly derivacoesValidas: boolean,
                public readonly conteudo: boolean) {
    }

    get valido() {
        return this.formatacaoNumerica && this.sequenciaNumerica && this.derivacoesValidas
            && this.conteudo;
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

        dispositivos.forEach((dispositivo, idx) => {
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
                subvalidacao.length === 0,
                validarConteudo(dispositivo,
                    dispositivos[idx + 1] || obterProximoDispositivo(dispositivo),
                    opcoes.escapes || [])
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

function validarConteudo(dispositivo: QualquerDispositivo,
                         proximo: QualquerDispositivo | undefined,
                         escapes: EscapeInterpretacao[]): boolean {
    const conteudoParaValidacao =
        escapes.reduce((prev, cur) => cur.escapar(prev, () => ''), dispositivo.descricao)
        .replace(/\(.+?\)|\n+|\r+/g, '').trim();

    if (dispositivo instanceof Divisao) {
        return /^[^.:!?]+$/.test(conteudoParaValidacao);
    }

    if (dispositivo.subitens.length > 0 && (dispositivo.tipo !== TipoDispositivo.ARTIGO ||
        dispositivo.subitens[0].tipo === TipoDispositivo.INCISO)) {
        return conteudoParaValidacao.length > 1 && conteudoParaValidacao.endsWith(':');
    }

    return conteudoParaValidacao.length > 1 && (conteudoParaValidacao.endsWith('.') ||
        (!!proximo && conteudoParaValidacao.endsWith(';')
        && proximo.tipo !== TipoDispositivo.ARTIGO) ||
        /".+"$|“.+”$/.test(conteudoParaValidacao)) ||
        /^\(?(?:VETAD[OA]|REVOGAD[OA])\)?\.?/i.test(conteudoParaValidacao);
}

function obterProximoDispositivo(dispositivo: QualquerDispositivo) {
    for (let pai = dispositivo.$parent; pai; dispositivo = pai, pai = pai.$parent) {
        const idx = pai.subitens.findIndex((item) => item === dispositivo) + 1;

        if (pai.subitens.length > idx) {
            return pai.subitens[idx];
        }
    }

    return null;
}

export type Formatacao = {
    [key in TipoDispositivoOuAgrupador]?: FormatacaoNumerica
};
