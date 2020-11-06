import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "./../reducers"
import { Mode, changeMode, newTerm, newError, clear } from "./../reducers/slice"

import VisualiserSidebar from "./VisualiserSidebar"
import GallerySidebar from "./GallerySidebar"

export default function Sidebar() {

    let dispatch = useDispatch()

    const mode = useSelector((state: RootState) => state.currentState).mode

    function setMode(mode: Mode) {
        dispatch(changeMode(mode))
    }

    return (
        <div className="sidebar">
            <div className="sidebar-heading">
                <div className="sidebar-introducing">Welcome to the</div>
                <div className="sidebar-header">Lambda {mode == Mode.VISUALISER ? "visualiser" : "gallery"}</div>
            </div>
            <div className="sidebar-content sidebar-text">
                <div>This project was first developed as my dissertation from my undergraduate project supervised by <a href="https://noamz.org">Noam Zeilberger</a>, and later improved in my spare time. If you're interested in the maths behind this, you can read <a href="http://noamz.org/papers/trivalinlam-jfp-final.pdf">this paper</a> by Noam. You can also check out <a href="https://github.com/noamz/linlam">LinLam</a>, a Haskell library for experimental linear lambda calculus.</div>
            </div>
            <div className="sidebar-content sidebar-text">
                <div className="credit">Graph drawing powered by <a href="https://js.cytoscape.org">Cytoscape.js</a>.</div>
                <div className="credit">Parsing adapted from <a href="https://github.com/tadeuzagallo/lc-js">lc-js</a>.</div>
            </div>
            <div className="tabs">
                <span className={"tab " + (mode === Mode.VISUALISER ? "active-tab" : "inactive-tab")} onClick={(e) => setMode(Mode.VISUALISER)}>Visualiser</span>
                <span className={"tab " + (mode === Mode.GALLERY ? "active-tab" : "inactive-tab")} onClick={(e) => setMode(Mode.GALLERY)}>Gallery</span>
            </div>
            {mode === Mode.VISUALISER ? <VisualiserSidebar /> : <GallerySidebar />}

        </div >)
}