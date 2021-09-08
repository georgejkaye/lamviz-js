import { Term, Context } from "./Lambda.bs"
import { Macro } from "./../components/Macro"

declare module "Parser.bs"
export function parseContext(context: string): Context
export function parseTerm(term: string, context: Context, macros: Macro[], name: string): Term
