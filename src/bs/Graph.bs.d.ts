import { CollectionReturnValue } from "cytoscape"
import { Context, Term } from "./Lambda.bs"

export interface Position {
    x: number,
    y: number
}

export interface NodeData {
    id: string,
    label: string
    pos: Position
}
export interface GraphNode {
    data: NodeData
    classes: string[]
}

export interface EdgeData {
    id: string
    label: string
    source: string
    target: string
}

export interface GraphEdge {
    data: EdgeData
    classes: string[]
}

export interface Midpoint {
    source: string
    midpoint: string
    target: string
}

export interface Redex {
    rootParent: string
    rootEdge: string
    root: string
    app: string
    arg: string
    argEdge: string
    argChild: string
    stem: string
    abs: string
    out: string
    outChild: string
    bound: string
    boundChild: string
}

export interface RedexNodes {
    rootParent: CollectionReturnValue
    rootEdge: CollectionReturnValue
    root: CollectionReturnValue
    app: CollectionReturnValue
    arg: CollectionReturnValue
    argEdge: CollectionReturnValue
    argChild: CollectionReturnValue
    stem: CollectionReturnValue
    abs: CollectionReturnValue
    out: CollectionReturnValue
    outChild: CollectionReturnValue
    bound: CollectionReturnValue
    boundChild: CollectionReturnValue
}

declare module "Graph.bs"
export function generateGraphElementsArray(t: Term, ctx: Context): [cytoscape.ElementDefinition[], cytoscape.ElementDefinition[], [string, string, string], Midpoint[], Redex[]]
export const nodeDistanceX: number
export const nodeDistanceY: number