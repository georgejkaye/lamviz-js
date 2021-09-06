import { useState, useEffect } from "react"

import parse from "html-react-parser"

import { useAppSelector } from "../redux/hooks"
import { topBarHeight, subBarHeight } from "./workbenchSlice"

import Graph from "./Graph"
import Facts from "./Facts"

import { printHTML, printHTMLAndContext } from "../../bs/Lambda.bs";


enum VisualiserMode {
    TERM, REDUCTIONS
}

export default function Visualiser() {

    const term = useAppSelector((state) => state.workbench).currentTerm
    const redraw = useAppSelector((state) => state.workbench).redraw
    const context = useAppSelector((state) => state.workbench).currentContext
    const graphDimensions = useAppSelector((state) => state.workbench).graphDimensions

    const nodeLabels = useAppSelector((state) => state.workbench).nodeLabels
    const edgeLabels = useAppSelector((state) => state.workbench).edgeLabels

    const redexToHighlight = useAppSelector((state) => state.workbench).redexToHighlight

    const macrosOn = useAppSelector((state) => state.macros).macrosOn

    const [visualiserMode, setVisualiserMode] = useState(VisualiserMode.TERM)

    useEffect(() => {

    }, [nodeLabels])

    useEffect(() => {

    }, [edgeLabels])

    return (
        <div className="stage" >
            <div style={{ height: topBarHeight }} className="top-bar">
                {!term ? "" : parse(printHTMLAndContext(term, context, false, macrosOn))}
            </div>
            <div style={{ height: subBarHeight }} className="subtop-bar">
                {!term ? "" : parse(printHTML(term, context, true, false))}
            </div>
            <div className="main-stage" style={{ height: String(graphDimensions.height) + "px" }}>
                <div className="main-graph">
                    <Graph dimensions={graphDimensions} redraw={redraw} graph={{ term: term, context: context }} nodeLabels={nodeLabels} edgeLabels={edgeLabels} zoom pan highlightedRedex={redexToHighlight} margin={50} interactive />
                </div>
            </div>

        </div>)
}