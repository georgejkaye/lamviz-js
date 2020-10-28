import React, { useState, KeyboardEvent, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { betaRedexes, prettyPrint, prettyPrintDeBruijn } from "../../bs/Lambda.bs";
import { RootState } from "./reducers"
import { Collapse } from "react-collapse"

interface StageProps {
    sidebarWidth: number,
}

enum VisualiserMode {
    TERM, REDUCTIONS
}

enum StatType {
    VARIABLES,
    FREE_VARIABLES,
    UNIQUE_VARIABLES,
    CROSSINGS,
    BETA_REDUCTIONS,
    BRIDGES,
    SUBTERMS,
    APPLICATIONS,
    ABSTRACTIONS
}

interface StatProps {
    stat: StatType
    value: number
}

function StatBox(props: StatProps) {

    let symbol = ""

    switch (props.stat) {
        case StatType.VARIABLES:
            symbol = "\uD835\uDC99"
            break
        case StatType.FREE_VARIABLES:
            symbol = "\uD835\uDC1A"
            break
        case StatType.UNIQUE_VARIABLES:
            symbol = "\uD835\uDC99\u2757"
            break
        case StatType.CROSSINGS:
            symbol = "\u00d7"
            break
        case StatType.BETA_REDUCTIONS:
            symbol = "\uD835\uDEFD"
            break
        case StatType.BRIDGES:
            symbol = "\u25e0"
            break
        case StatType.SUBTERMS:
            symbol = "\u2286"
            break
        case StatType.ABSTRACTIONS:
            symbol = "\uD835\uDF06"
            break
        case StatType.APPLICATIONS:
            symbol = "\u0040"
            break
    }

    return (
        <div className="stat">
            <div className="symbol">{symbol}</div>
            <div className="value">{props.value}</div>
        </div>
    )

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
                    </div>
                </Collapse >
                <div className="graph" style={{ height: (factsVisible ? "calc(100vh - 150px)" : "calc(100vh - 160px)") }}>{term == undefined ? "" : betaRedexes(term)}</div>
            </Collapse>
            <div className="bottom-bar">Reduction graph</div>
            <Collapse isOpened={visualiserMode == VisualiserMode.REDUCTIONS}>
                <div className="reductions"></div>
            </Collapse>
        </div >)
}