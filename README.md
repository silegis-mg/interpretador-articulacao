# Interpretador de Articulação

O interpretador de Articulação é uma biblioteca de parser de texto articulado extraído do editor de articulação, ambas elaboradas pela Assembleia Legislativa de Minas Gerais,
como parte do Sistema de Informação Legislativa de Minas Gerais (Silegis-MG).

Ele permite a interpretação de texto articulado (texto puro ou HTML), transformando em um objeto estruturado contendo dispositivos, tais como artigos, parágrafos,
incisos, alíneas e itens, bem como as divisões em títulos, capítulos, seções e subseções. O resultado do parser pode ser uma árvore de objetos ou texto articulado em formato XML, conforme elemento `Articulacao` definido pelo schema do [LexML](https://github.com/lexml/lexml-xml-schemas/tree/master/src/main/resources/xsd).

## Como usar a partir do código fonte

### Pré-requisitos para testes

* [NodeJS com npm](https://nodejs.org/en/download/)

### Instalação das dependências

Após baixar o código, mude para o diretório onde encontram os fontes e instale as dependências: 

```
npm install
```

### Executando os testes de unidade

```
npm run-script test
```


<a name="api-interpretador"></a>

## API do interpretador

Para interpretar um texto puro, transformando em um texto estruturado utilizando LexML, utilize a função interpretar (veja [código-fonte](src/interpretadorArticulacao.js)), com a seguinte sintaxe:

```javascript
interpretar(texto, formatoDestino, formatoOrigem);
```

onde ``texto`` é uma `string`, ``formatoDestino`` é uma das opções "objeto", "lexml" (padrão) ou "lexmlString" e ``formatoOrigem`` é "texto" (padrão) ou "html".