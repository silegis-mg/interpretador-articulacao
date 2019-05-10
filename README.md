[![npm version](https://badge.fury.io/js/silegismg-interpretador-articulacao.svg)](https://badge.fury.io/js/silegismg-interpretador-articulacao) [![Build Status](https://travis-ci.org/silegis-mg/interpretador-articulacao.svg?branch=master)](https://travis-ci.org/silegis-mg/interpretador-articulacao)

# Interpretador de Articulação

O interpretador de Articulação é uma biblioteca de parser de texto articulado extraído do editor de articulação,
ambas elaboradas pela Assembleia Legislativa de Minas Gerais, como parte do Sistema de Informação Legislativa de
Minas Gerais (Silegis-MG).

Ele permite a interpretação de texto articulado (texto puro ou HTML), transformando em um objeto estruturado
contendo dispositivos, tais como artigos, parágrafos, incisos, alíneas e itens, bem como as divisões em preâmbulo,
títulos, capítulos, seções e subseções. O resultado da interpretação é uma árvore de objetos estruturado, contendo
a articulação completa.

## Como usar em seu código

```
npm install --save-prod silegismg-interpretador-articulacao
```

<a name="api-interpretador"></a>

## API do interpretador

Para interpretar um texto puro, transformando em um objeto estruturado, utilize a função interpretar (veja [código-fonte](src/interpretadorArticulacao.ts)), com a seguinte sintaxe:

```javascript
// nodejs
const interpretarArticulacao = require('silegismg-interpretador-articulacao');

let resultado = interpretarArticulacao(texto, formatoOrigem);
```

```typescript
// typescript
import interpretarArticulacao from 'silegismg-interpretador-articulacao';

let resultado = interpretarArticulacao(texto, formatoOrigem);
```

onde ``texto`` é uma `string` e ``formatoOrigem`` é "texto" (padrão) ou "html".

O resultado é um objeto contendo a seguinte interface:

```typescript
/**
 * Resultado da interpretação de articulação.
 */
interface ArticulacaoInterpretada {
    /**
     * Texto que antecede primeiro dispositivo interpretado.
     * Se a interpretação compreendeu todo o texto,
     * este atributo deve vir vazio.
     */
    textoAnterior: string;

    /**
     * Articulação interpretada.
     */
    articulacao: QualquerDispositivo[];
}

type QualquerDispositivo = Artigo | Paragrafo | Inciso | Alinea | Item | Preambulo | Titulo | Capitulo | Secao | Subsecao

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
    subitens: Dispositivo
}

class Preambulo extends Divisao { }
class Titulo extends Divisao { }
class Capitulo extends Divisao { }
class Secao extends Divisao { }
class Subsecao extends Divisao { }
```