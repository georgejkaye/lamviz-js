
declare module "Lambda.bs"
export function newVar(i: number, alias: string): Term
export function newAbs(t: Term, x: string, alias: string): Term
export function newApp(t1: Term, t2: Term, alias: string): Term
export function prettyPrint(t: any): string

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
