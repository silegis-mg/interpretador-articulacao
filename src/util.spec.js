import { transformarQuebrasDeLinhaEmP } from "./util";

describe('transfomarQuebrasDeLinhaEmP', function () {
    it('Deve envolver única linha', function () {
        var fragmento = transformarQuebrasDeLinhaEmP('linha única');

        expect(fragmento.childNodes.length).toBe(1);
        expect(fragmento.firstChild.outerHTML).toBe('<p>linha única</p>');
    });

    it('Deve separar duas linhas', function () {
        var fragmento = transformarQuebrasDeLinhaEmP('linha 1\nlinha 2');

        expect(fragmento.childNodes.length).toBe(2);
        expect(fragmento.firstChild.outerHTML).toBe('<p>linha 1</p>');
        expect(fragmento.lastChild.outerHTML).toBe('<p>linha 2</p>');
    });

    it('Deve separar três linhas', function () {
        var fragmento = transformarQuebrasDeLinhaEmP('linha 1\nlinha 2\nlinha 3');

        expect(fragmento.childNodes.length).toBe(3);
        expect(fragmento.firstChild.outerHTML).toBe('<p>linha 1</p>');
        expect(fragmento.childNodes[1].outerHTML).toBe('<p>linha 2</p>');
        expect(fragmento.lastChild.outerHTML).toBe('<p>linha 3</p>');
    });

    it('Deve ignorar linhas vazias', function () {
        var fragmento = transformarQuebrasDeLinhaEmP('linha 1\n\nlinha 2\n\n\nlinha 3');

        expect(fragmento.childNodes.length).toBe(3);
        expect(fragmento.firstChild.outerHTML).toBe('<p>linha 1</p>');
        expect(fragmento.childNodes[1].outerHTML).toBe('<p>linha 2</p>');
        expect(fragmento.lastChild.outerHTML).toBe('<p>linha 3</p>');
    });
});
