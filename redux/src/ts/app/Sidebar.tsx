import React, { useState, KeyboardEvent, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ModifierFlags } from "typescript";
import { RootState } from "./reducers"
import { Mode } from "./Types"
import { changeMode, newTerm, newError } from "./reducers/slice"
import { Collapse } from "react-collapse"
import MathJax from "react-mathjax-ts"
import { lex_and_parse } from "../../bs/Parser.bs";

export default function Sidebar() {

    const tex = "\\lambda x.\\lambda y \\lambda z. x (y z)"

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
                    if (termText != "") {
                        console.log(termText)

                        try {
                            let term = lex_and_parse(termText, contextText)
                            dispatch(newTerm([termText, contextText, term]))
                        } catch (e) {
                            dispatch(newError(e._1))
                        }


                        break
                    }
            }

        }
    }

    return (
        <div className="sidebar">
            <div className="sidebar-heading">
                <div className="sidebar-introducing">Welcome to the</div>
                <div className="sidebar-header">Lambda {mode == Mode.VISUALISER ? "visualiser" : "gallery"}</div>
            </div>
            <div className="sidebar-content">
                <div>This project was first developed as my dissertation from my undergraduate project supervised by <a href="https://noamz.org">Noam Zeilberger</a>, and later improved in my spare time. If you're interested in the maths behind this, you can read <a href="http://noamz.org/papers/trivalinlam-jfp-final.pdf">this paper</a> by Noam.</div>
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
                    <input className="textbox" type="text" placeholder="\x.\y.\z. x (y z)..." onChange={handleTermTextChange} onKeyDown={onKeyDown}></input>
                </div>
                <div className="context">
                    <div className="textbox-label">Context</div>
                    <input className="textbox" type="text" placeholder="a b c..." onChange={handleContextTextChange} onKeyDown={onKeyDown}></input>
                </div>
            </div>
            <div className="sidebar-content"><button type="button">Execute</button><button type="button">Clear</button></div>

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