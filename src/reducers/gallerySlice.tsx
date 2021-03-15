import { createSlice, PayloadAction } from "@reduxjs/toolkit"

import { Term, Context } from "../bs/Lambda.bs"
import { initialiseTermBank } from "../bs/Generators.bs"

export enum Fragment {
    Pure = "Pure", Linear = "Linear", Planar = "Planar"
}

interface Dimensions {
    width: number
    height: number
}

interface GalleryState {
    n: number,
    k: number,
    error: string,
    terms: Term[],
    fragment: Fragment
    mem: any
}

const initialState: GalleryState = {
    n: 0,
    k: 0,
    error: "",
    terms: [],
    fragment: Fragment.Planar,
    mem: initialiseTermBank(16, 16)
}

export const slice = createSlice({
    name: "gallerySlice",
    initialState,
    reducers: {
        newParams: (state, action: PayloadAction<[number, number]>) =>
            state = { ...state, n: action.payload[0], k: action.payload[1] },
        updateTerms: (state, action: PayloadAction<Term[]>) =>
            state = { ...state, terms: action.payload },
        setFragment: (state, action: PayloadAction<Fragment>) =>
            state = { ...state, fragment: action.payload },
        updateMem: (state, action: PayloadAction<any>) =>
            state = { ...state, mem: action.payload },
        reset: (state) =>
            state = { ...state, terms: [] },
        error: (state, action: PayloadAction<string>) =>
            state = { ...state, error: action.payload }
    },
})

export const {
    newParams, updateTerms, reset, error, setFragment, updateMem } = slice.actions

export default slice.reducer