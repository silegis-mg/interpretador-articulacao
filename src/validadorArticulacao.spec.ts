import { validarArticulacao, Validacao } from "./validadorArticulacao";
import Artigo from "./dispositivos/Artigo";
import { Paragrafo } from ".";

describe('Validação', () => {
    it('Deve considerar válida uma articulação perfeita.', () => {
        const articulacao = [
            new Artigo('1', 'Primeiro.'),
            new Artigo('2', 'Segundo.'),
            new Artigo('3', 'Terceiro.'),
        ];
        const invalidos = validarArticulacao(articulacao);
        
        expect(invalidos).toEqual([]);
    });

    it('Deve ser capaz de identificar a numeração não sequencial.', () => {
        const articulacao = [
            new Artigo('1', 'Primeiro.'),
            new Artigo('2', 'Segundo.'),
            new Artigo('4', 'Terceiro.'),
        ];
        const invalidos = validarArticulacao(articulacao);
        
        expect(invalidos).toEqual([
            new Validacao(articulacao[2], true, false, true)
        ]);
    });

    it('Deve suportar parágrafo único', () => {
        const artigo = new Artigo('1', 'Primeiro.');
        const paragrafo = new Paragrafo('Parágrafo único', 'Teste do parágrafo único.');
        
        artigo.adicionar(paragrafo);
        
        const invalidos = validarArticulacao([artigo]);
        expect(invalidos).toEqual([]);
    })
})