import React, { useEffect } from "react"
import Sidebar from "./app/Sidebar"
import Stage from "./app/Stage"

let sidebarWidth: number = 600;

export default function App() {

    return (
        <div className="window">
            <div className="content">
                <Sidebar />
                <Stage sidebarWidth={sidebarWidth} />
            </div>
        </div>)
}