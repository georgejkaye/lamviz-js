import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "./../reducers"
import { updateMacro } from "./../reducers/slice"
import { Term, Context, prettyPrint, printTermAndContext, emptyContext } from "../bs/Lambda.bs"
import { Collapse } from "react-collapse"

import Up from "../data/svgs/up-chevron.svg"
import Down from "../data/svgs/down-chevron.svg"
import Delete from "../data/svgs/close.svg"
import Tick from "../data/svgs/tick.svg"
import { generateGraphElementsArray } from "../bs/Graph.bs";
import { lexAndParse } from "../bs/Parser.bs";

export interface Macro {
    name: string
    termstring: string
    term: Term
    active: boolean
}

interface MacroProps {
    macro: Macro,
    no: number
}

export function Macro(props: MacroProps) {

    let [isOpen, setOpen] = useState(false)

    return (
        /*<div className="macro">
            <div className="macro-name">
                <div><img src={isOpen ? Up : Down} className="icon left-icon" alt={isOpen ? "\u2191" : "\u2193"} /></div>
                <div>{props.macro.name}</div>
                <div><img src={Delete} className="icon left-icon" alt="x" /></div>
            </div>
            <div className={isOpen ? "macro-def open" : "macro-def closed"}>{props.macro.term}</div>
        </div>*/
        <div className="macro" key="aaa" >
            <div className="macro-title">{props.macro.name}</div>
            <div>{prettyPrint(props.macro.term, emptyContext, true, false)}</div>
        </div>
    )
}

export function ActiveMacro(props: MacroProps) {

    let dispatch = useDispatch()
    const macros = useSelector((state: RootState) => state.currentState).macros

    let [nameText, setNameText] = useState(props.macro.name)
    let [termText, setTermText] = useState(props.macro.termstring)
    let [error, setError] = useState("")

    const nameChange = (event: React.ChangeEvent<any>) => setNameText(event.target.value)
    const termChange = (event: React.ChangeEvent<any>) => setTermText(event.target.value)

    const onKeyDown = (event: React.KeyboardEvent<any>) => {
        if (event.key === "Enter") {
            doneButton()
        }
    }

    const doneButton = () => {
        if (nameText == "") {
            setError("No name set.")
        } else if (macros.map((x) => x.name).includes(nameText)) {
            setError("Macro already exists!")
        } else if (termText == "") {
            setError("No macro definition provided.")
        } else {
            try {
                let [term, _] = lexAndParse(termText, "", macros.filter((x) => x.term != undefined), nameText)
                dispatch(updateMacro([props.no, { name: nameText, termstring: termText, term: term, active: false }]))
            } catch (e) {
                setError(e._1)
            }
        }
    }

    let nameInput: any = null;

    useEffect(() => {
        nameInput.focus()
    }, [])

    return (<div className="active-macro macro">
        <Collapse isOpened={error != ""}>
            <div className="error">
                {error}
            </div>
        </Collapse>
        <div className="macro-field">
            <div className="macro-field-name">Name</div>
            <div className="macro-input-field"><input ref={(input) => { nameInput = input }} type="text" className="macro-text" onChange={nameChange} onKeyDown={onKeyDown} defaultValue={props.macro.name} /></div>
            <div><img src={Tick} className="icon right clickable" onClick={doneButton} /></div>
        </div>
        <div className="macro-field">
            <div className="macro-field-name">Term</div>
            <div className="macro-input-field"><input type="text" className="macro-text" onChange={termChange} onKeyDown={onKeyDown} defaultValue={props.macro.termstring} /></div>
        </div>
    </div >)
}