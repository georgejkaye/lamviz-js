import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { Mode } from "./../Types"

import { Term, newVar, newAbs, newApp, prettyPrint } from "./../../../bs/Lambda.bs"
import { lex_and_parse } from "../../../bs/Parser.bs"

let example = newApp(newAbs(newVar(0, ""), "x", ""), newVar(0, ""), "")
console.log(prettyPrint(example))

interface State {
    mode: Mode,
    currentTermText: string,
    currentContextText: string,
    currentTerm: Term,
    error: string
}

const initialState: State = {
    mode: Mode.VISUALISER,
    currentTermText: "",
    currentContextText: "",
    currentTerm: undefined,
    error: ""
}

export const slice = createSlice({
    name: "slice",
    initialState,
    reducers: {
        changeMode: (state, action: PayloadAction<Mode>) =>
            state = { ...state, mode: action.payload },
        newTerm: (state, action: PayloadAction<[string, string, Term]>) =>
            state = { ...state, currentTermText: action.payload[0], currentContextText: action.payload[1], currentTerm: action.payload[2], error: "" },
        newError: (state, action: PayloadAction<string>) =>
            state = { ...state, error: action.payload }
    },
})

export const { changeMode, newTerm, newError } = slice.actions

export default slice.reducer