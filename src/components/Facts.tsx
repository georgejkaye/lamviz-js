
import React, { useState, KeyboardEvent, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Collapse } from "react-collapse"
import ReactTooltip from "react-tooltip"

import { Term } from "../bs/Lambda.bs"
import { betaRedexes, variables, uniqueVariables, freeVariables, applications, abstractions, subterms, crossings, bridges, linear, planar, closed, bridgeless, printRedexesArray } from "../bs/Lambda.bs";
import { RootState } from "./../reducers"
import { normalise } from "../bs/Evaluator.bs";
import { updateTerm, backTerm, toggleFactsBar, resetTerm, downloadSvg, performReduction, highlightRedex, unhighlightRedex } from "./../reducers/slice";

import Up from "../data/svgs/up-chevron.svg"
import Down from "../data/svgs/down-chevron.svg"
import Left from "../data/svgs/left-chevron.svg"
import Right from "../data/svgs/right-chevron.svg"
import Back from "../data/svgs/back.svg"
import Refresh from "../data/svgs/refresh.svg"

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

export default function Facts() {

    const term = useSelector((state: RootState) => state.currentState).currentTerm
    const ctx = useSelector((state: RootState) => state.currentState).currentContext
    const factsOpen = useSelector((state: RootState) => state.currentState).factsOpen
    const termHistory = useSelector((state: RootState) => state.currentState).termHistory

    const [betasOpen, setBetasOpen] = useState(false)

    let dispatch = useDispatch()

    const normaliseButton = (e: React.MouseEvent<any>) => dispatch(updateTerm(normalise(term)))
    const resetButton = (e: React.MouseEvent<any>) => dispatch(resetTerm())
    const svgButton = (e: React.MouseEvent<any>) => dispatch(downloadSvg())
    const backButton = (e: React.MouseEvent<any>) => dispatch(backTerm())

    const toggleBar = () => {
        dispatch(toggleFactsBar(!factsOpen))
    }

    const clickRedex = (i: number) => {
        dispatch(performReduction(i))
    }

    const mouseoverRedex = (i: number) => {
        toggleClassOnElement("beta-" + i, true, "highlighted-redex")
        dispatch(highlightRedex(i))
    }

    const mouseleaveRedex = (i: number) => {
        toggleClassOnElement("beta-" + i, false, "highlighted-redex")
        dispatch(unhighlightRedex())
    }

    return (
        <div className="facts-panel">
            <div className="toggle-bar" onClick={(e) => toggleBar()}>
                <div><img src={factsOpen ? Right : Left} className={"lr-icon"} alt={factsOpen ? "\u2b9e" : "\u2b9c"} /></div>
            </div>
            {(term == undefined
                ? <div className={factsOpen ? "facts" : "facts closed"}></div>
                : <div className={factsOpen ? "facts" : "facts closed"}>
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
                        <div className="expand-arrow"><img src={betasOpen ? Up : Down} className={"icon" + (betaRedexes(term) == 0 ? " hidden" : "")} alt={betasOpen ? "\u2191" : "\u2193"} /></div>
                        <div className="beta-text fact-text">Beta redexes</div>
                        <div className="fact-value">{String(betaRedexes(term))}</div>
                    </div>
                    <Collapse isOpened={betasOpen}>
                        <div className="redexes">
                            {printRedexesArray(term, ctx).map((r, i) => <div className="redex" onMouseOver={(e) => mouseoverRedex(i)} onMouseLeave={(e) => mouseleaveRedex(i)} onClick={(e) => clickRedex(i)}>{r}</div>)}
                        </div>
                    </Collapse>
                    <div className="normalisation">
                        <div className="button-row">
                            <button type="button" className="left flex-button" onClick={normaliseButton} disabled={betaRedexes(term) == 0 ? true : false}>Normalise</button>
                            <button data-tip="back-tooltip" data-for="back" type="button" className="flex-button icon-button" onClick={backButton} disabled={termHistory.length == 0 ? true : false}><img src={Back} className={"icon"} alt={"Back"} /></button>
                            <ReactTooltip id="back" type="dark" place="left" effect="float">Back</ReactTooltip>

                            <button data-tip="reset-tooltip" data-for="reset" type="button" className="right flex-button icon-button" onClick={resetButton}><img src={Refresh} className={"icon"} alt={"Reset"} /></button>
                            <ReactTooltip id="reset" type="dark" place="left" effect="float">Reset</ReactTooltip>
                        </div>
                        <div className="button-row">
                            <button type="button" className="left flex-button" disabled={betaRedexes(term) == 0 ? true : false}>Reduce</button>
                            <select name="strategy" id="strategy" className="right flex-button" disabled={betaRedexes(term) == 0 ? true : false}>
                                <option value="outermost">Outermost</option>
                                <option value="innermost">Innermost leftmost</option>"
                                <option value="innermost">Innermost rightmost</option>"
                    <option value="random">Random</option>
                            </select>
                        </div>
                    </div>
                    <div className="button-row">
                        <button type="button" className="left right flex-button" onClick={svgButton}>Export map</button>
                    </div>
                </div>)
            }
        </div >
    )
}