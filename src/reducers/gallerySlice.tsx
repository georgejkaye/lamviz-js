import { createSlice, PayloadAction } from "@reduxjs/toolkit"

import { Term, Context } from "../bs/Lambda.bs"
import { initialiseTermBank } from "../bs/Generators.bs"

export enum Fragment {
    Pure = "Pure", Linear = "Linear", Planar = "Planar"
}

export function getLowerFragmentString(fragment: Fragment) {
    switch (fragment) {
        case Fragment.Pure:
            return "pure"
        case Fragment.Linear:
            return "linear"
        case Fragment.Planar:
            return "planar"
    }
}

interface Dimensions {
    width: number
    height: number
}

interface GalleryState {
    n: number,
    k: number,
    error: string,
    fragment: Fragment
}

const initialState: GalleryState = {
    n: 0,
    k: 0,
    error: "",
    fragment: Fragment.Planar
}

export const slice = createSlice({
    name: "gallerySlice",
    initialState,
    reducers: {
        newParams: (state, action: PayloadAction<[number, number]>) =>
            state = { ...state, n: action.payload[0], k: action.payload[1] },
        setFragment: (state, action: PayloadAction<Fragment>) =>
            state = { ...state, fragment: action.payload },
        reset: (state) =>
            state = { ...state, n: 0, k: 0 },
        error: (state, action: PayloadAction<string>) =>
            state = { ...state, error: action.payload }
    },
})

export const {
    newParams, reset, error, setFragment } = slice.actions

export default slice.reducer