import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "./reducers"
import { Mode, changeMode, newTerm, newError, clear } from "./reducers/slice"
import { Collapse } from "react-collapse"
import MathJax from "react-mathjax-ts"
import { lexAndParse } from "../../bs/Parser.bs";

export default function Sidebar() {

    const dispatch = useDispatch()
    const mode = useSelector((state: RootState) => state.currentState).mode
    const error = useSelector((state: RootState) => state.currentState).error

    const [exampleOpen, setExampleOpen] = useState(false)
    const [termText, setTermText] = useState("")
    const [contextText, setContextText] = useState("")

    function setMode(mode: Mode) {
        dispatch(changeMode(mode))
    }

    const handleTermTextChange = (event: React.ChangeEvent<any>) => {
        setTermText(event.target.value)
    }

    const handleContextTextChange = (event: React.ChangeEvent<any>) => {
        setContextText(event.target.value)
    }

    const onKeyDown = (event: React.KeyboardEvent<any>) => {

        if (event.key === "Enter") {

            switch (mode) {
                case Mode.VISUALISER:
                    generateButton()
                    break
            }
        }
    }

    const generateButton = () => {
        if (termText != "") {
            try {
                let contextTextTrimmed = contextText.trim()
                let [term, context] = lexAndParse(termText, contextTextTrimmed)
                dispatch(newTerm([termText, contextTextTrimmed, term, context]))
            } catch (e) {
                dispatch(newError(e._1))
            }
        } else {
            dispatch(newError("No term specified."))
        }
    }

    const resetButton = () => {
        setTermText("")
        setContextText("")
        dispatch(clear())
    }

    return (
        <div className="sidebar">
            <div className="sidebar-heading">
                <div className="sidebar-introducing">Welcome to the</div>
                <div className="sidebar-header">Lambda {mode == Mode.VISUALISER ? "visualiser" : "gallery"}</div>
            </div>
            <div className="sidebar-content sidebar-text">
                <div>This project was first developed as my dissertation from my undergraduate project supervised by <a href="https://noamz.org">Noam Zeilberger</a>, and later improved in my spare time. If you're interested in the maths behind this, you can read <a href="http://noamz.org/papers/trivalinlam-jfp-final.pdf">this paper</a> by Noam.</div>
            </div>
            <div className="sidebar-content sidebar-text">
                <div className="credit">Graph drawing powered by <a href="https://js.cytoscape.org">Cytoscape.js</a>.</div>
                <div className="credit">Parsing adapted from <a href="https://github.com/tadeuzagallo/lc-js">lc-js</a>.</div>
            </div>
            <div className="tabs">
                <span className={"tab " + (mode === Mode.VISUALISER ? "active-tab" : "inactive-tab")} onClick={(e) => setMode(Mode.VISUALISER)}>Visualiser</span>
                <span className={"tab " + (mode === Mode.GALLERY ? "active-tab" : "inactive-tab")} onClick={(e) => setMode(Mode.GALLERY)}>Gallery</span>
            </div>
            <div className="sidebar-content">
                <Collapse isOpened={error != ""}>
                    <div className="error">
                        {error}
                    </div>
                </Collapse>
                <div className="term">
                    <div className="textbox-label">Term</div>
                    <input id="term-box" className="textbox" type="text" value={termText} placeholder="\x.\y.\z. x (y z)..." onChange={handleTermTextChange} onKeyDown={onKeyDown}></input>
                </div>
                <div className="context">
                    <div className="textbox-label">Context</div>
                    <input id="context-box" className="textbox" type="text" value={contextText} placeholder="a b c..." onChange={handleContextTextChange} onKeyDown={onKeyDown}></input>
                </div>
            </div>
            <div className="sidebar-content"><button type="button" onClick={generateButton}>Generate</button><button type="button" onClick={resetButton}>Clear</button></div>

            <div className="sidebar-heading" onClick={(e) => setExampleOpen(!exampleOpen)}>Example</div>
            <Collapse isOpened={exampleOpen}>
                <div className="example">
                    Hello
                    <MathJax.Context input="tex" onLoad={(e) => console.log("loaded!")} onError={(e) => console.log("error!")}>
                        <div>
                            <MathJax.Node>{"2"}</MathJax.Node>
                        </div>
                    </MathJax.Context>
                </div>
            </Collapse>

        </div >)
}