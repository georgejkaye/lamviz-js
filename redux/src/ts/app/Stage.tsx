import React, { useState, KeyboardEvent, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { betaRedexes, prettyPrint, prettyPrintDeBruijn } from "../../bs/Lambda.bs";
import { RootState } from "./reducers"
import { Collapse } from "react-collapse"
import Facts from "./Facts";
import Graph from "./Graph"

interface StageProps {
    barWidth: number,
    barHeight: number
}

enum VisualiserMode {
    TERM, REDUCTIONS
}


export default function Stage(props: StageProps) {

    const term = useSelector((state: RootState) => state.currentState).currentTerm
    const context = useSelector((state: RootState) => state.currentState).currentContext

    const [visualiserMode, setVisualiserMode] = useState(VisualiserMode.TERM)

    return (
        <div className="stage">
            <div className="top-bar">
                {term == undefined ? "" : prettyPrint(term, context)}
            </div>
            <Collapse isOpened={visualiserMode == VisualiserMode.TERM}>
                < Collapse isOpened={true}>
                    <div className="subtop-bar">
                        {term == undefined ? "" : prettyPrintDeBruijn(term)}
                    </div>
                </Collapse >
                <div className="main-stage" style={{ height: "calc(100vh - " + String(props.barHeight) + "px)" }}>
                    <Graph barWidth={props.barWidth} barHeight={props.barHeight} />
                    <Facts />
                </div>
            </Collapse>
            <div className="bottom-bar">Reduction graph</div>
            <Collapse isOpened={visualiserMode == VisualiserMode.REDUCTIONS}>
                <div className="reductions"></div>
            </Collapse>
        </div >)
}