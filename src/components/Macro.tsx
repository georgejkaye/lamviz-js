import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "./../reducers"
import { updateMacro } from "./../reducers/slice"
import { Term, Context, prettyPrint, printTermAndContext } from "../bs/Lambda.bs"

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
    contextstring: string
    context: Context
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
        <div className="macro">
            <div className="macro-title">{props.macro.name}</div>
            <div>{printTermAndContext(props.macro.term, props.macro.context)}</div>
        </div>
    )
}

export function ActiveMacro(props: MacroProps) {

    let dispatch = useDispatch()

    let [nameText, setNameText] = useState(props.macro.name)
    let [termText, setTermText] = useState(props.macro.termstring)
    let [ctxText, setCtxText] = useState(props.macro.contextstring)

    const nameChange = (event: React.ChangeEvent<any>) => setNameText(event.target.value)
    const termChange = (event: React.ChangeEvent<any>) => setTermText(event.target.value)
    const ctxChange = (event: React.ChangeEvent<any>) => setCtxText(event.target.value)

    const doneButton = () => {
        let [term, ctx] = lexAndParse(termText, ctxText)
        console.log(prettyPrint(term, ctx))
        dispatch(updateMacro([props.no, { name: nameText, termstring: termText, term: term, contextstring: ctxText, context: ctx, active: false }]))
    }

    return (<div className="active-macro macro">
        <div className="macro-field">
            <div className="macro-field-name">Name</div>
            <div className="macro-input-field"><input type="text" className="macrotext" onChange={nameChange} defaultValue={props.macro.name} /></div>
            <div><img src={Tick} className="icon right clickable" onClick={doneButton} /></div>
        </div>
        <div className="macro-field">
            <div className="macro-field-name">Term</div>
            <div className="macro-input-field"><input type="text" className="macro-text" onChange={termChange} defaultValue={props.macro.termstring} /></div>
        </div>
        <div className="macro-field">
            <div className="macro-field-name">Context</div>
            <div className="macro-input-field"><input type="text" className="macro-text" onChange={ctxChange} defaultValue={props.macro.contextstring} /></div>
        </div>
    </div >)
}