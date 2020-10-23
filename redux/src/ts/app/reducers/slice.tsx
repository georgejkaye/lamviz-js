import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { Term, Mode } from "./../Types"

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