import { Term, Context } from "./Lambda.bs"
import { Macro } from "./../components/Macro"

declare module "Parser.bs"
export function lexAndParse(term: string, context: string, macros: Macro[], name: string): [Term, Context]
