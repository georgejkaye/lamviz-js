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
    currentTerm: Term
}

const initialState: State = {
    mode: Mode.VISUALISER,
    currentTermText: "",
    currentContextText: "",
    currentTerm: undefined
}

export const slice = createSlice({
    name: "slice",
    initialState,
    reducers: {
        changeMode: (state, action: PayloadAction<Mode>) =>
            state = { ...state, mode: action.payload },
        newTerm(state, action: PayloadAction<[string, string]>) {
            let termText = action.payload[0]
            let contextText = action.payload[1]

            let term = lex_and_parse(termText, contextText)

            state.currentTermText = termText
            state.currentContextText = contextText
            state.currentTerm = term
        },
    }
})

export const { changeMode, newTerm } = slice.actions

export default slice.reducer