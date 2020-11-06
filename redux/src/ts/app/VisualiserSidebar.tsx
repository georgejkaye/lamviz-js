import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "./reducers"
import { Mode, changeMode, newTerm, newError, clear } from "./reducers/slice"
import { lexAndParse } from "../../bs/Parser.bs";
import { Collapse } from "react-collapse"

export default function VisualiserSidebar() {

    const dispatch = useDispatch()
    const error = useSelector((state: RootState) => state.currentState).error

    const [exampleOpen, setExampleOpen] = useState(false)
    const [termText, setTermText] = useState("")
    const [contextText, setContextText] = useState("")

    const handleTermTextChange = (event: React.ChangeEvent<any>) => {
        setTermText(event.target.value)
    }

    const handleContextTextChange = (event: React.ChangeEvent<any>) => {
        setContextText(event.target.value)
    }

    const onKeyDown = (event: React.KeyboardEvent<any>) => {

        if (event.key === "Enter") {
            generateButton()
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
        <div className="visualiser-sidebar">
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

            <div className="sidebar-heading">View options</div>
            <div className="sidebar-content">
                <label className="left"><input type="radio" id="yes-labels" name="labels" value="yes" /> Show labels</label>
                <label className="right"><input type="radio" id="yes-labels" name="labels" value="yes" /> Hide labels</label>

            </div>
            <div className="sidebar-heading">Macros</div>
        </div >)
}