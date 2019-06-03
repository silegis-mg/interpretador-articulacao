import { QualquerDispositivo, ArticulacaoInterpretada } from "../src/interpretarArticulacao";
import { TipoDispositivoOuAgrupador } from "../src/dispositivos/Dispositivo";

export function tornarPlano(dispositivos: QualquerDispositivo[]): QualquerDispositivo[] {
    return dispositivos.reduce((plano, dispositivo) => plano.concat(tornarPlano(dispositivo.subitens)), dispositivos);
}

export function contarDispositivos(interpretacao: ArticulacaoInterpretada, tipo: TipoDispositivoOuAgrupador) {
    const dispositivos = tornarPlano(interpretacao.articulacao);
    return dispositivos.filter(d => d.tipo === tipo).length;
}