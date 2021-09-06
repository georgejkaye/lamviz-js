import { useAppSelector, useAppDispatch } from "../redux/hooks"
import { RootState } from "./../redux/store"
import { Mode, changeMode } from "./sidebarSlice"

import VisualiserSidebar from "./WorkbenchSidebar"
import GallerySidebar from "./GallerySidebar"
import { sidebarWidth } from "../workbench/workbenchSlice"

export default function Sidebar() {

    let dispatch = useAppDispatch()

    //const mode = useAppSelector((state) => state.workbench).mode

    function setMode(mode: Mode) {
        dispatch(changeMode(mode))
    }

    // return (
    //     <div className="sidebar">
    //         <div className="sidebar-heading">Welcome to the</div>
    //         <div className="sidebar-title">Lambda {mode === Mode.VISUALISER ? "visualiser" : "gallery"}</div>
    //         <div className="sidebar-content sidebar-text">
    //             <div>This project was first developed as my dissertation from my undergraduate project supervised by <a href="https://noamz.org">Noam Zeilberger</a>, and later improved in my spare time. <a href="https://www.georgejkaye.com/lambda-visualiser">Read more</a>.</div>
    //         </div>
    //         <div className="sidebar-content sidebar-text">
    //             <div className="credit">Graph drawing powered by <a href="https://js.cytoscape.org">Cytoscape.js</a>.</div>
    //             <div className="credit">Parsing adapted from <a href="https://github.com/tadeuzagallo/lc-js">lc-js</a>.</div>
    //         </div>
    //         <div className="tabs">
    //             <span className={"tab " + (mode === Mode.VISUALISER ? "active-tab" : "inactive-tab")} onClick={(e) => setMode(Mode.VISUALISER)}>Visualiser</span>
    //             <span className={"tab " + (mode === Mode.GALLERY ? "active-tab" : "inactive-tab")} onClick={(e) => setMode(Mode.GALLERY)}>Gallery</span>
    //         </div>
    //         {mode === Mode.VISUALISER ? <VisualiserSidebar /> : <GallerySidebar />}

    //     </div >)
    return (
        <div style={{ width: sidebarWidth }}></ div >
    )
}