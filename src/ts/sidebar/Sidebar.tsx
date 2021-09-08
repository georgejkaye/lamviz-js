import { useAppSelector, useAppDispatch } from "../redux/hooks"
import { RootState } from "./../redux/store"
import { Mode, changeMode } from "./sidebarSlice"

import GallerySidebar from "./GallerySidebar"
import { sidebarWidth } from "../workbench/workbenchSlice"

import Github from "../../data/svgs/github.svg"

export default function Sidebar() {

    let dispatch = useAppDispatch()

    //const mode = useAppSelector((state) => state.workbench).mode

    function setMode(mode: Mode) {
        dispatch(changeMode(mode))
    }

    return (
        <div className="sidebar" style={{ width: sidebarWidth }}>
            <div className="sidebar-block"><a href="https://www.georgejkaye.com/lambda-visualiser" title="Details about the visualiser"><span className="sidebar-icon">λ</span></a></div>
            <div className="spacer"></div>
            <div className="sidebar-block"><a href="https://github.com/georgejkaye/lamviz" title="GitHub repository for this project"><img className="sidebar-icon" src={Github} alt="GitHub logo" /></a></div>

        </ div >
    )
}