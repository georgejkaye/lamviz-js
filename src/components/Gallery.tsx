import React, { useState, KeyboardEvent, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { betaRedexes, prettyPrint, printHTML, printHTMLAndContext, prettyPrintDeBruijn } from "../bs/Lambda.bs";
import { RootState } from "../reducers"
import { Collapse } from "react-collapse"
import parse from "html-react-parser"
import Facts from "./Facts";
import { Term, Context } from "../bs/Lambda.bs"
import Graph from "./Graph"

export default function Gallery() {

    const n = useSelector((state: RootState) => state.gallerySlice).n
    const k = useSelector((state: RootState) => state.gallerySlice).k

    return (
        <div className="stage" >
            Generating the gallery for terms of size {n} with {k} free variables
        </div>)
}