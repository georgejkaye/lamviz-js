import React, { useState, useEffect } from "react"
import { useSelector, useDispatch } from "react-redux"
import { RootState } from "./../reducers"

import CytoscapeComponent from "react-cytoscapejs"

import cytoscape from "cytoscape"

import { stylesheet } from "./../data/style.js"
import { generateGraphElementsArray, GraphEdge, GraphNode, nodeDistanceX, nodeDistanceY } from "../bs/Graph.bs"
import { Term, Context, betaRedexes } from "../bs/Lambda.bs"

import { svg } from "./../libs/convert-to-svg"

import { downloadSvg, downloadedSvg, finishedDrawing } from "./../reducers/slice";

interface GraphProps {
    dimensions: { width: number, height: number }
    graph: { term: Term, context: Context }
    zoom: boolean
    nodeLabels: boolean
    edgeLabels: boolean
    redraw: boolean
    highlightedRedex: number
}

export default function Graph(props: GraphProps) {

    let cy: cytoscape.Core

    let dispatch = useDispatch()

    function generateElements(term: Term, ctx: Context): [cytoscape.ElementDefinition[], [string, string, string], [string, string, string]] {
        let [nodes, edges, frees, mps] = generateGraphElementsArray(term, ctx)
        return [nodes.concat(edges), frees, mps]
    }

    const updateNodeLabels = () => {
        if (props.nodeLabels) {
            cy.nodes(".abstraction, .application").addClass("nodelabelled")
        } else {
            cy.nodes(".abstraction, .application").removeClass("nodelabelled")
        }
    }

    const updateEdgeLabels = () => {
        if (props.edgeLabels) {
            cy.elements(".arc, .abs-edge, .abs-edge-r, .app-edge-l, .app-edge-r, .var-edge-l, .var-edge-r, .term-edge").addClass("termlabelled")
        } else {
            cy.elements(".arc, .abs-edge, .abs-edge-r, .app-edge-l, .app-edge-r, .var-edge-l, .var-edge-r, .term-edge").removeClass("termlabelled")
        }
    }

    const highlightRedex = (i: number) => {
        cy.elements(".highlighted").removeClass("highlighted")

        if (i != -1) {
            cy.elements(".beta-" + i).addClass("highlighted")
        }
    }

    const graphDimensions = useSelector((state: RootState) => state.currentState).graphDimensions
    const svgTime = useSelector((state: RootState) => state.currentState).svgTime
    const [lastNodeLabels, setLastNodeLabels] = useState(props.nodeLabels)
    const [lastEdgeLabels, setLastEdgeLabels] = useState(props.edgeLabels)
    const [lastTerm, setLastTerm] = useState(props.graph.term)

    const arcRegex = /var_top_[0-9]*_to_abs_top_([0-9]*)/

    const redrawTerm = () => {
        console.log("aa")
        cy.elements().addClass("transparent")
        cy.elements().remove()

        if (props.graph.term != undefined) {

            /* Generate elements for the current term */
            let [elements, frees, mps] = generateElements(props.graph.term, props.graph.context)

            /* Add all the elements */
            cy.add(elements)

            /* No point in faffing around with no elements */
            if (elements.length > 0) {

                /* Place free variables */
                let rightest = cy.nodes().reduce((h, e) => (h > e.position("x") ? h : e.position("x")), elements[0]["data"]["position"]["x"])
                frees.map((n, i) => {
                    let x = rightest + ((frees.length - i) * nodeDistanceX * 2) - nodeDistanceX;
                    cy.$("#" + n[0]).position({ x: x, y: 0 })
                    cy.$("#" + n[1]).position({ x: x + nodeDistanceX, y: -nodeDistanceY })
                    cy.$("#" + n[2]).position({ x: x + nodeDistanceX, y: 0 })
                })

                /* Make all the top nodes at the top appear at the same height */
                let highest = cy.nodes().reduce((h, e) => (h < e.position("y") ? h : e.position("y")), elements[0]["data"]["position"]["y"])
                cy.elements(".top").position("y", highest - (nodeDistanceY / 2))

                /* Put the midpoints in the middle of the edges */
                mps.map((mp) => {
                    let pos1 = cy.$("#" + mp[1]).position()
                    let pos2 = cy.$("#" + mp[2]).position()
                    cy.$("#" + mp[0]).position({ x: (pos1.x + pos2.x) / 2, y: (pos1.y + pos2.y) / 2 })
                })

                /* Remove dangling edges */
                cy.nodes(".top").map((n) => {
                    if (n.degree(true) == 1) {
                        let x = n.data("id").split("_")[2]
                        cy.remove("#abs_sp_mp_" + x)
                        cy.remove("#abs_sp_" + x)
                        cy.remove("#abs_top_" + x)
                    }
                })

                /* Propagate beta classes */
                for (var i = 0; i < betaRedexes(props.graph.term); i++) {
                    let arcs = cy.edges(".arc.beta-" + i)
                    let absid = arcs[arcs.length - 1].data("id").match(arcRegex)[1]
                    cy.$("#abs_" + absid).addClass("beta-" + i)
                    cy.$("#abs_sp_mp_" + absid).addClass("beta-" + i)
                    cy.$("#abs_sp_" + absid).addClass("beta-" + i)
                    cy.$("#abs_top_" + absid).addClass("beta-" + i)
                    cy.$("#abs_" + i + "_to_abs_sp_mp_" + absid).addClass("beta-" + i)
                    cy.$("#abs_sp_mp_" + i + "_to_abs_sp_" + absid).addClass("beta-" + i)
                    cy.$("#abs_sp_" + i + "_to_abs_top_" + absid).addClass("beta-" + i)
                }

                highlightRedex(props.highlightedRedex)
            }

            updateNodeLabels()
            updateEdgeLabels()

            cy.zoomingEnabled(props.zoom)

            /* Make the map fill the screen */
            if (props.nodeLabels == lastNodeLabels && props.edgeLabels == lastEdgeLabels) {
                cy.fit(cy.elements(), 50)
            }

            cy.elements().removeClass("transparent")
        }
    }

    useEffect(() => {
        redrawTerm()
    }, [props.graph.term])

    useEffect(() => {
        redrawTerm()
    }, [props.redraw])

    useEffect(() => {
        if (svgTime) {
            dispatch(downloadedSvg())
            svg(cy)
        }
    }, [svgTime])

    useEffect(() => {
        updateNodeLabels()
        setLastNodeLabels(props.nodeLabels)
    }, [props.nodeLabels])

    useEffect(() => {
        updateEdgeLabels()
        setLastEdgeLabels(props.edgeLabels)
    }, [props.edgeLabels])

    useEffect(() => {
        console.log("ee")
        highlightRedex(props.highlightedRedex)
    }, [props.highlightedRedex])

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