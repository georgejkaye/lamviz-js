import React, { useEffect, useState } from "react"

import { Collapse } from "react-collapse"
import ReactTooltip from "react-tooltip"

import { useAppDispatch, useAppSelector } from "../redux/hooks"
import { newTerm, newError, clear, toggleNodeLabels, toggleEdgeLabels } from "./../workbench/workbenchSlice"
import { toggleMacrosOn, addMacro, setMacros, removeAllMacros } from "./macroSlice"

import { Macro, MacroDetails, ActiveMacro } from "../workbench/Macro"

import { lexAndParse } from "../../bs/Parser.bs"

import Add from "../../data/svgs/add-black.svg"
import Delete from "../../data/svgs/bin.svg"
import Upload from "../../data/svgs/upload.svg"
import Download from "../../data/svgs/download.svg"

export default function VisualiserSidebar() {

    const dispatch = useAppDispatch()
    const error = useAppSelector((state) => state.workbench).error
    const nodeLabels = useAppSelector((state) => state.workbench).nodeLabels
    const edgeLabels = useAppSelector((state) => state.workbench).edgeLabels

    const macrosOn = useAppSelector((state) => state.macros).macrosOn
    const macros = useAppSelector((state) => state.macros).macros

    const [termText, setTermText] = useState("")
    const [contextText, setContextText] = useState("")
    const [macroError, setMacroError] = useState("")

    let fileReader: FileReader;

    useEffect(() => {
        setMacroError("")
    }, [macros])

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
        if (termText !== "") {
            try {
                let contextTextTrimmed = contextText.trim()
                let [term, context] = lexAndParse(termText, contextTextTrimmed, macros, "")
                dispatch(newTerm([termText, contextTextTrimmed, term, context]))
            } catch (e: any) {
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

    const addMacroButton = () => {
        dispatch(addMacro())
    }

    const uploadedMacros = (e: ProgressEvent<FileReader>) => {
        let content: any = fileReader.result
        let newMacros = content.split("\n")

        let parsedMacros: MacroDetails[] = macros.concat([])
        let macroError = ""

        newMacros.map((mac: any, i: number) => {

            if (mac.length > 2) {
                let split = mac.split(":=")

                if (split.length === 2) {
                    let name = split[0].replaceAll(" ", "")
                    let termtext = split[1].trim()

                    try {
                        let [term, _] = lexAndParse(termtext, "", parsedMacros, name)
                        let newMac = { name: name, termstring: termtext, term: term, active: false }
                        parsedMacros = parsedMacros.filter((x) => x.name !== name)
                        parsedMacros.push(newMac)
                    } catch (e: any) {
                        macroError = (macroError === "") ? "Line " + (i + 1) + ": " + e._1 : macroError
                    }
                } else {
                    macroError = "Line " + (i + 1) + ": malformed input"
                }
            }
        })

        macroError === "" ? dispatch(setMacros(parsedMacros)) : setMacroError(macroError)
    }

    const uploadMacrosButton = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            fileReader = new FileReader()
            fileReader.onloadend = uploadedMacros
            fileReader.readAsText(e.target.files[0])
        }
    }

    const downloadMacrosButton = () => {
        let string = macros.reduce((acc, mac) => {
            return acc + mac.name + " := " + mac.termstring + "\n"
        }, "")

        let data = new Blob([string], { type: "text/plain" })
        let url = window.URL.createObjectURL(data)
        var downloadLink = document.createElement("a");
        downloadLink.href = url;
        downloadLink.download = "macros.txt";
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);

    }

    const removeAllMacrosButton = () => {
        dispatch(removeAllMacros())
    }

    const toggleNodeLabelsButton = () => dispatch(toggleNodeLabels())
    const toggleEdgeLabelsButton = () => dispatch(toggleEdgeLabels())
    const toggleMacrosButton = () => dispatch(toggleMacrosOn())

    return (
        <div className="sub-sidebar">
            <div className="sidebar-content">
                <Collapse isOpened={error !== ""}>
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
                <button type="button" className={macrosOn ? "on" : "off"} onClick={toggleMacrosButton} >{macrosOn ? "Macros on" : "Macros off"}</button>
                <button type="button" className={nodeLabels ? "on" : "off"} onClick={toggleNodeLabelsButton} >{nodeLabels ? "Node labels on" : "Node labels off"}</button>
                <button type="button" className={edgeLabels ? "on" : "off"} onClick={toggleEdgeLabelsButton} >{edgeLabels ? "Edge labels on" : "Edge labels off"}</button>
            </div>
            <div className="sidebar-heading">
                <div><button data-tip="add-tooltip" data-for="add" type="button" className="icon-button" onClick={addMacroButton}><img src={Add} className={"icon"} alt={"Add"} /></button></div>
                <ReactTooltip id="add" type="dark" place="right" effect="float">Add</ReactTooltip>
                <div><button data-tip="delete-tooltip" data-for="delete" type="button" className="icon-button" onClick={removeAllMacrosButton} disabled={macros.length === 0}><img src={Delete} className={"icon"} alt={"Delete"} /></button></div>
                <ReactTooltip id="delete" type="dark" place="right" effect="float">Remove all</ReactTooltip>
                <div className="heading-icon">Macros</div>
                <input type="file" accept="text/plain" id="upload-macros" onChange={uploadMacrosButton} />
                <div><button data-tip="upload-tooltip" data-for="upload" type="button" className="icon-button paddingless"><label htmlFor="upload-macros"><img src={Upload} className={"icon padded clickable"} alt={"Upload"} /></label></button></div>
                <ReactTooltip id="upload" type="dark" place="left" effect="float">Upload</ReactTooltip>
                <div><button data-tip="download-tooltip" data-for="download" type="button" className="icon-button" onClick={downloadMacrosButton} disabled={macros.length === 0}><img src={Download} className={"icon"} alt={"Download"} /></button></div>
                <ReactTooltip id="download" type="dark" place="left" effect="float">Download</ReactTooltip>
            </div>
            <div className="sidebar-content">To upload a macros file, define each macro on its own line in the form <span className="code">id := \x.x</span></div>
            <Collapse isOpened={macroError !== ""}>
                <div className="sidebar-content error">
                    {macroError}
                </div>
            </Collapse>
            <div className="sidebar-content macro-list">{
                macros.map((mac, i) => (
                    mac.active ? <ActiveMacro macro={mac} no={i} /> : <Macro macro={mac} no={i} />
                ))}
            </div>
        </div >)
}