import { readFileSync } from 'fs';
import interpretarArticulacao, { FormatoOrigem } from '../../src/interpretarArticulacao';
import { validarArticulacao } from '../../src/validadorArticulacao';
import { contarDispositivos } from '../testUtil';
import { TipoDispositivo } from '../../src/dispositivos/Dispositivo';
import { Titulo } from '../../src';

describe('Regimento Interno da ALMG', () => {
    const constituicao = readFileSync('test/regimentoInternoALMG/regimento-almg.txt').toString();
    const interpretacao = interpretarArticulacao(constituicao, FormatoOrigem.TEXTO);

    it('Deve estar válida a interpretação do regimento interno da ALMG', () => {
        const validacao = validarArticulacao(interpretacao.articulacao);

        expect(validacao).toEqual([]);
    });

    it('Não deve ficar nenhum texto de fora.',  () => {
        expect(interpretacao.textoAnterior).toBe('');
    });

    it('Deve possuir 14 títulos', () => {
        expect(interpretacao.articulacao.length).toBe(14);
        expect(interpretacao.articulacao[13].numero).toBe('XIV');
        expect(interpretacao.articulacao[13].descricao).toEqual('DISPOSIÇÕES FINAIS E TRANSITÓRIAS');
    });

    it('Deve possuir 332 artigos', () => {
        expect(contarDispositivos(interpretacao, TipoDispositivo.ARTIGO)).toBe(319 + 9 /* emendas -A */ + 3 /* -B */ + 1 /* -C */);
    });

    it('O último artigo deve possuir o número 319', () => {
        expect((interpretacao.articulacao[13] as Titulo).artigos[6].numero).toBe('319');
    });
});