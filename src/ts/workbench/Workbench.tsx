import React, { useState, useEffect } from "react"

import parse from "html-react-parser"

import { useAppDispatch, useAppSelector } from "../redux/hooks"
import { topBarHeight, subBarHeight, newError, newTerm, newContext, setActiveBox } from "./workbenchSlice"

import Graph from "./Graph"

import { prettyPrintContext, printHTML } from "../../bs/Lambda.bs";

export default function Visualiser() {

    const term = useAppSelector((state) => state.workbench).currentTerm
    const context = useAppSelector((state) => state.workbench).currentContext

    const redraw = useAppSelector((state) => state.workbench).redraw

    const graphDimensions = useAppSelector((state) => state.workbench).graphDimensions

    const nodeLabels = useAppSelector((state) => state.workbench).nodeLabels
    const edgeLabels = useAppSelector((state) => state.workbench).edgeLabels

    const redexToHighlight = useAppSelector((state) => state.workbench).redexToHighlight
    const error = useAppSelector((state) => state.workbench).error
    const macrosOn = useAppSelector((state) => state.macros).macrosOn

    let dispatch = useAppDispatch()
    interface InputBoxProps {
        id: number
        submit: (text: string) => void
        print: (obj: any) => string
        basis: any
    }

    function ToggleBox(props: InputBoxProps) {

        let print = props.print
        let basis = props.basis

        let [editing, setEditing] = useState(false)
        let [text, setText] = useState(props.print(props.basis))
        let [tempText, setTempText] = useState("")

        const activeBox = useAppSelector((state) => state.workbench).activeBox

        useEffect(() => {
            setText(print(basis))
        }, [basis, print])

        useEffect(() => {
            if (props.id === activeBox) {
                setEditing(true)
            } else {
                setEditing(false)
            }
        }, [activeBox])

        const onChange = (e: React.ChangeEvent<any>) => {
            setTempText(e.target.value)
        }
        const deactivateBox = () => {
            setTempText("")
            dispatch(setActiveBox(-1))
        }
        const onBlur = (e: React.FocusEvent<any>) => {
            deactivateBox()
        }
        const onKeyDown = (e: React.KeyboardEvent<any>) => {
            switch (e.key) {
                case "Enter":
                    try {
                        props.submit(tempText)
                    } catch (e: any) {
                        dispatch(newError(e._1))
                    }
                    deactivateBox()
                    break
                case "Escape":
                    deactivateBox()
                    break
            }
        }
        const onClick = (e: React.MouseEvent<any>) => {
            dispatch(setActiveBox(props.id))
            dispatch(newError(""))
            e.stopPropagation()
        }
        return (
            <div className="">{
                editing
                    ? <input autoFocus className="toggle-box toggle-box-edit" style={{ width: (tempText.length / 1.66) + "em" }} onChange={onChange} onBlur={onBlur} onKeyDown={onKeyDown} value={tempText} />
                    : <span className="toggle-box toggle-box-display" onMouseDown={onClick}>{parse(text)}</span>
            }
            </div>
        )
    }

    const Bar = () =>
        <div className="bar" style={{ height: topBarHeight, maxWidth: graphDimensions.width }}>
            <ToggleBox id={0} submit={(text) => dispatch(newContext(text))} print={(context) => prettyPrintContext(context)} basis={context} />
            <span>⇒</span>
            <ToggleBox id={1} submit={(text) => dispatch(newTerm(text))} print={(term) => printHTML(term, context, false, true)} basis={term} />
            {error != "" ? <div className="error">{error}</div> : ""}
        </div >

    return (
        <div className="stage" >
            <div className="main-stage" style={{ height: String(graphDimensions.height) + "px" }}>
                <div className="main-graph">
                    <Graph dimensions={graphDimensions} redraw={redraw} graph={{ term: term, context: context }} nodeLabels={nodeLabels} edgeLabels={edgeLabels} zoom pan highlightedRedex={redexToHighlight} margin={50} interactive />
                </div>
            </div>
            <Bar />
        </div>)
}