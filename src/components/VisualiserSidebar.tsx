import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "./../reducers"
import { newTerm, newError, clear, toggleNodeLabels, toggleEdgeLabels, addMacro, addMacros, removeAllMacros } from "./../reducers/slice"
import { lexAndParse } from "../bs/Parser.bs";
import { Collapse } from "react-collapse"

import { Macro, ActiveMacro } from "./Macro"

import Add from "../data/svgs/add-white.svg"
import Delete from "../data/svgs/bin.svg"
import Upload from "../data/svgs/upload.svg"
import Download from "../data/svgs/download.svg"
import Pencil from "../data/svgs/pencil.svg"
import { emptyContext, Term } from "../bs/Lambda.bs";

export default function VisualiserSidebar() {

    const dispatch = useDispatch()
    const error = useSelector((state: RootState) => state.currentState).error
    const nodeLabels = useSelector((state: RootState) => state.currentState).nodeLabels
    const edgeLabels = useSelector((state: RootState) => state.currentState).edgeLabels
    const macros = useSelector((state: RootState) => state.currentState).macros

    const [exampleOpen, setExampleOpen] = useState(false)
    const [termText, setTermText] = useState("")
    const [contextText, setContextText] = useState("")
    const [bulkMacros, setBulkMacros] = useState(false)
    const [macroError, setMacroError] = useState("")

    let fileReader: FileReader;

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

    const uploadedMacros = (e: ProgressEvent<FileReader>) => {
        let content: any = fileReader.result
        let newMacros = content.split("\n")

        let parsedMacros: Macro[] = macros.concat([])
        let macroError = ""

        newMacros.map((mac: any, i: number) => {

            if (mac.length > 2) {
                let split = mac.split(":=")

                if (split.length == 2) {
                    let name = split[0].replaceAll(" ", "")
                    let termtext = split[1].trim()

                    console.log(name, ":=", termtext)

                    try {
                        let [term, ctx] = lexAndParse(termtext, "", parsedMacros, name)
                        console.log(term)
                        let newMac = { name: name, termstring: termtext, term: term, active: false }
                        parsedMacros.push(newMac)
                    } catch (e) {
                        console.log("Line", i, "error", e)
                        macroError = "Line " + (i + 1) + ": " + e._1
                    }
                } else {
                    console.log("Line", i, "error")
                    macroError = "Line " + (i + 1) + ": malformed input"
                }
            }
        })

        macroError == "" ? dispatch(addMacros(parsedMacros)) : setMacroError(macroError)
    }

    const uploadMacros = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files != undefined) {
            setMacroError("")
            fileReader = new FileReader()
            fileReader.onloadend = uploadedMacros
            fileReader.readAsText(e.target.files[0])
        }
    }

    const removeAllMacrosButton = () => {
        dispatch(removeAllMacros())
        setMacroError("")
    }

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
                <div><img src={Add} className="icon left-icon clickable" onClick={addMacroButton} /></div>
                <div><img src={Delete} className="icon left-icon clickable" onClick={removeAllMacrosButton} /></div>
                <div className="heading-icon">Macros</div>
                <input type="file" accept="text/plain" id="upload-macros" onChange={uploadMacros} />
                <label htmlFor="upload-macros"><div><img src={Upload} className="icon right-icon clickable" /></div></label>
                <div><img src={Download} className="icon right-icon clickable" /></div>
            </div>
            <Collapse isOpened={macroError != ""}>
                <div className="error">
                    {macroError}
                </div>
            </Collapse>
            <div className="macro-list">{
                macros.map((mac, i) => (
                    mac.active ? <ActiveMacro macro={mac} no={i} /> : <Macro macro={mac} no={i} />
                ))}
            </div>
        </div >)
}