/**
 * Escreve o número em romano.
 * 
 * @param {Number} numero 
 */
export function transformarNumeroRomano(numero: number) {
    const digitos = String(numero).split(""),
        tabela = ["", "C", "CC", "CCC", "CD", "D", "DC", "DCC", "DCCC", "CM",
            "", "X", "XX", "XXX", "XL", "L", "LX", "LXX", "LXXX", "XC",
            "", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX"];
    let resultado = "",
        i = 3;

    while (i--) {
        resultado = (tabela[+digitos.pop()! + (i * 10)] || "") + resultado;
    }
    return new Array(+digitos.join("") + 1).join("M") + resultado;
}

export function transformarNumeroRomanoEmArabico(romano: string) {
    romano = romano.toUpperCase().replace(/ +/g, '');
    let soma = 0, i = 0;
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
};

/**
 * Escreve o número em letra.
 * 
 * @param {Number} numero 
 */
export function transformarLetra(numero: number, maiuscula: boolean = false) {
    if (numero < 1) {
        throw "Número deve ser positivo.";
    }

    return String.fromCharCode((maiuscula ? 64 : 96) + numero);
}