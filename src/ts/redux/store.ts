import { configureStore } from '@reduxjs/toolkit'
import workbenchReducer from "../workbench/workbenchSlice"
import galleryReducer from "../gallery/gallerySlice"
import macroReducer from '../sidebar/macroSlice'
import sidebarReducer from "../sidebar/sidebarSlice"

export const store = configureStore({
    reducer: {
        workbench: workbenchReducer,
        macros: macroReducer,
        gallery: galleryReducer,
        sidebar: sidebarReducer
    }
})

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch

export default store