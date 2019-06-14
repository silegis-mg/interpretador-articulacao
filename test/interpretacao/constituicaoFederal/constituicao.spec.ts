import { readFileSync, writeFileSync } from 'fs';
import { validarArticulacao } from '../../../src/validadorArticulacao';
import { interpretarArticulacao, FormatoOrigem, Artigo } from '../../../src';
import { contarDispositivos, tornarPlano } from '../../testUtil';
import Dispositivo, { TipoDispositivo, TipoAgrupador } from '../../../src/dispositivos/Dispositivo';

describe('Constituição Federal', () => {
    const constituicao = readFileSync('test/interpretacao/constituicaoFederal/constituicao.html').toString();
    const interpretacao = interpretarArticulacao(constituicao, FormatoOrigem.HTML);

    it('Deve ser capaz de interpretar a constituição federal, com 250 artigos, extraída em 13/06/2019', () => {
        expect(contarDispositivos(interpretacao, TipoDispositivo.ARTIGO)).toEqual(250 + 9 /* confirmar que há 9 emendas */);
    });

    it('Deve entender o preâmbulo', () => {
        expect(interpretacao.textoAnterior).toBe('');
        expect(interpretacao.articulacao[0].tipo).toBe(TipoAgrupador.PREAMBULO);
        expect(interpretacao.articulacao[0].descricao).toBe('Nós, representantes do povo brasileiro, reunidos em Assembléia Nacional Constituinte para instituir um Estado Democrático, destinado a assegurar o exercício dos direitos sociais e individuais, a liberdade, a segurança, o bem-estar, o desenvolvimento, a igualdade e a justiça como valores supremos de uma sociedade fraterna, pluralista e sem preconceitos, fundada na harmonia social e comprometida, na ordem interna e internacional, com a solução pacífica das controvérsias, promulgamos, sob a proteção de Deus, a seguinte CONSTITUIÇÃO DA REPÚBLICA FEDERATIVA DO BRASIL.');
    });

    it('Não deve confundir informação de revogação', () => {
        const art102 = tornarPlano(interpretacao.articulacao).find(d => d instanceof Artigo && d.numero === '102') as Artigo;

        expect(art102.incisos[0].alineas[6].descricao).toBe('a extradição solicitada por Estado estrangeiro;')
    })
});