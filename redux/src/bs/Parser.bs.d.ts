import { Term } from "./Lambda.bs"

declare module "Parser.bs"
export function lex_and_parse(term: string, context: string): Term
