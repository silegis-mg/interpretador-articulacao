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

/**
 * Escreve o número em romano.
 *
 * @param {Number} numero
 */
export function transformarNumeroRomano(numero: number) {
    const digitos = String(numero).split('');
    const tabela = ['', 'C', 'CC', 'CCC', 'CD', 'D', 'DC', 'DCC', 'DCCC', 'CM',
        '', 'X', 'XX', 'XXX', 'XL', 'L', 'LX', 'LXX', 'LXXX', 'XC',
        '', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX'];
    let resultado = '';
    let i = 3;

    while (i--) {
        resultado = (tabela[+digitos.pop()! + (i * 10)] || '') + resultado;
    }
    return new Array(+digitos.join('') + 1).join('M') + resultado;
}

/**
 * Interpreta o número romano, transformando-o em arábico.
 *
 * @param romano Número romano.
 */
export function interpretarNumeroRomano(romano: string) {
    romano = romano.toUpperCase().replace(/ +/g, '');
    let soma = 0;
    let i = 0;
    const mapa = { M: 1000, D: 500, C: 100, L: 50, X: 10, V: 5, I: 1 };

    if (/^[MDCLXVI]+$/.test(romano)) {
        while (i < romano.length) {
            let valor = (mapa as any)[romano.charAt(i++)];
            const proximo = (mapa as any)[romano.charAt(i)] || 0;
            if (proximo - valor > 0) {
                valor *= -1;
            }
            soma += valor;
        }
        return soma;
    }

    return NaN;
}

/**
 * Escreve o número em letra.
 *
 * @param {Number} numero
 */
export function transformarLetra(numero: number, maiuscula: boolean = false) {
    if (numero < 1) {
        throw new Error('Número deve ser positivo.');
    }

    return String.fromCharCode((maiuscula ? 64 : 96) + numero);
}

/**
 * Interpreta a letra.
 *
 * @param letra Letra a ser interpretada.
 * @param alfabetoCompleto Por padrão, assume o alfabeto completo. Entretanto,
 * é possível interpretar desconsiderando as letras "k", "w" e "y" na numeração
 * sequencial.
 */
export function interpretarLetra(letra: string, alfabetoCompleto: boolean = true) {
    const codigo = letra.toLowerCase().charCodeAt(0);

    if (alfabetoCompleto || codigo <= 107 /* k */) {
        return codigo - 96;
    } else if (codigo <= 119 /* w */) {
        return codigo - 97;
    } else if (codigo <= 121 /* y */) {
        return codigo - 98;
    } else {
        return codigo - 99;
    }
}

export enum FormatacaoNumerica {
    NENHUMA, ARABICO, ROMANO, ALFABETO_MINUSCULO, ALFABETO_MAIUSCULO, PARAGRAFO_UNICO
}

export function inferirFormatacao(numero: string | null): FormatacaoNumerica {
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

export function interpretarNumero(numero: string | null, formatacao?: FormatacaoNumerica): number {
    if (numero === null) {
        return 0;
    }

    [numero] = numero.split('-', 1);

    switch (formatacao || inferirFormatacao(numero)) {
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

export function formatar(numero: number | null, formatacao: FormatacaoNumerica): string | null {
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
