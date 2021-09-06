import React, { useEffect, useState } from "react"
import { useDispatch } from "react-redux"

import { Collapse } from "react-collapse"

import { useAppSelector, useAppDispatch } from "../redux/hooks"
import { newTerm } from "./workbenchSlice"
import { updateMacro, toggleMacro, removeMacro } from "./../sidebar/macroSlice"

import { Term, prettyPrint, emptyContext } from "../../bs/Lambda.bs"
import { lexAndParse } from "../../bs/Parser.bs"

import Tick from "../../data/svgs/tick.svg"
import Cross from "../../data/svgs/close.svg"
import Pencil from "../../data/svgs/pencil.svg"

export interface MacroDetails {
    name: string
    termstring: string
    term: Term
    active: boolean
}

interface MacroProps {
    macro: MacroDetails,
    no: number
}

export function Macro(props: MacroProps) {

    let dispatch = useAppDispatch()

    const clickMacro = () => {
        dispatch(newTerm([props.macro.termstring, "", props.macro.term, emptyContext]))
    }

    const removeMacroButton = (e: React.MouseEvent<any>) => { dispatch(removeMacro(props.no)); e.stopPropagation() }
    const editMacroButton = (e: React.MouseEvent<any>) => { dispatch(toggleMacro(props.no)); e.stopPropagation() }

    return (
        <div key={props.no} className="macro ready-macro" onClick={clickMacro} >
            <div>
                <img alt="Remove this macro" src={Cross} className="icon clickable padded" onClick={removeMacroButton} />
            </div>
            <div className="ready-macro-main">
                <div className="macro-title">{props.macro.name}</div>
                <div>{prettyPrint(props.macro.term, emptyContext, true, false)}</div>
            </div>
            <div><img alt="Edit this macro" src={Pencil} className="icon clickable padded" onClick={editMacroButton} /></div>
        </div>
    )
}

const nameRegexp = new RegExp("^[A-Za-z]*$")

export function ActiveMacro(props: MacroProps) {

    let dispatch = useDispatch()
    const macros = useAppSelector((state) => state.macros).macros

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

        let name = nameText.replace(" ", "")

        if (name === "") {
            setError("No name set.")
        } else if (termText === "") {
            setError("No macro definition provided.")
        } else if (!nameRegexp.test(name)) {
            setError("Names cannot include special characters.")
        } else {
            try {
                let [term, _] = lexAndParse(termText, "", macros.filter((x) => x.term !== undefined), name)

                dispatch(updateMacro([props.no, { name: name, termstring: termText, term: term, active: false }]))

                if (macros.map((x) => x.name).includes(name)) {
                    let i = macros.map((x) => x.name).indexOf(name)
                    dispatch(removeMacro(i))
                }

            } catch (e: any) {
                setError(e._1)
            }
        }
    }

    const cancelButton = () => {
        if (props.macro.term === undefined || props.macro.name === undefined) {
            dispatch(removeMacro(props.no))
        } else {
            dispatch(toggleMacro(props.no))
        }
    }

    let nameInput: any = null;

    useEffect(() => {
        nameInput.focus()
    }, [nameInput])

    return (<div key={props.no} className="active-macro macro">
        <Collapse isOpened={error !== ""}>
            <div className="error">
                {error}
            </div>
        </Collapse>
        <div className="macro-field">
            <div className="macro-field-name">Name</div>
            <div className="macro-input-field"><input ref={(input) => { nameInput = input }} type="text" className="macro-text" onChange={nameChange} onKeyDown={onKeyDown} defaultValue={props.macro.name} /></div>
            <div><img alt="Complete this macro" src={Tick} className="icon right clickable" onClick={doneButton} /></div>
        </div>
        <div className="macro-field">
            <div className="macro-field-name">Term</div>
            <div className="macro-input-field"><input type="text" className="macro-text" onChange={termChange} onKeyDown={onKeyDown} defaultValue={props.macro.termstring} /></div>
            <div><img alt="Cancel editing this macro" src={Cross} className="icon right clickable" onClick={cancelButton} /></div>
        </div>
    </div >)
}