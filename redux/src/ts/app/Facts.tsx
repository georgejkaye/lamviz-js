
import React, { useState, KeyboardEvent, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { betaRedexes, prettyPrint, prettyPrintDeBruijn, variables, uniqueVariables, freeVariables, applications, abstractions, subterms, crossings, bridges, linear, planar, closed, bridgeless, printRedexesArray } from "../../bs/Lambda.bs";
import { RootState } from "./reducers"
import { Collapse } from "react-collapse"
import { Term } from "../../bs/Lambda.bs"

import Up from "../../svgs/up-chevron.svg"
import Down from "../../svgs/down-chevron.svg"

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

function toggleClassOnElement(className: string, on: boolean, newClass: string) {
    let elems = document.getElementsByClassName(className)
    let re = /class="(.+?)"/g

    for (var i = 0; i < elems.length; i++) {

        on ? elems[i].classList.add(newClass) : elems[i].classList.remove(newClass)

        var subs = elems[i].innerHTML;
        var matches = subs.match(re);

        for (var j = 0; j < matches.length; j++) {
            var elems2 = document.getElementsByClassName(matches[j].substring(7, matches[j].length - 1));

            for (var k = 0; k < elems2.length; k++) {
                on ? elems2[k].classList.add(newClass) : elems2[k].classList.remove(newClass)
            }
        }
    }
}

function highlightRedex(i: number) {
    toggleClassOnElement("beta-" + i, true, "highlighted-redex")
}

function unhighlightRedex(i: number) {
    toggleClassOnElement("beta-" + i, false, "highlighted-redex")
}

export default function Facts() {

    const term = useSelector((state: RootState) => state.currentState).currentTerm
    const ctx = useSelector((state: RootState) => state.currentState).currentContext

    const [betasOpen, setBetasOpen] = useState(false)

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
                <StatBox term={term} stat={StatType.BRIDGES} />
            </div>
            <div className="betas-header" onClick={(e) => setBetasOpen(!betasOpen)}>
                <div className="expand-arrow"><img src={betasOpen ? Up : Down} className="icon" alt={betasOpen ? "\u2191" : "\u2193"} /></div>
                <div className="beta-text fact-text">Beta redexes</div>
                <div className="fact-value">{String(betaRedexes(term))}</div>
            </div>
            <Collapse isOpened={betasOpen}>
                <div className="redexes">
                    {printRedexesArray(term, ctx).map((r, i) => <div className="redex" onMouseOver={(e) => highlightRedex(i)} onMouseLeave={(e) => unhighlightRedex(i)}>{r}</div>)}
                </div>
            </Collapse>

        </div >

    )
}