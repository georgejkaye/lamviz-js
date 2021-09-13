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
    settingsOut: boolean,
    screenDimensions: Dimensions
}

const initialState: State = {
    mode: Mode.VISUALISER,
    settingsOut: false,
    screenDimensions: { width: window.innerWidth, height: window.innerHeight },
}

export const slice = createSlice({
    name: "sidebar",
    initialState,
    reducers: {
        changeMode: (state, action: PayloadAction<Mode>) =>
            state = { ...state, mode: action.payload },
        openSettings: (state, action: PayloadAction<boolean>) =>
            state = { ...state, settingsOut: action.payload },
        toggleSettings: (state) =>
            state = { ...state, settingsOut: !state.settingsOut }
    }
})

export const { changeMode, toggleSettings } = slice.actions

export default slice.reducer