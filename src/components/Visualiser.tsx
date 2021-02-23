import React, { useState, KeyboardEvent, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { betaRedexes, prettyPrint, printHTML, printHTMLAndContext, prettyPrintDeBruijn } from "../bs/Lambda.bs";
import { RootState } from "./../reducers"
import { Collapse } from "react-collapse"
import parse from "html-react-parser"
import Facts from "./Facts";
import { Term, Context } from "../bs/Lambda.bs"
import Graph from "./Graph"

enum VisualiserMode {
    TERM, REDUCTIONS
}

export default function Visualiser() {

    const term = useSelector((state: RootState) => state.currentState).currentTerm
    const redraw = useSelector((state: RootState) => state.currentState).redraw
    const context = useSelector((state: RootState) => state.currentState).currentContext
    const screenDimensions = useSelector((state: RootState) => state.currentState).screenDimensions
    const graphDimensions = useSelector((state: RootState) => state.currentState).graphDimensions

    const nodeLabels = useSelector((state: RootState) => state.currentState).nodeLabels
    const edgeLabels = useSelector((state: RootState) => state.currentState).edgeLabels
    const macrosOn = useSelector((state: RootState) => state.currentState).macrosOn
    const redexToHighlight = useSelector((state: RootState) => state.currentState).redexToHighlight

    const [visualiserMode, setVisualiserMode] = useState(VisualiserMode.TERM)

    useEffect(() => {

    }, [nodeLabels])

    useEffect(() => {

    }, [edgeLabels])

    return (
        <div className="stage" >
            <div className="top-bar">
                {term == undefined ? "" : parse(printHTMLAndContext(term, context, false, macrosOn))}
            </div>
            <div className="subtop-bar">
                {term == undefined ? "" : parse(printHTML(term, context, true, false))}
            </div>
            <div className="main-stage" style={{ height: String(graphDimensions.height) + "px" }}>
                <div className="main-graph">
                    <Graph dimensions={graphDimensions} redraw={redraw} graph={{ term: term, context: context }} nodeLabels={nodeLabels} edgeLabels={edgeLabels} zoom pan highlightedRedex={redexToHighlight} margin={50} />
                </div>
                <Facts />
            </div>
            <div className="bottom-bar">Reduction graph</div>
            <div className="reductions"></div>

        </div>)
}