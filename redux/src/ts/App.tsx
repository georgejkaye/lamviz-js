import React, { useEffect } from "react"
import Sidebar from "./app/Sidebar"
import Stage from "./app/Stage"

import { hello } from "../bs/Demo.bs"

let sidebarWidth: number = 600;

export default function App() {

    hello()

    return (
        <div className="window">
            <div className="content">
                <Sidebar />
                <Stage sidebarWidth={sidebarWidth} />
            </div>
        </div>)
}