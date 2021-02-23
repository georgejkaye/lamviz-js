import React, { useState, KeyboardEvent, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../reducers"
import { Term, Context, betaRedexes, prettyPrint, prettyPrintDeBruijn } from "../bs/Lambda.bs"
import Graph from "./Graph"

interface PortraitProps {
  term: Term
  context: Context
}

const portraitDimensions = {
  width: 250,
  height: 250
}

export default function Portrait(props: PortraitProps) {

  return (
    <div className="portrait">
      <Graph graph={props}
        dimensions={portraitDimensions}
        highlightedRedex={-1}
        zoom={false}
        nodeLabels={false}
        edgeLabels={false}
        redraw={true}
        pan={false}
        margin={10}
      />
      <div>{prettyPrintDeBruijn(props.term)}</div>
    </div>
  )
}