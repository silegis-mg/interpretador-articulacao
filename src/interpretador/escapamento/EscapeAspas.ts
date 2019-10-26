import EscapeInterpretacao, { SubstituirCallback } from './EscapeInterpretacao';

export class EscapeAspas extends EscapeInterpretacao {
    /**
     * Escapa as aspas, substituindo-as por \0, que funciona como
     * placeholder das aspsas. Ao final de cada parser de dispositivo,
     * o \0 é substituído pelas aspas armazenadas no contexto do parser.
     *
     * @param texto Texto a ser escapado.
     * @param contexto Contexto do parser.
     */
    escapar(texto: string, substituir: SubstituirCallback): string {
        const regexpAspas = /[“”‘’"]/g;
        let resultado = '';
        let ultimo = 0;
        let abertura: number;
        let nAberturas = 0;

        for (let m = regexpAspas.exec(texto); m; m = regexpAspas.exec(texto)) {
            switch (m[0]) {
                case '“':
                case '‘':
                    if (nAberturas++ === 0) {
                        abertura = m.index;
                    }
                    continue;

                case '’':
                    if (m.index === 0 ||
                        /\S/.test(texto.charAt(m.index - 1)) && !/\s|[.:?!)\]}]/.test(texto.charAt(m.index + 1))) {
                        continue;
                    }
                    // continua no próximo case.

                case '”':
                    if (nAberturas-- > 1) {
                        continue;
                    }
                    break;

                case '"':
                    if (nAberturas === 0) {
                        nAberturas++;
                        abertura = m.index;
                        continue;
                    } else if (nAberturas-- > 1) {
                        continue;
                    }
                    break;

                default:
                    throw new Error('Resultado esperado de casamento de aspas: ' + m[0]);
            }

            if (nAberturas < 0) {
                nAberturas = 0;
            } else {
                resultado += texto.substr(ultimo, abertura! - ultimo) +
                    substituir(texto.substr(abertura!, m.index - abertura! + 1), abertura!);
                ultimo = m.index + 1;
            }
        }

        resultado += texto.substr(ultimo);

        return resultado;
    }
}
