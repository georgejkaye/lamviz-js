import React, { useState, KeyboardEvent, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { prettyPrint, prettyPrintDeBruijn } from "../../bs/Lambda.bs";
import { RootState } from "./reducers"
import { Collapse } from "react-collapse"

interface StageProps {
    sidebarWidth: number,
}

enum VisualiserMode {
    TERM, REDUCTIONS
}

export default function Stage(props: StageProps) {

    const term = useSelector((state: RootState) => state.currentState).currentTerm
    const context = useSelector((state: RootState) => state.currentState).currentContext

    const [factsVisible, setFactsVisible] = useState(false)
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
                <div className="graph" style={{ height: (factsVisible ? "calc(100vh - 150px)" : "calc(100vh - 160px)") }}></div>
            </Collapse>
            <div className="bottom-bar">Reduction graph</div>
            <Collapse isOpened={visualiserMode == VisualiserMode.REDUCTIONS}>
                <div className="reductions"></div>
            </Collapse>
        </div >)
}