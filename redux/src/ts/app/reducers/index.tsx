import { combineReducers } from "redux";
import sliceReducer from "./slice"

export const rootReducer = combineReducers({
    currentState: sliceReducer
})

export type RootState = ReturnType<typeof rootReducer>