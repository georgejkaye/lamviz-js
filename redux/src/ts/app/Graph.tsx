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
    zoom: boolean
}

export default function Graph(props: GraphProps) {

    let cy: cytoscape.Core

    function generateElements(term: Term, ctx: Context): [cytoscape.ElementDefinition[], [string, string, string]] {
        let [nodes, edges, mps] = generateGraphElementsArray(term, ctx)
        return [nodes.concat(edges), mps]
    }

    const graphDimensions = useSelector((state: RootState) => state.currentState).graphDimensions

    useEffect(() => {
        cy.fit()
    }, [])

    useEffect(() => {

        cy.elements().remove()

        if (props.graph.term != undefined) {

            console.log(prettyPrint(props.graph.term, props.graph.context))
            let [elements, mps] = generateElements(props.graph.term, props.graph.context)

            cy.add(elements)

            if (elements.length > 0) {
                let highest = cy.nodes().reduce((h, e) => (h < e.position("y") ? h : e.position("y")), elements[0]["data"]["position"]["y"])
                cy.elements(".top").position("y", highest - (nodeDistanceY / 2))
            }

            for (var i = 0; i < mps.length; i++) {

                var pos1 = cy.$("#" + mps[i][1]).position()
                var pos2 = cy.$("#" + mps[i][2]).position()
                cy.$("#" + mps[i][0]).position({ x: (pos1.x + pos2.x) / 2, y: (pos1.y + pos2.y) / 2 })
            }


            console.log("here")

            cy.fit()
            cy.minZoom(cy.zoom() - 10);
        }
    }, [props.graph])


    return (
        <div key={props.dimensions.width} className="graph">
            <CytoscapeComponent
                elements={[]}
                style={graphDimensions}
                stylesheet={stylesheet}
                cy={(cyObj) => { cy = cyObj }}
            />
        </div>
    )
}