export enum Mode {
    VISUALISER, GALLERY
}

export enum Type {
    VAR, ABS, APP
}

export interface Context {
    ctx: [string, string][],
    length: number,
    get: (i: number) => string,
    push: (variable: string, label: string) => void,
    pop: () => void,
    find: (variable: string) => number,
    getCorrespondingVariable: (index: number, label: boolean) => string,
    prettyPrint: () => string,
    generatePrettyVariableNames: () => void
}

export interface Term {
    type: Type,
    alias: string,
    id: number,
    subterms: number,
    crossings: number,
    abstractions: number,
    applications: number,
    variables: number,
    uniqueVariables: number,
    freeVariables: number,
    freeVariableIndices: number[],
    isBetaRedex: boolean,
    hasBetaRedex: boolean,
    betaRedexes: number,
    isClosed: (ctx: Context) => boolean,
    numberOfUses: (index: number) => number,
    prettyPrint: (level: number) => string,
    prettyPrintLabels: (ctx: Context, layer: number) => string,
    printRedexes: (ctx: Context) => string[]
    printHtml: (deBruijn: boolean, ctx: Context, x: number, vars: number, abs: number, apps: number, betas: number) => string
    generatePrettyVariableNames: (ctx: Context, x: boolean) => void

}