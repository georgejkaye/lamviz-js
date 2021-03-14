import { createSlice, PayloadAction } from "@reduxjs/toolkit"

import { Term, Context } from "../bs/Lambda.bs"

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
}

const initialState: GalleryState = {
    n: 0,
    k: 0,
    error: "",
    terms: [],
    fragment: Fragment.Planar
}

export const slice = createSlice({
    name: "gallerySlice",
    initialState,
    reducers: {
        newTerms: (state, action: PayloadAction<[number, number, Term[]]>) =>
            state = { ...state, n: action.payload[0], k: action.payload[1], terms: action.payload[2] },
        setFragment: (state, action: PayloadAction<Fragment>) =>
            state = { ...state, fragment: action.payload },
        reset: (state) =>
            state = { ...state, terms: [] },
        error: (state, action: PayloadAction<string>) =>
            state = { ...state, error: action.payload }
    },
})

export const {
    newTerms, reset, error, setFragment } = slice.actions

export default slice.reducer