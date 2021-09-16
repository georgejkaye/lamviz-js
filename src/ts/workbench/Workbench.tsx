import React, { useState, useEffect } from "react"

import parse from "html-react-parser"
import Icon from "@mdi/react"
import { mdiChevronDoubleUp, mdiChevronDoubleDown } from "@mdi/js"

import { useAppDispatch, useAppSelector } from "../redux/hooks"
import { topBarHeight, subBarHeight, newError, newTerm, newContext, setActiveBox, toggleNodeLabels, toggleEdgeLabels, bottomBarHeight, highlightRedex, unhighlightRedex } from "./workbenchSlice"

import Graph from "./Graph"

import { betaRedexes, bridgeless, bridges, crossings, linear, planar, prettyPrintContext, printHTML, printRedexesArray, Term } from "../../bs/Lambda.bs";
import { Spacer } from "../App"

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
    const settingsOut = useAppSelector((state) => state.sidebar).settingsOut

    let dispatch = useAppDispatch()
    interface InputBoxProps {
        id: number
        submit: (text: string) => void
        print: (obj: any) => string
        basis: any
    }

    function InputBox(props: InputBoxProps) {

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
        }, [activeBox, props.id])

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
                    ? <input autoFocus className="input-box input-box-edit" style={{ width: (tempText.length / 1.66) + "em" }} onChange={onChange} onBlur={onBlur} onKeyDown={onKeyDown} value={tempText} />
                    : <span className="input-box input-box-display" onMouseDown={onClick}>{parse(text)}</span>
            }
            </div>
        )
    }
    interface ToggleBoxProps {
        property: string
        switch: boolean
        onClick: (e: React.MouseEvent<any>) => void
    }
    function ToggleBox(props: ToggleBoxProps) {
        let toggled = props.switch ? "on" : "off"
        return (<div className={"card toggle " + toggled} onClick={props.onClick}>{props.property} {toggled}</div >)
    }
    interface PredicateBoxProps {
        property: string
        pred: (t: Term) => boolean
    }
    function PredicateBox(props: PredicateBoxProps) {
        return (
            <div>
                {props.pred(term) ? (< div className="card predicate-box on" > {props.property}</div >) : ""}
            </div >)
    }
    interface CounterBoxProps {
        property: string
        count: (t: Term) => number
    }
    function CounterBox(props: CounterBoxProps) {
        let count = props.count(term)
        return (
            <div className={"card counter-box " + (count === 0 ? "off" : "on")} > {props.property} | {count} </div >
        )
    }

    const TopBar = () => {
        return (
            <div className="overlay-bar top-bar">
                <ToggleBox property="Node labels" onClick={(e) => dispatch(toggleNodeLabels())} switch={nodeLabels} />
                <ToggleBox property="Edge labels" onClick={(e) => dispatch(toggleEdgeLabels())} switch={edgeLabels} />
            </div >
        )
    }
    const TopRightBar = () => {
        let [visible, setVisible] = useState(true)
        const toggleVisible = () => setVisible(!visible)
        return (
            <div className="overlay-bar right-bar right-top-bar">
                {visible ?
                    <div className="right-bar-content">
                        <CounterBox property="Redexes" count={betaRedexes} />
                        <CounterBox property="Crossings" count={crossings} />
                        <CounterBox property="Bridges" count={bridges} />
                        <PredicateBox property="Planar" pred={planar} />
                        <PredicateBox property="Linear" pred={linear} />
                        <PredicateBox property="Bridgeless" pred={bridgeless} />
                    </div> : ""}
                <div className="clickable icon" onClick={(e) => toggleVisible()}>
                    <Icon path={visible ? mdiChevronDoubleUp : mdiChevronDoubleDown} />
                </div>
            </div >)
    }
    interface RedexBoxProps {
        id: number
        redex: string
    }
    const RedexBox = (props: RedexBoxProps) => {

        const onMouseEnter = (e: React.MouseEvent<any>) => {
            dispatch(highlightRedex(props.id))
        }
        const onMouseLeave = (e: React.MouseEvent<any>) => {
            console.log("hellO!")
            dispatch(unhighlightRedex())
        }

        return (<div className="card-padding" onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
            <div className="card redex on" >{props.redex}</div>
        </div>)
    }
    const BotRightBar = () => {
        let [visible, setVisible] = useState(true)
        const toggleVisible = () => setVisible(!visible)

        let redexes = printRedexesArray(term, context)

        return (
            <div className="overlay-bar right-bar right-bottom-bar">
                {visible ?
                    <div className="right-bar-content">{redexes.map((r, i) => <RedexBox key={i} id={i} redex={r} />)}</div> : ""
                }
                <div className="clickable icon" onClick={(e) => toggleVisible()}>
                    <Icon path={visible ? mdiChevronDoubleDown : mdiChevronDoubleUp} />
                </div>
            </div>
        )
    }

    const BottomBar = () =>
        <div className="overlay-bar bottom-bar" style={{ height: bottomBarHeight, maxWidth: graphDimensions.width }}>
            <InputBox id={0} submit={(text) => dispatch(newContext(text))} print={(context) => prettyPrintContext(context)} basis={context} />
            <span>⇒</span>
            <InputBox id={1} submit={(text) => dispatch(newTerm(text))} print={(term) => printHTML(term, context, false, true)} basis={term} />
            {error !== "" ? <div className="error">{error}</div> : ""}
        </div >

    return (
        <div className="stage" >
            <div className="main-stage" style={{ height: String(graphDimensions.height) + "px" }}>
                <div className="main-graph">
                    <Graph dimensions={graphDimensions} redraw={redraw} graph={{ term: term, context: context }} nodeLabels={nodeLabels} edgeLabels={edgeLabels} zoom pan highlightedRedex={redexToHighlight} margin={50} interactive />
                </div>
            </div>
            <TopBar />
            <BottomBar />
            <TopRightBar />
            <BotRightBar />
        </div>)
}