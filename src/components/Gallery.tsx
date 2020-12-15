import React, { useState, KeyboardEvent, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { betaRedexes, prettyPrint, printHTML, printHTMLAndContext, prettyPrintDeBruijn } from "../bs/Lambda.bs";
import { RootState } from "../reducers"
import { initialiseMemory, generateTerms, generateContext } from "../bs/Generators.bs"

export default function Gallery() {

    const n = useSelector((state: RootState) => state.gallerySlice).n
    const k = useSelector((state: RootState) => state.gallerySlice).k

    let mem = initialiseMemory(16, 16)
    console.log(mem)
    let ctx = generateContext(k)
    let terms = generateTerms(n, ctx, mem)

    return (
        <div className="stage" >
            Generating the gallery for terms of size {n} with {k} free variables
        </div>)
}