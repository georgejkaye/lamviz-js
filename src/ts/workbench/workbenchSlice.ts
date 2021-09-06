import { createSlice, PayloadAction } from "@reduxjs/toolkit"

import { Term, Context, emptyContext } from "./../../bs/Lambda.bs"

export enum Mode {
    VISUALISER, GALLERY
}

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
    redraw: boolean, /* redraw NOW */
    currentTerm: Term,
    originalTerm: Term,
    termHistory: Term[],
    currentContext: Context,
    screenDimensions: Dimensions,
    graphDimensions: Dimensions,
    factsOpen: boolean,
    error: string,
    svgTime: boolean,
    nodeLabels: boolean,
    edgeLabels: boolean,
    redexToHighlight: number
    reductionToPerform: number
}

const getGraphWidth = (dimensions: Dimensions, facts: boolean) => dimensions.width - (toggleWidth + sidebarWidth) - (facts ? factsWidth : 0)
const getGraphHeight = (dimensions: Dimensions) => dimensions.height - (topHeight + subtopHeight + toggleHeight)
const getGraphDimensions = (dimensions: Dimensions, facts: boolean) => ({ width: getGraphWidth(dimensions, facts), height: getGraphHeight(dimensions) })

const factsOpenCheck = () => window.innerWidth > 1500

const initialState: State = {
    mode: Mode.VISUALISER,
    currentTermText: "",
    currentContextText: "",
    redraw: false,
    currentTerm: undefined,
    originalTerm: undefined,
    termHistory: [],
    currentContext: emptyContext,
    screenDimensions: { width: window.innerWidth, height: window.innerHeight },
    graphDimensions: getGraphDimensions({ width: window.innerWidth, height: window.innerHeight }, factsOpenCheck()),
    factsOpen: factsOpenCheck(),
    error: "",
    svgTime: false,
    nodeLabels: false,
    edgeLabels: false,
    redexToHighlight: -1,
    reductionToPerform: -1
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
            state = { ...state, screenDimensions: action.payload, factsOpen: factsOpenCheck(), graphDimensions: getGraphDimensions(action.payload, factsOpenCheck()) },
        newTerm: (state, action: PayloadAction<[string, string, Term, Context]>) =>
            state = { ...state, currentTermText: action.payload[0], currentContextText: action.payload[1], currentTerm: action.payload[2], originalTerm: action.payload[2], currentContext: action.payload[3], termHistory: smartConcatHead(state.currentTerm, state.termHistory), error: "" },
        newError: (state, action: PayloadAction<string>) =>
            state = { ...state, error: action.payload },
        updateTerm: (state, action: PayloadAction<Term>) =>
            state = { ...state, termHistory: smartConcatHead(state.currentTerm, state.termHistory), currentTerm: action.payload },
        toggleFactsBar: (state, action: PayloadAction<boolean>) =>
            state = { ...state, factsOpen: action.payload, graphDimensions: getGraphDimensions(state.screenDimensions, action.payload) },
        backTerm: (state) =>
            state.termHistory.length > 0 ? state = { ...state, currentTerm: state.termHistory[0], termHistory: state.termHistory.slice(1) } : state,
        resetTerm: (state) =>
            state = { ...state, currentTerm: state.originalTerm, termHistory: smartConcatHead(state.currentTerm, state.termHistory), redraw: true },
        finishedDrawing: (state) =>
            state = { ...state, redraw: false },
        clear: (state) =>
            state = { ...state, currentTermText: "", currentContextText: "", currentTerm: undefined, error: "" },
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
            state = { ...state, reductionToPerform: -1 }
    },
})

export const {
    changeMode, resize, newTerm, newError, updateTerm, resetTerm, finishedDrawing, backTerm, toggleFactsBar, clear,
    downloadSvg, downloadedSvg, toggleNodeLabels, toggleEdgeLabels, highlightRedex, unhighlightRedex, performReduction } = slice.actions

export default slice.reducer