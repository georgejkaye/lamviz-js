import { Term } from "./Lambda.bs"

type Context = {
    hd: string,
    tl: Context
}

declare module "Parser.bs"
export function lex_and_parse(term: string, context: string): [Term, Context]
