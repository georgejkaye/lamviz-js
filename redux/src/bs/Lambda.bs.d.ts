
declare module "Lambda.bs"
export function prettyPrint(t: Term, ctx: any): string
export function prettyPrintDeBruijn(t: Term): string
export function subterms(t: Term): number
export function freeVariables(t: Term): number
export function crossings(t: Term): number
export function variables(t: Term): number
export function uniqueVariables(t: Term): number
export function abstractions(t: Term): number
export function applications(t: Term): number
export function betaRedexes(t: Term): number
export function printRedexesArray(t: Term, ctx: any): string[]
export function printHTML(t: Term, db: boolean, ctx: any): string
export function refreshVariableNames(t: Term, ctx: any): [Term, any]

export type Var = {
    TAG: number,
    _0: number,
    _1: string
}

export type Abs = {
    TAG: number,
    _0: Term,
    _1: string,
    _2: string
}

export type App = {
    TAG: number,
    _0: Term,
    _1: Term,
    _2: string
}

export type Term = Var | Abs | App
