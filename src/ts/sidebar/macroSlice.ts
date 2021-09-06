import { createSlice, PayloadAction } from "@reduxjs/toolkit"

import { MacroDetails } from "../workbench/Macro"

interface State {
    macrosOn: boolean,
    macros: MacroDetails[],
}

const initialState: State = {
    macrosOn: true,
    macros: [],
}

export const slice = createSlice({
    name: "slice",
    initialState,
    reducers: {
        updateMacro: (state, action: PayloadAction<[number, MacroDetails]>) =>
            state = { ...state, macros: state.macros.slice(0, action.payload[0]).concat([action.payload[1]]).concat(state.macros.slice(action.payload[0] + 1)) },
        toggleMacrosOn: (state) =>
            state = { ...state, macrosOn: !state.macrosOn },
        addMacro: (state) =>
            state = { ...state, macros: state.macros.concat({ name: "", termstring: "", term: undefined, active: true }) },
        defineMacro: (state, action: PayloadAction<MacroDetails>) =>
            state = { ...state, macros: state.macros.concat(action.payload) },
        setMacros: (state, action: PayloadAction<MacroDetails[]>) =>
            state = { ...state, macros: action.payload },
        toggleMacro: (state, action: PayloadAction<number>) =>
            state = { ...state, macros: state.macros.slice(0, action.payload).concat([{ ...state.macros[action.payload], active: !state.macros[action.payload].active }]).concat(state.macros.slice(action.payload + 1)) },
        removeMacro: (state, action: PayloadAction<number>) =>
            state = { ...state, macros: state.macros.slice(0, action.payload).concat(state.macros.slice(action.payload + 1)) },
        removeAllMacros: (state) =>
            state = { ...state, macros: [] }
    },
})

export const {
    toggleMacrosOn, addMacro, defineMacro, updateMacro, toggleMacro, setMacros, removeMacro, removeAllMacros, } = slice.actions

export default slice.reducer