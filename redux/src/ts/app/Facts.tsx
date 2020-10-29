
import React, { useState, KeyboardEvent, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { betaRedexes, prettyPrint, prettyPrintDeBruijn, variables, uniqueVariables, freeVariables, applications, abstractions, subterms, crossings } from "../../bs/Lambda.bs";
import { RootState } from "./reducers"
import { Collapse } from "react-collapse"

enum StatType {
    VARIABLES,
    FREE_VARIABLES,
    UNIQUE_VARIABLES,
    CROSSINGS,
    BETA_REDEXES,
    BRIDGES,
    SUBTERMS,
    APPLICATIONS,
    ABSTRACTIONS
}

interface StatProps {
    stat: StatType
    value: number
}

let sVariables = "\uD835\uDC99"
let sFreeVariables = "\uD835\uDC1A"
let sUniqueVariables = "\uD835\uDC99\u2757"
let sCrossings = "\u00d7"
let sBetaRedexes = "\uD835\uDEFD"
let sBridges = "\u25e0"
let sSubterms = "\u2286"
let sAbstractions = "\uD835\uDF06"
let sApplications = "\u0040"

function StatBox(props: StatProps) {

    let symbol = ""

    switch (props.stat) {
        case StatType.VARIABLES:
            symbol = sVariables
            break
        case StatType.FREE_VARIABLES:
            symbol = sFreeVariables
            break
        case StatType.UNIQUE_VARIABLES:
            symbol = sUniqueVariables
            break
        case StatType.CROSSINGS:
            symbol = sCrossings
            break
        case StatType.BETA_REDEXES:
            symbol = sBetaRedexes
            break
        case StatType.BRIDGES:
            symbol = sBridges
            break
        case StatType.SUBTERMS:
            symbol = sSubterms
            break
        case StatType.ABSTRACTIONS:
            symbol = sAbstractions
            break
        case StatType.APPLICATIONS:
            symbol = sApplications
            break
    }

    return (
        <div className="stat">
            <div className="symbol">{symbol}</div>
            <div className="value">{props.value}</div>
        </div>
    )

}

export default function Facts() {

    const term = useSelector((state: RootState) => state.currentState).currentTerm

    return (term == undefined ? <div className="facts"></div> :
        <div className="facts">
            <StatBox stat={StatType.SUBTERMS} value={subterms(term)} />
            <StatBox stat={StatType.VARIABLES} value={variables(term)} />
            <StatBox stat={StatType.UNIQUE_VARIABLES} value={uniqueVariables(term)} />
            <StatBox stat={StatType.FREE_VARIABLES} value={freeVariables(term)} />
            <StatBox stat={StatType.ABSTRACTIONS} value={abstractions(term)} />
            <StatBox stat={StatType.APPLICATIONS} value={applications(term)} />
            <StatBox stat={StatType.CROSSINGS} value={crossings(term)} />
            <StatBox stat={StatType.BETA_REDEXES} value={betaRedexes(term)} />
            <StatBox stat={StatType.BRIDGES} value={betaRedexes(term)} />

        </div>

    )
}