/**
 * Transforma as quebras de linha em elementos P.
 * 
 * @param {String} texto 
 * @returns {String}
 */
export function transformarQuebrasDeLinhaEmP(texto) {
    var fragmento = document.createDocumentFragment();

    if (texto.indexOf('\n') === -1) {
        let p = document.createElement('p');
        p.textContent = texto;
        fragmento.appendChild(p);
    } else {
        let partes = texto.split(/\n+/g);

        partes.forEach(parte => {
            let p = document.createElement('p');
            p.textContent = parte;
            fragmento.appendChild(p);
        });
    }
    
    return fragmento;
}
