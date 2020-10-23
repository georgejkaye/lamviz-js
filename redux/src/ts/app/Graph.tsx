import React, { useState, useEffect } from "react"
import { useSelector, useDispatch } from "react-redux"
import { RootState } from "./reducers"

import CytoscapeComponent from "react-cytoscapejs"

interface GraphProps {
    sidebarWidth: number,
}

let elements: cytoscape.ElementDefinition[] = []
let stylesheet: cytoscape.StylesheetStyle[] = []

let cy: cytoscape.Core;
let focused: boolean = false;

function onWheel(e: any) {
    console.log("Scrolling");
}


export default function Graph(props: GraphProps) {

    const dispatch = useDispatch();

    const [dimensions, setDimensions] = useState({
        height: window.innerHeight,
        width: window.innerWidth - props.sidebarWidth,
    });

    useEffect(() => {
        cy.fit();
        cy.minZoom(cy.zoom());
    }, []);

    useEffect(() => {

        const onResize = () => {

            const height = window.innerHeight
            const width = window.innerWidth - props.sidebarWidth

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
                elements={elements}
                style={dimensions}
                stylesheet={stylesheet}
                maxZoom={3}
                cy={(cyObj) => { cy = cyObj }}
            />
        </div>
    )
}