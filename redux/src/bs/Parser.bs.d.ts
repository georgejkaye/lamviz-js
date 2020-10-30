import { Term, Context } from "./Lambda.bs"

declare module "Parser.bs"
export function lexAndParse(term: string, context: string): [Term, Context]
