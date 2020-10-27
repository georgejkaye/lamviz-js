import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { Mode } from "./../Types"

import { Term, newVar, newAbs, newApp, prettyPrint } from "./../../../bs/Lambda.bs"

let example = newApp(newAbs(newVar(0, ""), "x", ""), newVar(0, ""), "")
console.log(prettyPrint(example, 0))

interface State {
    mode: Mode,
    currentInput: string,
    currentTerm: Term
}

const initialState: State = {
    mode: Mode.VISUALISER,
    currentInput: "",
    currentTerm: undefined
}

export const slice = createSlice({
    name: "slice",
    initialState,
    reducers: {
        changeMode: (state, action: PayloadAction<Mode>) =>
            state = { ...state, mode: action.payload },
        newTerm: (state, action: PayloadAction<string>) =>
            state = { ...state, currentInput: action.payload },
    }
})

export const { changeMode, newTerm } = slice.actions

export default slice.reducer