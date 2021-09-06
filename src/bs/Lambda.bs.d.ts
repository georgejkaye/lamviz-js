
declare module "Lambda.bs"
export function prettyPrintContext(ctx: Context): string
export function prettyPrint(t: Term, ctx: Context, mac: boolean, topmac: boolean): string
export function prettyPrintDeBruijn(t: Term): string
export function subterms(t: Term): number
export function freeVariables(t: Term): number
export function crossings(t: Term): number
export function closed(t: Term): boolean
export function bridgeless(t: Term): boolean
export function bridges(t: Term): number
export function variables(t: Term): number
export function uniqueVariables(t: Term): number
export function abstractions(t: Term): number
export function applications(t: Term): number
export function betaRedexes(t: Term): number
export function linear(t: Term): boolean
export function planar(t: Term): boolean
export function printRedexesArray(t: Term, ctx: Context): string[]
export function printHTML(t: Term, ctx: Context, db: boolean, mac: boolean): string
export function printTermAndContext(t: Term, ctx: Context, mac: boolean): string
export function printHTMLAndContext(t: Term, ctx: Context, db: boolean, mac: boolean): string
export function refreshVariableNames(t: Term, ctx: Context): [Term, any]

export const example: Term
export const emptyContext: Context

export type Context = {
    hd: string,
    tl: Context
}

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

export type Term = Var | Abs | App | undefined
