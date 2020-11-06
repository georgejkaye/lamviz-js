import React, { useState, KeyboardEvent, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { betaRedexes, prettyPrint, printHTML, prettyPrintDeBruijn } from "../bs/Lambda.bs";
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
    const context = useSelector((state: RootState) => state.currentState).currentContext
    const screenDimensions = useSelector((state: RootState) => state.currentState).screenDimensions
    const graphDimensions = useSelector((state: RootState) => state.currentState).graphDimensions

    const [visualiserMode, setVisualiserMode] = useState(VisualiserMode.TERM)

    return (
        <div className="stage" >
            <div className="top-bar">
                {term == undefined ? "" : parse(printHTML(term, false, context))}
            </div>
            <div className="subtop-bar">
                {term == undefined ? "" : parse(printHTML(term, true, context))}
            </div>
            <div className="main-stage" style={{ height: String(graphDimensions.height) + "px" }}>
                <div className="main-graph">
                    <Graph dimensions={graphDimensions} graph={{ term: term, context: context }} zoom />
                </div>
                <Facts />
            </div>
            <div className="bottom-bar">Reduction graph</div>
            <div className="reductions"></div>

        </div >)
}