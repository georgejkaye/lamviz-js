import { useState, useEffect } from "react"

import cytoscape from "cytoscape"
import CytoscapeComponent from "react-cytoscapejs"

import { useAppSelector, useAppDispatch } from "../redux/hooks"
import { doneAnimating, unhighlightRedex, downloadedSvg, finishedDrawing, performReduction, newTerm, updateTerm } from "./workbenchSlice";

import { generateGraphElementsArray, Midpoint, nodeDistanceX, nodeDistanceY, Redex, RedexNodes } from "../../bs/Graph.bs"
import { Term, Context, betaRedexes } from "../../bs/Lambda.bs"

import { generateSvg, generateAndDownloadSvg } from "./../../libs/convert-to-svg"

import { stylesheet } from "./../../data/style.js"
import { specificReduction } from "../../bs/Evaluator.bs";

interface GraphProps {
    dimensions: { width: number, height: number }
    graph: { term: Term, context: Context }
    zoom: boolean
    pan: boolean
    margin: number
    nodeLabels: boolean
    edgeLabels: boolean
    redraw: boolean
    highlightedRedex: number
    animatedRedex: number
    interactive: boolean
}

export default function Graph(props: GraphProps) {

    let cy: cytoscape.Core

    let dispatch = useAppDispatch()

    let [currentSvg, setCurrentSvg] = useState("")
    let [redexStrings, setRedexStrings] = useState<Redex[]>([])
    let [redexes, setRedexes] = useState<RedexNodes[]>([])

    function generateElements(term: Term, ctx: Context): [cytoscape.ElementDefinition[], [string, string, string], Midpoint[], Redex[]] {
        let [nodes, edges, frees, mps, redexes] = generateGraphElementsArray(term, ctx)
        return [nodes.concat(edges), frees, mps, redexes]
    }

    const redexStringsToNodes = (redex: Redex) => {
        let { rootParent, rootEdge, root, app, arg, argEdge, argChild, stem, abs, out, outChild, bound, boundChild } = redex
        let nodeRedex = {
            rootParent: cy.$id(rootParent),
            rootEdge: cy.$id(rootEdge),
            root: cy.$id(root),
            app: cy.$id(app),
            arg: cy.$id(arg),
            argEdge: cy.$id(argEdge),
            argChild: cy.$id(argChild),
            stem: cy.$id(stem),
            abs: cy.$id(abs),
            out: cy.$id(out),
            outChild: cy.$id(outChild),
            bound: cy.$id(bound),
            boundChild: cy.$id(boundChild)
        }
        console.log(nodeRedex)
        return nodeRedex
    }

    const updateNodeLabels = () => {
        let nodes = ".abstraction, .application"
        if (props.nodeLabels) {
            cy.nodes(nodes).addClass("nodelabelled")
        } else {
            cy.nodes(nodes).removeClass("nodelabelled")
        }
    }

    const updateEdgeLabels = () => {
        let edges = ".arc, .abs-edge, .abs-edge-r, .app-edge-l, .app-edge-r, .var-edge-l, .var-edge-r, .term-edge"
        if (props.edgeLabels) {
            cy.elements(edges).addClass("termlabelled")
        } else {
            cy.elements(edges).removeClass("termlabelled")
        }
    }
    const unhighlightRedex = () => {
        cy.elements(".highlighted").removeClass("highlighted")
    }
    const highlightRedex = (i: number) => {
        cy.elements(".beta-" + i).addClass("highlighted")
    }

    const svgTime = useAppSelector((state) => state.workbench).svgTime
    const [lastNodeLabels, setLastNodeLabels] = useState(props.nodeLabels)
    const [lastEdgeLabels, setLastEdgeLabels] = useState(props.edgeLabels)

    const arcRegex = /var_top_([0-9]*)_to_abs_top_([0-9]*)/

    const redrawTerm = () => {
        cy.elements().addClass("transparent")
        cy.elements().remove()

        if (props.graph.term !== undefined) {

            /* Generate elements for the current term */
            let [elements, frees, mps, redexes] = generateElements(props.graph.term, props.graph.context)
            console.log("redexes", redexes)

            /* Add all the elements */
            cy.add(elements)

            /* No point in faffing around with no elements */
            if (elements.length > 0) {

                let position = elements[0]["data"]["position"]
                if (position) {

                    /* Place free variables */
                    let rightest = cy.nodes().reduce((h, e) => (h > e.position("x") ? h : e.position("x")), position["x"])
                    frees.map((n, i) => {
                        let x = rightest + ((frees.length - i) * nodeDistanceX * 2) - nodeDistanceX;
                        cy.$("#" + n[0]).position({ x: x, y: 0 })
                        cy.$("#" + n[1]).position({ x: x + nodeDistanceX, y: -nodeDistanceY })
                        cy.$("#" + n[2]).position({ x: x + nodeDistanceX, y: 0 })
                    })

                    /* Make all the top nodes at the top appear at the same height */
                    let highest = cy.nodes().reduce((h, e) => (h < e.position("y") ? h : e.position("y")), position["y"])
                    cy.elements(".top").position("y", highest - (nodeDistanceY / 2))

                    /* Put the midpoints in the middle of the edges */
                    mps.map((mp) => {
                        let pos1 = cy.$("#" + mp.source).position()
                        let pos2 = cy.$("#" + mp.target).position()
                        cy.$("#" + mp.midpoint).position({ x: (pos1.x + pos2.x) / 2, y: (pos1.y + pos2.y) / 2 })
                    })

                    /* Remove dangling edges */
                    cy.nodes(".top").map((n) => {
                        if (n.degree(true) === 1) {
                            let x = n.data("id").split("_")[2]
                            cy.remove("#abs_sp_mp_" + x)
                            cy.remove("#abs_sp_" + x)
                            cy.remove("#abs_top_" + x)
                        }
                    })

                    /* Propagate beta classes */
                    for (var i = 0; i < betaRedexes(props.graph.term); i++) {
                        let arcs = cy.edges(".arc.beta-" + i).toArray()

                        for (var j = 0; j < arcs.length; j++) {
                            let absId = arcs[j].data("id").match(arcRegex)[2]
                            cy.$("#abs_" + absId).addClass("beta-" + i)
                            cy.$("#abs_sp_mp_" + absId).addClass("beta-" + i)
                            cy.$("#abs_sp_" + absId).addClass("beta-" + i)
                            cy.$("#abs_top_" + absId).addClass("beta-" + i)
                            cy.$("#abs_" + absId + "_to_abs_sp_mp_" + absId).addClass("beta-" + i)
                            cy.$("#abs_sp_mp_" + absId + "_to_abs_sp_" + absId).addClass("beta-" + i)
                            cy.$("#abs_sp_" + absId + "_to_abs_top_" + absId).addClass("beta-" + i)
                        }
                    }

                    highlightRedex(props.highlightedRedex)
                }

                updateNodeLabels()
                updateEdgeLabels()

                /* Make the map fill the screen */
                if (props.nodeLabels === lastNodeLabels && props.edgeLabels === lastEdgeLabels) {
                    cy.fit(cy.elements(), props.margin)
                }

                cy.userPanningEnabled(props.pan)
                cy.userZoomingEnabled(props.zoom)
                cy.boxSelectionEnabled(false);

                cy.elements().removeClass("transparent")
                setCurrentSvg(generateSvg(cy))

                setRedexStrings(redexes)
                setRedexes(redexes.map((r) => redexStringsToNodes(r)))

                console.log(cy.elements())
            }
        }
        dispatch(finishedDrawing())
    }
    const animateRedex = async (i: number) => {

        if (i > -1) {
            let { rootParent, rootEdge, root, app, arg, argEdge, argChild, stem, abs, out, outChild, bound, boundChild } = redexes[i]

            let appEdges = app.connectedEdges()
            let absEdges = abs.connectedEdges()

            let duration = { duration: 1000 }

            let vanishStyle = { style: { opacity: 0 } }

            appEdges.animate(vanishStyle, duration)
            absEdges.animate(vanishStyle, duration)

            app.animate(vanishStyle, duration)
            abs.animate(vanishStyle, duration)
            stem.animate(vanishStyle, duration)

            let topMidpointX = (argChild.position("x") + boundChild.position("x")) / 2
            let topMidpointY = (argChild.position("y") + boundChild.position("y")) / 2
            let topPosition = { position: { x: topMidpointX, y: topMidpointY } }

            let botMidpointX = (outChild.position("x") + rootParent.position("x")) / 2
            let botMidpointY = (outChild.position("y") + rootParent.position("y")) / 2
            let botPosition = { position: { x: botMidpointX, y: botMidpointY } }

            bound.animate(topPosition, duration)
            arg.animate({ ...topPosition, style: { opacity: 0 } }, duration)
            out.animate(botPosition, duration)
            root.animate({ ...botPosition, style: { opacity: 0 } }, duration)

            await new Promise(r => setTimeout(r, 2000))

            dispatch(unhighlightRedex)
            dispatch(doneAnimating())

            dispatch(updateTerm(specificReduction(props.graph.term, i)))
        }
    }

    useEffect(() => {
        redrawTerm()
    }, [props.graph.term, props.graph.context, props.dimensions])

    useEffect(() => {
        console.log("red")
        redrawTerm()
    }, [props.redraw])

    useEffect(() => {
        if (svgTime) {
            dispatch(downloadedSvg())
            generateAndDownloadSvg(cy)
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
        unhighlightRedex()
        highlightRedex(props.highlightedRedex)
    }, [props.highlightedRedex])

    useEffect(() => {
        animateRedex(props.animatedRedex)
    }, [props.animatedRedex])

    return (
        <div key={props.dimensions.width} className="graph">
            <CytoscapeComponent
                elements={[]}
                style={props.dimensions}
                stylesheet={stylesheet}
                cy={(cyObj) => { cy = cyObj }}
            />
        </div>
    )
}