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
    subterms: () => number,
    crossings: () => number,
    abstractions: () => number,
    applications: () => number,
    variables: () => number,
    freeVariables: () => number,
    freeVariableIndices: () => number[],
    isBetaRedex: () => boolean,
    hasBetaRedex: () => boolean,
    betaRedexes: () => number,
    isClosed: (ctx: Context) => boolean,
    uniqueVariables: () => [number, number[]]
    uniqueVariablesSubterm: (seen: number[]) => [number, number[]]
    numberOfUses: (index: number) => number,
    prettyPrint: (level: number) => string,
    prettyPrintLabels: (ctx: Context, level: number) => string,
    printRedexes: (ctx: Context) => string[]
    printHtml: (deBruijn: boolean, ctx: Context) => [string, number, number, number, number]
    printHtmlSubterm: (deBruijn: boolean, ctx: Context, level: number, vars: number, abs: number, apps: number, betas: number) => [string, number, number, number, number]
    generatePrettyVariableNames: (ctx: Context, subcall: boolean) => void

}

class LambdaVariable implements Term {

    type = Type.VAR

    alias: string
    id: number
    index: number

    constructor(index: number, alias: string, id: number) {
        this.alias = alias
        this.id = id
        this.index = index
    }

    subterms = () => 1
    crossings = () => 0
    abstractions = () => 0
    applications = () => 0
    variables = () => 1
    freeVariables = () => 1
    freeVariableIndices = () => []
    isBetaRedex = () => false
    hasBetaRedex = () => false
    betaRedexes = () => 0

    isClosed(ctx: Context) {
        return ctx.length > this.index
    }

    uniqueVariables(): [number, number[]] {
        return this.uniqueVariablesSubterm([])
    }

    uniqueVariablesSubterm(seen: number[]): [number, number[]] {
        return seen.includes(this.index) ? [0, seen] : [1, seen.concat(this.index)]
    }

    numberOfUses(index: number) {
        return (index === this.index ? 1 : 0)
    }

    prettyPrint(level: number) {
        return String(this.index)
    }

    prettyPrintLabels(ctx: Context, level: number) {
        return this.alias !== "" ? this.alias : ctx.getCorrespondingVariable(this.index, true)
    }

    printRedexes(ctx: Context) {
        return []
    }

    printHtml(deBruijn: boolean, ctx: Context): [string, number, number, number, number] {
        return this.printHtmlSubterm(deBruijn, ctx, 0, 0, 0, 0, 0)
    }

    printHtmlSubterm(deBruijn: boolean, ctx: Context, level: number, vars: number, abs: number, apps: number, betas: number): [string, number, number, number, number] {

        var string = '<span class = "var-' + String(vars) + '">'

        if (deBruijn) {
            string += String(this.index)
        } else {
            var label = this.alias !== "" ? label = this.alias : ctx.getCorrespondingVariable(this.index, true)
            string += label
        }

        string += '</span>'
        vars++

        return [string, vars, abs, apps, betas]

    }

    generatePrettyVariableNames(ctx: Context, subcall: boolean) {
        return
    }
}

class LambdaAbstraction implements Term {

    alias: string
    t: Term
    label: string

    constructor(t: Term, label: string, alias: string) {
        this.alias = alias
        this.t = t
        this.label = label
    }

    subterms = () => this.t.subterms()
    crossings = () => this.t.crossings()
    abstractions = () => this.t.abstractions()
    applications = () => 1 + this.t.applications()
    variables = () => this.t.variables()
    freeVariables = () => this.t.freeVariables() === 0 ? 0 : this.t.freeVariables() - this.t.numberOfUses(0)
    freeVariableIndices = () => this.t.freeVariableIndices().filter(x => x !== 0).map(x => x - 1)
    isBetaRedex = () => false
    hasBetaRedex = () => this.t.hasBetaRedex()
    betaRedexes = () => this.t.betaRedexes()
    isClosed = (ctx: Context) => this.t.isClosed(ctx) || this.t.freeVariableIndices().filter((x) => x !== 0) === []

}