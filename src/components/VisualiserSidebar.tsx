import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "./../reducers"
import { newTerm, newError, clear, toggleNodeLabels, toggleEdgeLabels, addMacro, removeAllMacros } from "./../reducers/slice"
import { lexAndParse } from "../bs/Parser.bs";
import { Collapse } from "react-collapse"

import { Macro, ActiveMacro } from "./Macro"

import Add from "../data/svgs/add-white.svg"
import Delete from "../data/svgs/bin.svg"
import Pencil from "../data/svgs/pencil.svg"

export default function VisualiserSidebar() {

    const dispatch = useDispatch()
    const error = useSelector((state: RootState) => state.currentState).error
    const nodeLabels = useSelector((state: RootState) => state.currentState).nodeLabels
    const edgeLabels = useSelector((state: RootState) => state.currentState).edgeLabels
    const macros = useSelector((state: RootState) => state.currentState).macros

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
                let [term, context] = lexAndParse(termText, contextTextTrimmed, macros, "")
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

    const addMacroButton = () => dispatch(addMacro())

    const removeAllMacrosButton = () => dispatch(removeAllMacros())

    const toggleNodeLabelsButton = () => dispatch(toggleNodeLabels())
    const toggleEdgeLabelsButton = () => dispatch(toggleEdgeLabels())

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
                    <input id="term-box" className="full-textbox" type="text" value={termText} placeholder="\x.\y.\z. x (y z)..." onChange={handleTermTextChange} onKeyDown={onKeyDown}></input>
                </div>
                <div className="context">
                    <div className="textbox-label">Context</div>
                    <input id="context-box" className="full-textbox" type="text" value={contextText} placeholder="a b c..." onChange={handleContextTextChange} onKeyDown={onKeyDown}></input>
                </div>
            </div>
            <div className="sidebar-content">
                <button type="button" onClick={generateButton}>Generate</button>
                <button type="button" onClick={resetButton}>Clear</button>
            </div>
            <div className="sidebar-heading">View options</div>
            <div className="sidebar-content">
                <button type="button" className={nodeLabels ? "on" : "off"} onClick={toggleNodeLabelsButton} >{nodeLabels ? "Node labels on" : "Node labels off"}</button>
                <button type="button" className={edgeLabels ? "on" : "off"} onClick={toggleEdgeLabelsButton} >{edgeLabels ? "Edge labels on" : "Edge labels off"}</button>
            </div>
            <div className="sidebar-heading">
                <div><img src={Delete} className="icon left-icon clickable" onClick={removeAllMacrosButton} /></div>
                <div className="heading-icon">Macros</div>
                <div><img src={Add} className="icon right-icon clickable" onClick={addMacroButton} /></div>
            </div>
            <div className="macro-list">{
                macros.map((mac, i) => (
                    mac.active ? <ActiveMacro macro={mac} no={i} /> : <Macro macro={mac} no={i} />
                ))}
            </div>
        </div >)
}