import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { parseContext, parseTerm } from "../../bs/Parser.bs"

import { Term, Context, emptyContext } from "./../../bs/Lambda.bs"
import { MacroDetails } from "./Macro"

export enum Mode {
    VISUALISER, GALLERY
}

export const sidebarWidth = 75
export const settingsWidth = 250
export const topBarHeight = 300
export const bottomBarHeight = 80
export const subBarHeight = 45
export const toggleHeight = 25
export const factsWidth = 0
export const toggleWidth = 20

const exampleTerm = "\\x.\\y.\\z.x y z"
const exampleContext = emptyContext

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
    redexToAnimate: number
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
    currentTerm: parseTerm(exampleTerm, exampleContext, [], ""),
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
    redexToAnimate: -1,
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
        newTerm: (state, action: PayloadAction<string>) => {
            let currentTerm = parseTerm(action.payload, state.currentContext, state.macros, "")
            return state = { ...state, currentTerm: currentTerm, originalTerm: undefined, termHistory: smartConcatHead(state.currentTerm, state.termHistory), error: "" }
        },
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
        originalTerm: (state) =>
            state = { ...state, currentTerm: state.originalTerm, originalTerm: undefined, termHistory: smartConcatHead(state.currentTerm, state.termHistory), redraw: true },
        resetTerm: (state) =>
            state = { ...state, redraw: true },
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
        animateRedex: (state, action: PayloadAction<number>) =>
            state = { ...state, redexToAnimate: action.payload },
        doneAnimating: (state) =>
            state = { ...state, redexToAnimate: -1 },
        performReduction: (state, action: PayloadAction<number>) =>
            state = { ...state, reductionToPerform: action.payload },
        reductionPerformed: (state) =>
            state = { ...state, reductionToPerform: -1 },
        setActiveBox: (state, action: PayloadAction<number>) =>
            state = { ...state, activeBox: action.payload }
    },
})

export const {
    changeMode, resize, newTerm, newContext, newError, updateTerm, originalTerm, resetTerm, finishedDrawing, backTerm, toggleFactsBar, clear,
    downloadSvg, downloadedSvg, toggleNodeLabels, toggleEdgeLabels, highlightRedex, unhighlightRedex, animateRedex, doneAnimating, performReduction, setActiveBox } = slice.actions

export default slice.reducer