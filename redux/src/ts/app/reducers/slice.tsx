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
    currentContext: Context,
    error: string
}

const initialState: State = {
    mode: Mode.VISUALISER,
    currentTermText: "",
    currentContextText: "",
    currentTerm: undefined,
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
            state = { ...state, currentTermText: action.payload[0], currentContextText: action.payload[1], currentTerm: action.payload[2], currentContext: action.payload[3], error: "" },
        newError: (state, action: PayloadAction<string>) =>
            state = { ...state, error: action.payload },
        reset: (state) =>
            state = { ...state, currentTermText: "", currentContextText: "", currentTerm: undefined, error: "" }
    },
})

export const { changeMode, newTerm, newError, reset } = slice.actions

export default slice.reducer