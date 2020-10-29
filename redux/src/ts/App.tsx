import React, { useEffect } from "react"
import Sidebar from "./app/Sidebar"
import Stage from "./app/Stage"

let barWidth: number = 750
let barHeight: number = 150

export default function App() {

    return (
        <div className="window">
            <div className="content">
                <Sidebar />
                <Stage barWidth={barWidth} barHeight={barHeight} />
            </div>
        </div>)
}