import React, { useState, useEffect } from "react"
import { useSelector, useDispatch } from "react-redux"
import { RootState } from "./reducers"

import CytoscapeComponent from "react-cytoscapejs"
import { cloneDeep, isObject } from "lodash"

import { stylesheet } from "./style.js"
import { generateGraphElementsArray, GraphEdge, GraphNode, nodeDistanceX, nodeDistanceY } from "../../bs/Graph.bs"
import { Term, Context, prettyPrint } from "../../bs/Lambda.bs"

interface GraphProps {
    dimensions: { width: number, height: number }
    graph: { term: Term, context: Context }
}

export default function Graph(props: GraphProps) {

    let cy: cytoscape.Core

    function generateElements(term: Term, ctx: Context): cytoscape.ElementDefinition[] {
        let [nodes, edges] = generateGraphElementsArray(term, ctx)
        return nodes.concat(edges)
    }

    let elems = props.graph.term != undefined ? generateElements(props.graph.term, props.graph.context) : []

    const [elements, setElements] = useState([])
    const [dimensions, setDimensions] = useState(props.dimensions)

    useEffect(() => {
        cy.fit()
    }, [])

    useEffect(() => {

        cy.elements().remove()

        if (props.graph.term != undefined) {

            console.log(prettyPrint(props.graph.term, props.graph.context))
            let elements = generateElements(props.graph.term, props.graph.context)

            cy.add(elements)

            /*for (var i = 0; i < elements.length; i++) {
                cy.$("[id=\"" + elements[i].data["id"] + "\"]").position(elements[i].data["position"])
            }*/

            if (elements.length > 0) {
                let highest = cy.nodes().reduce((h, e) => (h < e.position("y") ? h : e.position("y")), elements[0]["data"]["position"]["y"])
                cy.elements(".top").position("y", highest - (nodeDistanceY / 2))
            }

            console.log("here")

            cy.fit(cy.elements(), 25)
            cy.minZoom(cy.zoom());
        }
    }, [props.graph])

    return (
        <div className="graph">
            <CytoscapeComponent
                elements={[]}
                style={dimensions}
                stylesheet={stylesheet}
                cy={(cyObj) => { cy = cyObj }}
            />
        </div>
    )
}