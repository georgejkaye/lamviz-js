import { createSlice, PayloadAction } from "@reduxjs/toolkit"

export enum Mode {
    VISUALISER, GALLERY
}

interface Dimensions {
    width: number
    height: number
}

interface State {
    mode: Mode,
    screenDimensions: Dimensions
}

const initialState: State = {
    mode: Mode.VISUALISER,
    screenDimensions: { width: window.innerWidth, height: window.innerHeight },
}

export const slice = createSlice({
    name: "slice",
    initialState,
    reducers: {
        changeMode: (state, action: PayloadAction<Mode>) =>
            state = { ...state, mode: action.payload }
    }
})

export const { changeMode } = slice.actions

export default slice.reducer