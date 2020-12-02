import { combineReducers } from "redux";
import sliceReducer from "./slice"
import galleryReducer from "./gallerySlice"

export const rootReducer = combineReducers({
    currentState: sliceReducer,
    gallerySlice: galleryReducer
})

export type RootState = ReturnType<typeof rootReducer>