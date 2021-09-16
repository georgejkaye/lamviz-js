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

declare module "Graph.bs"
export function generateGraphElementsArray(t: Term, ctx: Context): [cytoscape.ElementDefinition[], cytoscape.ElementDefinition[], [string, string, string], Midpoint[]]
export const nodeDistanceX: number
export const nodeDistanceY: number