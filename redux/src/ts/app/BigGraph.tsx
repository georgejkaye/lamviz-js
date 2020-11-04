import React, { useState, useEffect } from "react"
import { useSelector, useDispatch } from "react-redux"
import { RootState } from "./reducers"

import CytoscapeComponent from "react-cytoscapejs"
import { cloneDeep, isObject } from "lodash"

import { stylesheet } from "./style.js"
import { GraphEdge, GraphNode, nodeDistanceX, nodeDistanceY } from "../../bs/Graph.bs"

import Graph from "./Graph"

interface GraphProps {
    barWidth: number,
    barHeight: number
}

export default function BigGraph(props: GraphProps) {

    const term = useSelector((state: RootState) => state.currentState).currentTerm
    const context = useSelector((state: RootState) => state.currentState).currentContext

    const [dimensions, setDimensions] = useState({
        height: window.innerHeight - props.barHeight,
        width: window.innerWidth - props.barWidth,
    });

    useEffect(() => {

        const onResize = () => {

            const height = window.innerHeight - props.barHeight
            const width = window.innerWidth - props.barWidth

            setDimensions({
                width: width,
                height: height
            })

            console.log("resized to: ", width, "x", height)
        }

        window.addEventListener("resize", onResize)

        return () => {
            window.removeEventListener("resize", onResize)
        }

    })

    return (
        <div className="main-graph">
            <Graph dimensions={dimensions} graph={{ term: term, context: context }} />
        </div>
    )
}