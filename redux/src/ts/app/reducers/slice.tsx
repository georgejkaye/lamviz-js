import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import CytoscapeComponent from "react-cytoscapejs"

import { Term, Context } from "./../../../bs/Lambda.bs"
import { GraphNode, GraphEdge, generateGraphElementsArray } from "./../../../bs/Graph.bs"

export enum Mode {
    VISUALISER, GALLERY
}

let barWidth: number = 750
let barHeight: number = 150

export const sidebarWidth = 400;
export const topHeight = 80
export const subtopHeight = 45
export const toggleHeight = 25
export const factsWidth = 330
export const toggleWidth = 20

interface Dimensions {
    width: number
    height: number
}

interface State {
    mode: Mode,
    currentTermText: string,
    currentContextText: string,
    currentTerm: Term,
    originalTerm: Term,
    currentContext: Context,
    screenDimensions: Dimensions,
    graphDimensions: Dimensions,
    factsOpen: boolean,
    error: string
}

const getGraphWidth = (dimensions: Dimensions, facts: boolean) => dimensions.width - (toggleWidth + sidebarWidth) - (facts ? factsWidth : 0)
const getGraphHeight = (dimensions: Dimensions) => dimensions.height - (topHeight + subtopHeight + toggleHeight)
const getGraphDimensions = (dimensions: Dimensions, facts: boolean) => ({ width: getGraphWidth(dimensions, facts), height: getGraphHeight(dimensions) })

const factsOpenCheck = () => window.innerWidth > 1500

const initialState: State = {
    mode: Mode.VISUALISER,
    currentTermText: "",
    currentContextText: "",
    currentTerm: undefined,
    originalTerm: undefined,
    currentContext: undefined,
    screenDimensions: { width: window.innerWidth, height: window.innerHeight },
    graphDimensions: getGraphDimensions({ width: window.innerWidth, height: window.innerHeight }, factsOpenCheck()),
    factsOpen: factsOpenCheck(),
    error: ""
}

export const slice = createSlice({
    name: "slice",
    initialState,
    reducers: {
        changeMode: (state, action: PayloadAction<Mode>) =>
            state = { ...state, mode: action.payload },
        resize: (state, action: PayloadAction<Dimensions>) =>
            state = { ...state, screenDimensions: action.payload, factsOpen: factsOpenCheck(), graphDimensions: getGraphDimensions(action.payload, factsOpenCheck()) },
        newTerm: (state, action: PayloadAction<[string, string, Term, Context]>) =>
            state = { ...state, currentTermText: action.payload[0], currentContextText: action.payload[1], currentTerm: action.payload[2], originalTerm: action.payload[2], currentContext: action.payload[3], error: "" },
        newError: (state, action: PayloadAction<string>) =>
            state = { ...state, error: action.payload },
        updateTerm: (state, action: PayloadAction<Term>) =>
            state = { ...state, currentTerm: action.payload },
        toggleFactsBar: (state, action: PayloadAction<boolean>) =>
            state = { ...state, factsOpen: action.payload, graphDimensions: getGraphDimensions(state.screenDimensions, action.payload) },
        resetTerm: (state) =>
            state = { ...state, currentTerm: state.originalTerm },
        clear: (state) =>
            state = { ...state, currentTermText: "", currentContextText: "", currentTerm: undefined, error: "" }
    },
})

export const { changeMode, resize, newTerm, newError, updateTerm, resetTerm, toggleFactsBar, clear } = slice.actions

export default slice.reducer