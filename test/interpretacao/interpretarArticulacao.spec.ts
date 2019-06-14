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

import * as parser from '../../src/index';
import { FormatoOrigem } from '../../src/interpretador/interpretarArticulacao';

describe('Parser de articulação', function () {
    function novo(tipo: any, obj: any): any {
        if (obj instanceof Array) {
            return obj.map(o => novo(tipo, o));
        } else {
            var novoObj = new tipo(obj.numero, obj.descricao);

            (obj.titulos || []).forEach((i: any) => novoObj.adicionar(novo(parser.Titulo, i)));
            (obj.capitulos || []).forEach((i: any) => novoObj.adicionar(novo(parser.Capitulo, i)));
            (obj.secoes || []).forEach((i: any) => novoObj.adicionar(novo(parser.Secao, i)));
            (obj.subsecoes || []).forEach((i: any) => novoObj.adicionar(novo(parser.Subsecao, i)));
            (obj.artigos || []).forEach((i: any) => novoObj.adicionar(novo(parser.Artigo, i)));
            (obj.incisos || []).forEach((i: any) => novoObj.adicionar(novo(parser.Inciso, i)));
            (obj.paragrafos || []).forEach((i: any) => novoObj.adicionar(novo(parser.Paragrafo, i)));
            (obj.alineas || []).forEach((i: any) => novoObj.adicionar(novo(parser.Alinea, i)));
            (obj.itens || []).forEach((i: any) => novoObj.adicionar(novo(parser.Item, i)));

            return novoObj;
        }
    }

    it('Interpretação de articulação', function () {
        var texto = 'Art. 1º - Teste 1:\nI - inciso do artigo;\nII - segundo inciso:\na) alínea do inciso:\n1) item da alínea;\n2) outro item.\nb) outra alínea.\nIII - último inciso.\nParágrafo Único - Parágrafo:\nI - inciso do parágrafo.\nArt. 2º - Outro artigo.';

        expect(parser.interpretarArticulacao(texto)).toEqual({
            textoAnterior: '',
            articulacao: novo(parser.Artigo, [
                {
                    numero: '1',
                    descricao: 'Teste 1:',
                    incisos: [
                        {
                            numero: 'I',
                            descricao: 'inciso do artigo;'
                        }, {
                            numero: 'II',
                            descricao: 'segundo inciso:',
                            alineas: [
                                {
                                    numero: 'a',
                                    descricao: 'alínea do inciso:',
                                    itens: [{
                                        numero: '1',
                                        descricao: 'item da alínea;'
                                    }, {
                                        numero: '2',
                                        descricao: 'outro item.'
                                    }]
                                }, {
                                    numero: 'b',
                                    descricao: 'outra alínea.'
                                }
                            ]
                        }, {
                            numero: 'III',
                            descricao: 'último inciso.'
                        }
                    ],
                    paragrafos: [
                        {
                            numero: 'Parágrafo único',
                            descricao: 'Parágrafo:',
                            incisos: [
                                {
                                    numero: 'I',
                                    descricao: 'inciso do parágrafo.'
                                }
                            ]
                        }
                    ]
                }, {
                    numero: '2',
                    descricao: 'Outro artigo.',
                    incisos: [],
                    paragrafos: []
                }
            ])
        });
    });

    it('Interpretar corretamente artigo inciso e parágrafo', function () {
        var texto = 'Art. 103 – Teste:\n' +
            'I – teste.\n' +
            'Parágrafo único – Teste.';

        expect(parser.interpretarArticulacao(texto)).toEqual({
            textoAnterior: '',
            articulacao: novo(parser.Artigo, [
                {
                    numero: '103',
                    descricao: 'Teste:',
                    incisos: [
                        {
                            numero: 'I',
                            descricao: 'teste.'
                        }
                    ],
                    paragrafos: [
                        {
                            numero: 'Parágrafo único',
                            descricao: 'Teste.',
                            incisos: []
                        }
                    ]
                }
            ])
        });
    });

    it('Deve suportar texto antes do artigo', function () {
        var texto = 'continuação do artigo.\n' +
            'Art. 2 - Final.';

        expect(parser.interpretarArticulacao(texto)).toEqual({
            textoAnterior: 'continuação do artigo.',
            articulacao: novo(parser.Artigo, [
                {
                    numero: '2',
                    descricao: 'Final.'
                }
            ])
        });
    });

    it('Deve suportar texto antes do artigo', function () {
        var texto = 'Um texto simples.';

        expect(parser.interpretarArticulacao(texto)).toEqual({
            textoAnterior: 'Um texto simples.',
            articulacao: []
        });
    });

    it('Deve suportar texto com quebra de linha', function () {
        var texto = 'linha 1\nlinha 2';

        expect(parser.interpretarArticulacao(texto)).toEqual({
            textoAnterior: 'linha 1\nlinha 2',
            articulacao: []
        });
    });

    it('Deve suportar título, capítulo, seção e subseção', function () {
        var texto = `TÍTULO I
        DISPOSIÇÕES PRELIMINARES
        
        Art. 1º – O Estado de Minas Gerais integra, com autonomia político-administrativa, a República Federativa do Brasil.
        
        TÍTULO II
        DO ESTADO
        
        CAPÍTULO I
        DA ORGANIZAÇÃO DO ESTADO
        
        Seção I
        Disposições Gerais

        Subseção I
        Teste
        
        Art. 2º – São Poderes do Estado, independentes e harmônicos entre si, o Legislativo, o Executivo e o Judiciário.`;

        expect(parser.interpretarArticulacao(texto)).toEqual({
            textoAnterior: '',
            articulacao: [
                novo(parser.Titulo, {
                    numero: 'I',
                    descricao: 'DISPOSIÇÕES PRELIMINARES',
                    artigos: [
                        novo(parser.Artigo, {
                            numero: '1',
                            descricao: 'O Estado de Minas Gerais integra, com autonomia político-administrativa, a República Federativa do Brasil.'
                        })
                    ]
                }),
                novo(parser.Titulo, {
                    numero: 'II',
                    descricao: 'DO ESTADO',
                    capitulos: [
                        novo(parser.Capitulo, {
                            numero: 'I',
                            descricao: 'DA ORGANIZAÇÃO DO ESTADO',
                            secoes: [
                                novo(parser.Secao, {
                                    numero: 'I',
                                    descricao: 'Disposições Gerais',
                                    subsecoes: [
                                        novo(parser.Subsecao, {
                                            numero: 'I',
                                            descricao: 'Teste',
                                            artigos: [
                                                novo(parser.Artigo, {
                                                    numero: '2',
                                                    descricao: 'São Poderes do Estado, independentes e harmônicos entre si, o Legislativo, o Executivo e o Judiciário.'
                                                })
                                            ]
                                        }),
                                    ]
                                })
                            ]
                        })
                    ]
                })
            ]
        });
    });

    it('Deve suportar artigo por extenso', function () {
        var texto = 'Artigo 1º - Primeiro.\nArtigo 2º - Segundo.';

        expect(parser.interpretarArticulacao(texto)).toEqual({
            textoAnterior: '',
            articulacao: novo(parser.Artigo, [
                {
                    numero: '1',
                    descricao: 'Primeiro.',
                }, {
                    numero: '2',
                    descricao: 'Segundo.'
                }
            ])
        });
    });

    it('Deve suportar apenas o parágrafo, sem artigo.', function () {
        var texto = 'Parágrafo único. Teste.';

        expect(parser.interpretarArticulacao(texto)).toEqual({
            textoAnterior: '',
            articulacao: novo(parser.Artigo, [
                {
                    numero: '',
                    descricao: '',
                    incisos: [],
                    paragrafos: [{
                        numero: 'Parágrafo único',
                        descricao: 'Teste.',
                        incisos: []
                    }]
                }
            ])
        });
    });

    it('Não deve permitir citação em parágrafo ao exportar para editor.', function () {
        var texto = 'Art. 1º - Artigo 1.\nParágrafo único - Teste.\nContinuação.';
        var resultado = parser.interpretarArticulacao(texto);

        expect(resultado).toEqual({
            textoAnterior: '',
            articulacao: novo(parser.Artigo, [
                {
                    numero: '1',
                    descricao: 'Artigo 1.',
                    paragrafos: [{
                        numero: 'Parágrafo único',
                        descricao: 'Teste.\nContinuação.'
                    }]
                }
            ])
        });
    });

    it('Deve permitir citação em artigo  ao exportar para editor.', function () {
        var texto = 'Art. 1º - Artigo 1.\nContinuação.\nParágrafo único - Teste.';
        var resultado = parser.interpretarArticulacao(texto);

        expect(resultado).toEqual({
            textoAnterior: '',
            articulacao: novo(parser.Artigo, [{
                numero: '1',
                descricao: 'Artigo 1.\nContinuação.',
                paragrafos: [{
                    numero: 'Parágrafo único',
                    descricao: 'Teste.'
                }]
            }])
        });
    });

    it('Deve permitir inserir inciso, omitindo artigo.', function () {
        var texto = 'I - Teste.';

        expect(parser.interpretarArticulacao(texto)).toEqual({
            textoAnterior: '',
            articulacao: novo(parser.Artigo, [
                {
                    numero: '',
                    descricao: '',
                    incisos: [{
                        numero: 'I',
                        descricao: 'Teste.',
                        alineas: []
                    }]
                }])
        });
    });

    it('Deve permitir inserir alínea, omitindo artigo e inciso.', function () {
        var texto = 'a) Teste.';

        expect(parser.interpretarArticulacao(texto)).toEqual({
            textoAnterior: '',
            articulacao: novo(parser.Artigo, [
                {
                    numero: '',
                    descricao: '',
                    incisos: [{
                        numero: '',
                        descricao: '',
                        alineas: [{
                            numero: 'a',
                            descricao: 'Teste.',
                            itens: []
                        }]
                    }]
                }])
        });
    });

    it('Deve permitir inserir item, omitindo artigo, inciso e alínea.', function () {
        var texto = '1. Item.';

        expect(parser.interpretarArticulacao(texto)).toEqual({
            textoAnterior: '',
            articulacao: novo(parser.Artigo, [
                {
                    numero: '',
                    descricao: '',
                    incisos: [{
                        numero: '',
                        descricao: '',
                        alineas: [{
                            numero: '',
                            descricao: '',
                            itens: [{
                                numero: '1',
                                descricao: 'Item.'
                            }]
                        }]
                    }]
                }])
        });
    });

    it('Deve permitir inserir parágrafo com item, omitindo artigo, inciso e alínea.', function () {
        var texto = 'Parágrafo único - Os cidadãos:\n1. Devem ser legais.';

        expect(parser.interpretarArticulacao(texto)).toEqual({
            textoAnterior: '',
            articulacao: novo(parser.Artigo, [
                {
                    numero: '',
                    descricao: '',
                    incisos: [],
                    paragrafos: [{
                        numero: 'Parágrafo único',
                        descricao: 'Os cidadãos:',
                        incisos: [{
                            numero: '',
                            descricao: '',
                            alineas: [{
                                numero: '',
                                descricao: '',
                                itens: [{
                                    numero: '1',
                                    descricao: 'Devem ser legais.'
                                }]
                            }]
                        }]
                    }]
                }
            ])
        });
    });

    it('Deve escapar entidades html', function () {
        var texto = '<P>Art. 1&#176; &#8211; Fica declarado de utilidade p&#250;blica o treste &#160;asdf asd f &#160; &#160;asd, com sede no Munic&#237;pio de Abadia dos Dourados.</P><P>Art. 2&#176; &#8211; Esta lei entra em vigor na data de sua publica&#231;&#227;o.</P>';
        var objeto = parser.interpretarArticulacao(texto, FormatoOrigem.HTML);

        expect(objeto).toEqual({
            textoAnterior: '',
            articulacao: novo(parser.Artigo, [{
                numero: '1',
                descricao: 'Fica declarado de utilidade pública o treste  asdf asd f    asd, com sede no Município de Abadia dos Dourados.'
            }, {
                numero: '2',
                descricao: 'Esta lei entra em vigor na data de sua publicação.'
            }])
        });
    });

    it('Deve entender artigos emendados', function () {
        var texto = 'Art. 111-A. O Tribunal Superior do Trabalho compor-se-á de vinte e sete Ministros, escolhidos dentre brasileiros com mais de trinta e cinco anos e menos de sessenta e cinco anos, de notável saber jurídico e reputação ilibada, nomeados pelo Presidente da República após aprovação pela maioria absoluta do Senado Federal, sendo:  (Redação dada pela Emenda Constitucional nº 92, de 2016)' +
            '\nI um quinto dentre advogados com mais de dez anos de efetiva atividade profissional e membros do Ministério Público do Trabalho com mais de dez anos de efetivo exercício, observado o disposto no art. 94;  (Incluído pela Emenda Constitucional nº 45, de 2004)';
        var objeto = parser.interpretarArticulacao(texto);

        expect(objeto).toEqual({
            textoAnterior: '',
            articulacao: novo(parser.Artigo, [
                {
                    numero: '111-A',
                    descricao: 'O Tribunal Superior do Trabalho compor-se-á de vinte e sete Ministros, escolhidos dentre brasileiros com mais de trinta e cinco anos e menos de sessenta e cinco anos, de notável saber jurídico e reputação ilibada, nomeados pelo Presidente da República após aprovação pela maioria absoluta do Senado Federal, sendo:  (Redação dada pela Emenda Constitucional nº 92, de 2016)',
                    incisos: [{
                        numero: 'I',
                        descricao: 'um quinto dentre advogados com mais de dez anos de efetiva atividade profissional e membros do Ministério Público do Trabalho com mais de dez anos de efetivo exercício, observado o disposto no art. 94;  (Incluído pela Emenda Constitucional nº 45, de 2004)'
                    }]
                }
            ])
        });
    });

    it('Deve suportar preâmbulo', function () {
        var html = '<p align="CENTER"><strong><font face="Arial" color="#800000" size="2">PREÂMBULO</font></strong></p>' +
            '<p align="JUSTIFY" style="text-align: justify"><small><font face="Arial" color="#000000">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; </font></small><font face="Arial" size="2">Nós, representantes do povo brasileiro, reunidos em Assembléia Nacional Constituinte para instituir um Estado Democrático, destinado a assegurar o exercício dos direitos sociais e individuais, a liberdade, a segurança, o bem-estar, o desenvolvimento, a igualdade e a justiça como valores supremos de uma sociedade fraterna, pluralista e sem preconceitos, fundada na harmonia social e comprometida, na ordem interna e internacional, com a solução pacífica das controvérsias, promulgamos, sob a proteção de Deus, a seguinte CONSTITUIÇÃO DA REPÚBLICA FEDERATIVA DO BRASIL.</font></p>' +
            '<p align="center" style="margin-top: 0; margin-bottom: 0"><font face="Arial" size="2"><a name="tituloi"></a><span style="text-transform: uppercase"><b>TÍTULO I</b></span></font></p>' +
            '<p align="center" style="margin-top: 0; margin-bottom: 0"><font face="Arial" size="2"><span style="text-transform: uppercase"><b>Dos Princípios Fundamentais </b></span> </font></p>' +
            '<div id="art"><p><a name="art1"></a><a name="1"></a>Art. 1º A República Federativa do Brasil, formada pela união indissolúvel dos Estados e Municípios e do Distrito Federal, constitui-se em Estado Democrático de Direito e tem como fundamentos:</p></div>';
        var objeto = parser.interpretarArticulacao(html, FormatoOrigem.HTML);

        const preAmbulo = new parser.Preambulo('Nós, representantes do povo brasileiro, reunidos em Assembléia Nacional Constituinte para instituir um Estado Democrático, destinado a assegurar o exercício dos direitos sociais e individuais, a liberdade, a segurança, o bem-estar, o desenvolvimento, a igualdade e a justiça como valores supremos de uma sociedade fraterna, pluralista e sem preconceitos, fundada na harmonia social e comprometida, na ordem interna e internacional, com a solução pacífica das controvérsias, promulgamos, sob a proteção de Deus, a seguinte CONSTITUIÇÃO DA REPÚBLICA FEDERATIVA DO BRASIL.');
        const titulo = new parser.Titulo('I', 'Dos Princípios Fundamentais');
        const artigo = new parser.Artigo('1', 'A República Federativa do Brasil, formada pela união indissolúvel dos Estados e Municípios e do Distrito Federal, constitui-se em Estado Democrático de Direito e tem como fundamentos:');

        preAmbulo.adicionar(titulo);
        titulo.adicionar(artigo);

        expect(objeto).toEqual({
            textoAnterior: '',
            articulacao: [ preAmbulo ]
        });
    });

    it('Não deve confundir alínea com inciso', function () {
        const texto = 'Art. 1º - Teste:\nI - teste:\na) teste;\nb) teste;\nc) teste;\n d) teste.';

        var objeto = parser.interpretarArticulacao(texto);

        expect(objeto).toEqual({
            textoAnterior: '',
            articulacao: novo(parser.Artigo, [
                {
                    numero: '1',
                    descricao: 'Teste:',
                    incisos: [{
                        numero: 'I',
                        descricao: 'teste:',
                        alineas: [{
                            numero: 'a',
                            descricao: 'teste;'
                        }, {
                            numero: 'b',
                            descricao: 'teste;'
                        }, {
                            numero: 'c',
                            descricao: 'teste;'
                        }, {
                            numero: 'd',
                            descricao: 'teste.'
                        }]
                    }]
                }
            ])
        });
    });
    
    it('Deve interpretar corretamente as quebras de linha', () => {
        const texto = `Art. 3º – No início da legislatura, são realizadas, no Palácio da Inconfidência, a partir do dia 1º de fevereiro, reuniões preparatórias destinadas à posse dos Deputados diplomados, à instalação da legislatura e da 1ª sessão legislativa ordinária e à
eleição e à posse dos membros da Mesa da Assembleia para o 1º biênio.
(Artigo com redação dada pelo art. 1º da Resolução da ALMG nº 5.511, de 1º/12/2015.)
(Vide Emenda à Constituição nº 74, de 11/5/2006.)`;
        const objeto = parser.interpretarArticulacao(texto);

        expect(objeto.articulacao[0].descricao).toBe(`No início da legislatura, são realizadas, no Palácio da Inconfidência, a partir do dia 1º de fevereiro, reuniões preparatórias destinadas à posse dos Deputados diplomados, à instalação da legislatura e da 1ª sessão legislativa ordinária e à eleição e à posse dos membros da Mesa da Assembleia para o 1º biênio.
(Artigo com redação dada pelo art. 1º da Resolução da ALMG nº 5.511, de 1º/12/2015.)
(Vide Emenda à Constituição nº 74, de 11/5/2006.)`);
    })
});
