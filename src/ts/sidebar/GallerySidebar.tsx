import React, { useState } from "react";
import { useDispatch } from "react-redux";

import { Collapse } from "react-collapse"

import { useAppSelector } from "../redux/hooks";
import { newParams, reset, setFragment, Fragment } from "../gallery/gallerySlice"

import { Term } from "../../bs/Lambda.bs"

interface SortProps {
    text: string
    value: string
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void
    onKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => void
}

function SortBox(props: SortProps) {
    return (
        <div className="sort-option">
            <div className="sort-text">{props.text}</div>
            <input id="size-box" className="number-box" type="text" value={props.value} onChange={props.onChange} onKeyDown={props.onKeyDown}></input>
        </div>)
}

const setText = (func: (value: React.SetStateAction<string>) => void, event: React.ChangeEvent<any>) => {
    func(event.target.value)
}

interface FiltersProps {
    onKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => void
}

function Filters(props: FiltersProps) {
    const [crossingsText, setCrossingsText] = useState("")
    const [redexesText, setRedexesText] = useState("")
    const [bridgesText, setBridgesText] = useState("")
    const [variablesText, setVariablesText] = useState("")
    const [abstractionsText, setAbstractionsText] = useState("")
    const [applicationsText, setApplicationsText] = useState("")

    return (<div>
        <div className="sidebar-heading">Filtering options</div>
        <SortBox text={"Crossings"} value={crossingsText} onChange={(e) => setText(setCrossingsText, e)} onKeyDown={props.onKeyDown} />
        <SortBox text={"Redexes"} value={redexesText} onChange={(e) => setText(setRedexesText, e)} onKeyDown={props.onKeyDown} />
        <SortBox text={"Bridges"} value={bridgesText} onChange={(e) => setText(setBridgesText, e)} onKeyDown={props.onKeyDown} />
        <SortBox text={"Variables"} value={variablesText} onChange={(e) => setText(setVariablesText, e)} onKeyDown={props.onKeyDown} />
        <SortBox text={"Abstractions"} value={abstractionsText} onChange={(e) => setText(setAbstractionsText, e)} onKeyDown={props.onKeyDown} />
        <SortBox text={"Applications"} value={applicationsText} onChange={(e) => setText(setApplicationsText, e)} onKeyDown={props.onKeyDown} />
    </div>)
}

interface FragmentButtonProps {
    fragment: Fragment
}

function FragmentButton(props: FragmentButtonProps) {
    const dispatch = useDispatch()
    const fragment = useAppSelector((state) => state.gallery).fragment
    return <button type="button" className={fragment === props.fragment ? "on" : "off"} onClick={(_) => dispatch(setFragment(props.fragment))}>{props.fragment}</button>
}

export default function VisualiserSidebar() {

    const dispatch = useDispatch()

    const n = useAppSelector((state) => state.gallery).n
    const k = useAppSelector((state) => state.gallery).k

    const [sizeText, setSizeText] = useState("")
    const [freeText, setFreeText] = useState("")
    const [error, setError] = useState("")

    const handleSizeChange = (event: React.ChangeEvent<any>) => {
        setSizeText(event.target.value)
    }
    const handleFreeChange = (event: React.ChangeEvent<any>) => {
        setFreeText(event.target.value)
    }

    const onKeyDown = (event: React.KeyboardEvent<any>) => {
        if (event.key === "Enter") {
            generateButton()
        }
    }

    const generateButton = () => {

        let newSize = parseInt(sizeText)
        let newFree = freeText === "" ? 0 : parseInt(freeText)

        if (isNaN(newSize)) {
            setError("Parse error: bad n")
        } else if (isNaN(newFree)) {
            setError("Parse error: bad k")
        } else {
            setError("")
            dispatch(newParams([newSize, newFree]))
        }


    }
    const resetButton = () => {
        setSizeText("")
        setFreeText("")
        dispatch(reset())
    }

    return (
        <div className="sub-sidebar">
            <div className="sidebar-content">Set subterms and free variables</div>
            <Collapse isOpened={error !== ""}>
                <div className="error">
                    {error}
                </div>
            </Collapse>
            <div className="sidebar-content number-boxes">
                <div className="number-item">n</div>
                <div className="number-item">
                    <input id="size-box" className="number-box" type="text" value={sizeText} onChange={handleSizeChange} onKeyDown={onKeyDown}></input>
                </div>
                <div className="number-item">k</div>
                <div className="number-item">
                    <input id="free-box" className="number-box" type="text" value={freeText} onChange={handleFreeChange} onKeyDown={onKeyDown}></input>
                </div>
            </div>
            <div className="sidebar-content number-boxes">
                <FragmentButton fragment={Fragment.Pure} />
                <FragmentButton fragment={Fragment.Linear} />
                <FragmentButton fragment={Fragment.Planar} />
            </div>
            <div className="sidebar-content">
                <button type="button" onClick={generateButton}>Generate</button>
                <button type="button" onClick={resetButton}>Clear</button>
            </div>
            <Filters onKeyDown={onKeyDown} />
        </div >)
}