import React, { useState, KeyboardEvent, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { prettyPrint } from "../../bs/Lambda.bs";
import { RootState } from "./reducers"

interface StageProps {
    sidebarWidth: number,
}

export default function Stage(props: StageProps) {

    const term = useSelector((state: RootState) => state.currentState).currentTerm

    return (
        <div className="stage">
            <div className="top-bar">
                {term == undefined ? "" : prettyPrint(term)}
            </div>
            <div className="graph"></div>
        </div>)
}