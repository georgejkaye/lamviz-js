
import React, { useState, KeyboardEvent, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { betaRedexes, prettyPrint, prettyPrintDeBruijn, variables, uniqueVariables, freeVariables, applications, abstractions, subterms, crossings, bridges, linear, planar, closed, bridgeless } from "../../bs/Lambda.bs";
import { RootState } from "./reducers"
import { Collapse } from "react-collapse"
import { Term } from "../../bs/Lambda.bs"

enum StatType {
    VARIABLES,
    FREE_VARIABLES,
    UNIQUE_VARIABLES,
    CROSSINGS,
    BETA_REDEXES,
    BRIDGES,
    SUBTERMS,
    APPLICATIONS,
    ABSTRACTIONS,
    LINEAR,
    PLANAR
}

interface StatProps {
    term: Term
    stat: StatType
}


function StatBox(props: StatProps) {

    let text = ""
    let value = ""

    switch (props.stat) {
        case StatType.VARIABLES:
            text = "Variables"
            value = String(variables(props.term))
            break
        case StatType.FREE_VARIABLES:
            text = "Free variables"
            value = String(freeVariables(props.term))
            break
        case StatType.UNIQUE_VARIABLES:
            text = "Unique variables"
            value = String(uniqueVariables(props.term))
            break
        case StatType.CROSSINGS:
            text = "Crossings"
            value = String(crossings(props.term))
            break
        case StatType.BETA_REDEXES:
            text = "Beta redexes"
            value = String(betaRedexes(props.term))
            break
        case StatType.BRIDGES:
            text = "Bridges"
            value = String(bridges(props.term))
            break
        case StatType.SUBTERMS:
            text = "Subterms"
            value = String(subterms(props.term))
            break
        case StatType.ABSTRACTIONS:
            text = "Abstractions"
            value = String(abstractions(props.term))
            break
        case StatType.APPLICATIONS:
            text = "Applications"
            value = String(applications(props.term))
            break
    }

    return (
        <div className="fact">
            <div className="fact-text">{text}</div>
            <div className="fact-value">{value}</div>
        </div>
    )

}

export default function Facts() {

    const term = useSelector((state: RootState) => state.currentState).currentTerm

    return (term == undefined ? <div className="facts"></div> :
        <div className="facts">
            <div className="properties">
                <div className={"property " + (linear(term) ? "yes" : "no")}>Linear </div>
                <div className={"property " + (planar(term) ? "yes" : "no")}>Planar </div>
            </div>
            <div className="properties">
                <div className={"property " + (closed(term) ? "yes" : "no")}>Closed </div>
                <div className={"property " + (bridgeless(term) ? "yes" : "no")}>Bridgeless </div>
            </div>
            <div className="stats">
                <StatBox term={term} stat={StatType.SUBTERMS} />
                <StatBox term={term} stat={StatType.VARIABLES} />
                <StatBox term={term} stat={StatType.UNIQUE_VARIABLES} />
                <StatBox term={term} stat={StatType.FREE_VARIABLES} />
                <StatBox term={term} stat={StatType.ABSTRACTIONS} />
                <StatBox term={term} stat={StatType.APPLICATIONS} />
                <StatBox term={term} stat={StatType.CROSSINGS} />
                <StatBox term={term} stat={StatType.BETA_REDEXES} />
                <StatBox term={term} stat={StatType.BRIDGES} />
            </div>
        </div>

    )
}