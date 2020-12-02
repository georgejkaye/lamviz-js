import { createSlice, PayloadAction } from "@reduxjs/toolkit"

import { Term, Context } from "../bs/Lambda.bs"

interface Dimensions {
    width: number
    height: number
}

interface GalleryState {
    n: number,
    k: number,
    error: string,
    terms: Term[]
}

const initialState: GalleryState = {
    n: 0,
    k: 0,
    error: "",
    terms: []
}

export const slice = createSlice({
    name: "gallerySlice",
    initialState,
    reducers: {
        newTerms: (state, action: PayloadAction<[number, number, Term[]]>) =>
            state = { ...state, n: action.payload[0], k: action.payload[1], terms: action.payload[2] },
        reset: (state) =>
            state = { ...state, terms: [] },
        error: (state, action: PayloadAction<string>) =>
            state = { ...state, error: action.payload }
    },
})

export const {
    newTerms, reset, error } = slice.actions

export default slice.reducer