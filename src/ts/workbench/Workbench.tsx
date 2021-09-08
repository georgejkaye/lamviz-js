import React, { useState, useEffect } from "react"

import parse from "html-react-parser"

import { useAppDispatch, useAppSelector } from "../redux/hooks"
import { topBarHeight, subBarHeight, newError, newTerm, newContext } from "./workbenchSlice"

import Graph from "./Graph"
import Facts from "./Facts"

import { prettyPrintContext, printHTML, printHTMLAndContext } from "../../bs/Lambda.bs";


enum VisualiserMode {
    TERM, REDUCTIONS
}

export default function Visualiser() {

    const term = useAppSelector((state) => state.workbench).currentTerm
    const context = useAppSelector((state) => state.workbench).currentContext

    const redraw = useAppSelector((state) => state.workbench).redraw

    const graphDimensions = useAppSelector((state) => state.workbench).graphDimensions

    const nodeLabels = useAppSelector((state) => state.workbench).nodeLabels
    const edgeLabels = useAppSelector((state) => state.workbench).edgeLabels

    const redexToHighlight = useAppSelector((state) => state.workbench).redexToHighlight

    const macrosOn = useAppSelector((state) => state.macros).macrosOn

    let dispatch = useAppDispatch()

    interface InputBoxProps {
        submit: (text: string) => void
        print: (obj: any) => string
        basis: any
    }

    function ToggleBox(props: InputBoxProps) {
        let [editing, setEditing] = useState(false)
        const toggleBox = () => setEditing(!editing)
        let [text, setText] = useState(props.print(props.basis))
        let [tempText, setTempText] = useState("")

        useEffect(() => {
            setText(props.print(props.basis))
        }, [props.basis])

        const onChange = (e: React.ChangeEvent<any>) => {
            setTempText(e.target.value)
        }
        const onKeyDown = (e: React.KeyboardEvent<any>) => {
            switch (e.key) {
                case "Enter":
                    try {
                        props.submit(tempText)
                    } catch (e: any) {
                        dispatch(newError(e._1))
                    }
                    break
                case "Escape":
                    toggleBox()
                    setTempText(text)
                    break
            }
        }
        const handleClick = (e: React.MouseEvent<any>) => {
            toggleBox()
        }

        console.log(text)
        return (
            <div className="">{
                editing
                    ? <input autoFocus className="toggle-box toggle-box-edit" size={2 + tempText.length} onChange={onChange} onKeyDown={onKeyDown} value={tempText} />
                    : <span className="toggle-box toggle-box-display" onClick={handleClick}>{parse(text)}</span>
            }
            </div>
        )
    }

    const Bar = () =>
        <div className="bar" style={{ height: topBarHeight, maxWidth: graphDimensions.width }}>
            <ToggleBox submit={(text) => dispatch(newContext(text))} print={(context) => prettyPrintContext(context)} basis={context} />
            <span>⇒</span>
            <ToggleBox submit={(text) => dispatch(newTerm(text))} print={(term) => printHTML(term, context, false, true)} basis={term} />
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