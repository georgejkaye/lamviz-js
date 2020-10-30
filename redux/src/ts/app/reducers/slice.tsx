import { createSlice, PayloadAction } from "@reduxjs/toolkit"

import { Term, Context } from "./../../../bs/Lambda.bs"

export enum Mode {
    VISUALISER, GALLERY
}

interface State {
    mode: Mode,
    currentTermText: string,
    currentContextText: string,
    currentTerm: Term,
    originalTerm: Term,
    currentContext: Context,
    error: string
}

const initialState: State = {
    mode: Mode.VISUALISER,
    currentTermText: "",
    currentContextText: "",
    currentTerm: undefined,
    originalTerm: undefined,
    currentContext: undefined,
    error: ""
}

export const slice = createSlice({
    name: "slice",
    initialState,
    reducers: {
        changeMode: (state, action: PayloadAction<Mode>) =>
            state = { ...state, mode: action.payload },
        newTerm: (state, action: PayloadAction<[string, string, Term, Context]>) =>
            state = { ...state, currentTermText: action.payload[0], currentContextText: action.payload[1], currentTerm: action.payload[2], originalTerm: action.payload[2], currentContext: action.payload[3], error: "" },
        newError: (state, action: PayloadAction<string>) =>
            state = { ...state, error: action.payload },
        updateTerm: (state, action: PayloadAction<Term>) =>
            state = { ...state, currentTerm: action.payload },
        resetTerm: (state) =>
            state = { ...state, currentTerm: state.originalTerm },
        clear: (state) =>
            state = { ...state, currentTermText: "", currentContextText: "", currentTerm: undefined, error: "" }
    },
})

export const { changeMode, newTerm, newError, updateTerm, resetTerm, clear } = slice.actions

export default slice.reducer