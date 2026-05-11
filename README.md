[![npm version](https://badge.fury.io/js/silegismg-interpretador-articulacao.svg)](https://badge.fury.io/js/silegismg-interpretador-articulacao)
![Build Status](https://github.com/silegis-mg/interpretador-articulacao/actions/workflows/node.js.yml/badge.svg)
[![Maintainability](https://api.codeclimate.com/v1/badges/57b06a9447c32924de3f/maintainability)](https://codeclimate.com/github/silegis-mg/interpretador-articulacao/maintainability)
[![Test Coverage](https://api.codeclimate.com/v1/badges/57b06a9447c32924de3f/test_coverage)](https://codeclimate.com/github/silegis-mg/interpretador-articulacao/test_coverage)

# Interpretador de Articulação

O interpretador de Articulação é uma biblioteca de parser de texto articulado extraído do editor de articulação,
ambas elaboradas pela Assembleia Legislativa de Minas Gerais, como parte do Sistema de Informação Legislativa de
Minas Gerais (Silegis-MG).

Ele permite a interpretação de texto articulado (texto puro), transformando em um objeto estruturado
contendo dispositivos, tais como artigos, parágrafos, incisos, alíneas e itens, bem como as divisões em preâmbulo,
títulos, capítulos, seções e subseções. O resultado da interpretação é uma árvore de objetos estruturado, contendo
a articulação completa.

## Como usar em seu código

```
npm install --save-prod silegismg-interpretador-articulacao
```

<a name="api-interpretador"></a>

## API do interpretador

Para interpretar um texto puro, transformando em um objeto estruturado, utilize a função interpretar (veja [código-fonte](src/interpretarArticulacao.ts)), com a seguinte sintaxe:

```javascript
// nodejs
const interpretador = require('silegismg-interpretador-articulacao');

let resultado = interpretador.interpretarArticulacao(texto);
```

```typescript
// typescript
import { interpretarArticulacao } from 'silegismg-interpretador-articulacao';

let resultado = interpretarArticulacao(texto);
```

onde ``texto`` é uma `string`.

O resultado é um objeto contendo a seguinte interface:

```typescript
/**
 * Resultado da interpretação de articulação.
 */
interface IArticulacaoInterpretada {
    /**
     * Texto que antecede primeiro dispositivo interpretado.
     * Se a interpretação compreendeu todo o texto,
     * este atributo deve vir nulo.
     */
    textoAnterior: string | null;

    /**
     * Articulação interpretada.
     */
    articulacao: QualquerDispositivo[];

    /**
     * Texto que segue ao último dispositivo interpretado.
     * Se a interpretação compreendeu todo o texto,
     * este atributo deve vir nulo.
     * 
     * Se undefined, o interpretador não tentou separar o texto posterior.
     */
    textoPosterior?: string | null;
}

type QualquerDispositivo = Artigo | Paragrafo | Inciso | Alinea | Item | Titulo | Capitulo | Secao | Subsecao

abstract class Dispositivo {
    public tipo: string;
    public numero?: string; // Pois pode ser "123-A"
    public descricao: string;
}

class Artigo extends Dispositivo {
    incisos: Inciso[];
    paragrafos: Paragrafo[]
}

class Inciso extends Dispositivo {
    alineas: Alinea[]
}

class Alinea extends Dispositivo {
    itens: Item[]
}

class Paragrafo extends Dispositivo {
    incisos: Inciso[]
}

abstract class Divisao extends Dispositivo {
    subitens: Dispositivo[]
}

class Titulo extends Divisao { }
class Capitulo extends Divisao { }
class Secao extends Divisao { }
class Subsecao extends Divisao { }
```

### Opções de interpretação

O método `interpretarArticulacao(texto: string, opcoes: IOpcoesInterpretacao)` permite estender
a capacidade do parser, seja por meio da introdução de parsers extras de linha ou de escapes
extra de texto.

```typescript
interface IOpcoesInterpretacao {
    parsersExtras?: ParserLinha[];
    escapesExtras?: EscapeInterpretacao[];

    /**
     * Determina que a hierarquia de dispositivos é rígida. Neste caso, alínea
     * deve estar sempre dentro de algum inciso e item sempre dentro de alguma alínea.
     */
    hierarquiaRigida?: boolean;

    /**
     * Identifica texto posterior à articulação, como o fecho, e o separa da descrição do último dispositivo interpretado.
     */
    identificarTextoPosterior?: boolean | {
        regexp: RegExp;

        /**
         * Offset do índice da expressão regular a ser considerada.
         */
        offset: number | ((match: RegExpExecArray) => number);
    }
}
```

Nesta biblioteca, existe apenas a implementação do escape de tags de HTML, por meio da classe
`EscapeTags`. O desenvolvedor pode criar seus próprios escapes, implementando a interface
`EscapeInterpretacao` e passando a instância do escape criado por meio da opção `escapesExtras`.

É possível também definir a identificação de texto posterior à articulação, como o fecho, por meio da opção
`identificarTextoPosterior`. Se esta opção for definida como `true`, o interpretador irá procurar por um
ponto final (`.`) e separar o texto posterior a ele do último dispositivo interpretado. Sendo o local
do fecho fixo, pode-se definir um padrão de expressão regular e um offset para a identificação do texto
posterior, por meio de um objeto com as chaves `regexp` e `offset`. Exemplo:

```typescript
    const interpretacao = interpretarArticulacao(norma, {
        identificarTextoPosterior: {
            regexp: /^Palácio da Liberdade,/m,
            offset: -1
        }
    });
```

## API do validador

Após a interpretação, é possível validar o conteúdo estruturado por meio do método `validarArticulacao`.

```typescript
import { interpretarArticulacao } from 'silegismg-interpretador-articulacao';

const resultado = interpretarArticulacao(texto);
const validacao = validarArticulacao(resultado.articulacao);

if (validacao.length > 0) {
    throw new Error('Há erros do conteúdo interpretado.');
}
```

Os seguintes critérios são avaliados durante a validação:

- formatação do dispositivo, verificando se o padrão adequado é adotado naquele dispositivo;
- sequência numérica;
- conteúdo e pontuação.
