import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "./app/reducers"
import { Mode } from "./app/reducers/slice";
import Sidebar from "./app/Sidebar"
import Stage from "./app/Visualiser"

let barWidth: number = 750
let barHeight: number = 150

export default function App() {

    const mode = useSelector((state: RootState) => state.currentState).mode

    return (
        <div className="window">
            <div className="content">
                <Sidebar />
                {mode == Mode.VISUALISER ? <Stage barWidth={barWidth} barHeight={barHeight} /> : <div></div>}
            </div>
        </div>)
}