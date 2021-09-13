import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { parseContext, parseTerm } from "../../bs/Parser.bs"

import { Term, Context, emptyContext, example } from "./../../bs/Lambda.bs"
import { MacroDetails } from "./Macro"

export enum Mode {
    VISUALISER, GALLERY
}

export const sidebarWidth = 75
export const topBarHeight = 80
export const subBarHeight = 45
export const toggleHeight = 25
export const factsWidth = 0
export const toggleWidth = 20

interface Dimensions {
    width: number
    height: number
}

interface State {
    mode: Mode,
    redraw: boolean, /* redraw NOW */
    currentTerm: Term,
    originalTerm: Term,
    termHistory: Term[],
    currentContext: Context,
    screenDimensions: Dimensions,
    graphDimensions: Dimensions,
    error: string,
    svgTime: boolean,
    nodeLabels: boolean,
    edgeLabels: boolean,
    redexToHighlight: number
    reductionToPerform: number
    macros: MacroDetails[],
    activeBox: number,
}

const getWindowDimensions = () => ({ width: window.innerWidth, height: window.innerHeight })
const getGraphWidth = (dimensions: Dimensions) => dimensions.width - sidebarWidth
const getGraphHeight = (dimensions: Dimensions) => dimensions.height
const getGraphDimensions = () => {
    let dimensions = getWindowDimensions()
    return { width: getGraphWidth(dimensions), height: getGraphHeight(dimensions) }
}

const initialState: State = {
    mode: Mode.VISUALISER,
    redraw: false,
    currentTerm: example,
    originalTerm: undefined,
    termHistory: [],
    currentContext: emptyContext,
    screenDimensions: getWindowDimensions(),
    graphDimensions: getGraphDimensions(),
    error: "",
    svgTime: false,
    nodeLabels: false,
    edgeLabels: false,
    redexToHighlight: -1,
    reductionToPerform: -1,
    macros: [],
    activeBox: -1
}

function smartConcatHead<T>(a: T, array: T[]) {
    if (!a) {
        return array
    }
    return [a].concat(array)
}

export const slice = createSlice({
    name: "slice",
    initialState,
    reducers: {
        changeMode: (state, action: PayloadAction<Mode>) =>
            state = { ...state, mode: action.payload },
        resize: (state, action: PayloadAction<Dimensions>) =>
            state = { ...state, screenDimensions: action.payload, graphDimensions: getGraphDimensions() },
        newTerm: (state, action: PayloadAction<string>) =>
            state = { ...state, currentTerm: parseTerm(action.payload, state.currentContext, state.macros, ""), termHistory: smartConcatHead(state.currentTerm, state.termHistory), error: "" },
        newContext: (state, action: PayloadAction<string>) =>
            state = { ...state, currentContext: parseContext(action.payload) },
        newError: (state, action: PayloadAction<string>) =>
            state = { ...state, error: action.payload },
        updateTerm: (state, action: PayloadAction<Term>) =>
            state = { ...state, originalTerm: state.currentTerm, termHistory: smartConcatHead(state.currentTerm, state.termHistory), currentTerm: action.payload },
        toggleFactsBar: (state, action: PayloadAction<boolean>) =>
            state = { ...state, graphDimensions: getGraphDimensions() },
        backTerm: (state) =>
            state.termHistory.length > 0 ? state = { ...state, currentTerm: state.termHistory[0], termHistory: state.termHistory.slice(1) } : state,
        resetTerm: (state) =>
            state = { ...state, currentTerm: state.originalTerm, termHistory: smartConcatHead(state.currentTerm, state.termHistory), redraw: true },
        finishedDrawing: (state) =>
            state = { ...state, redraw: false },
        clear: (state) =>
            state = { ...state, currentTerm: undefined, error: "" },
        downloadSvg: (state) =>
            state = { ...state, svgTime: true },
        downloadedSvg: (state) =>
            state = { ...state, svgTime: false },
        toggleNodeLabels: (state) =>
            state = { ...state, nodeLabels: !state.nodeLabels },
        toggleEdgeLabels: (state) =>
            state = { ...state, edgeLabels: !state.edgeLabels },
        highlightRedex: (state, action: PayloadAction<number>) =>
            state = { ...state, redexToHighlight: action.payload },
        unhighlightRedex: (state) =>
            state = { ...state, redexToHighlight: -1 },
        performReduction: (state, action: PayloadAction<number>) =>
            state = { ...state, reductionToPerform: action.payload },
        reductionPerformed: (state) =>
            state = { ...state, reductionToPerform: -1 },
        setActiveBox: (state, action: PayloadAction<number>) =>
            state = { ...state, activeBox: action.payload }
    },
})

export const {
    changeMode, resize, newTerm, newContext, newError, updateTerm, resetTerm, finishedDrawing, backTerm, toggleFactsBar, clear,
    downloadSvg, downloadedSvg, toggleNodeLabels, toggleEdgeLabels, highlightRedex, unhighlightRedex, performReduction, setActiveBox } = slice.actions

export default slice.reducer