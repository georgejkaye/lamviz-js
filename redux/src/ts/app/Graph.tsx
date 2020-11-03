import React, { useState, useEffect } from "react"
import { useSelector, useDispatch } from "react-redux"
import { RootState } from "./reducers"

import CytoscapeComponent from "react-cytoscapejs"
import { cloneDeep, isObject } from "lodash"

import { stylesheet } from "./style.js"
import { GraphEdge, GraphNode, nodeDistanceX, nodeDistanceY } from "../../bs/Graph.bs"

interface GraphProps {
    barWidth: number,
    barHeight: number
}

let focused: boolean = false;

function onWheel(e: any) {
    console.log("Scrolling");
}

type GraphElement = GraphNode | GraphEdge

export default function Graph(props: GraphProps) {
    var cy: cytoscape.Core;

    const dispatch = useDispatch();

    const elements = useSelector((state: RootState) => state.currentState).currentElements
    var [currentElements, setCurrentElements] = useState([])

    const [dimensions, setDimensions] = useState({
        height: window.innerHeight - props.barHeight,
        width: window.innerWidth - props.barWidth,
    });

    function postGenerate() {

        if (elements.length > 0) {
            let highest = cy.nodes().reduce((h, e) => (h < e.position("y") ? h : e.position("y")), elements[0]["data"]["position"]["y"])
            cy.elements(".top").position("y", highest - (nodeDistanceY / 2))
        }

        cy.fit()
        cy.minZoom(cy.zoom() - 0.5);
    }

    useEffect(() => {
        cy.fit()
    }, [])

    useEffect(() => {

        if (currentElements != [] && (elements != undefined || currentElements != elements)) {

            setCurrentElements(elements)

            if (elements != undefined) {

                cy.elements().remove()
                cy.add(elements)

                for (var i = 0; i < elements.length; i++) {
                    cy.$("[id=\"" + elements[i].data["id"] + "\"]").position(elements[i].data["position"])
                }

                postGenerate()

            }
        }


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
        <div className="graph" onWheel={onWheel}>
            <CytoscapeComponent
                elements={[]}
                style={dimensions}
                stylesheet={stylesheet}
                cy={(cyObj) => { cy = cyObj }}
            />
        </div>
    )
}