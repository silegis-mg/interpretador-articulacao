import ParserLinha from "./ParserLinha";
import Contexto from "./Contexto";
import Dispositivo from "../../dispositivos/Dispositivo";
import {Livro} from "../../dispositivos/agrupadores";

export default class ParserLivro extends ParserLinha {
    constructor() {
        super(/^\s*LIVRO\s*([IXVDLM]+(?:-[a-z])?)(?:\s*[-–]\s*(.+))?/i);
    }

    onMatch(contexto: Contexto, m: RegExpExecArray): Dispositivo<any> | null {
        const item = new Livro(m[1], m[2] || '');
        contexto.adicionar([], item);
        return item;
    }
}
