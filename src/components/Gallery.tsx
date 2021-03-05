import React, { useState, KeyboardEvent, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { betaRedexes, prettyPrint, printHTML, printHTMLAndContext, prettyPrintDeBruijn } from "../bs/Lambda.bs";
import { RootState } from "../reducers"
import { initialiseTermBank, generateTermsArray, generateContext } from "../bs/Generators.bs"
import Portrait from "./Portrait"

const PURE = 0;
const LINEAR = 1;
const PLANAR = 2;

export default function Gallery() {

    const n = useSelector((state: RootState) => state.gallerySlice).n
    const k = useSelector((state: RootState) => state.gallerySlice).k

    var mem = initialiseTermBank(16, 16)
    let ctx = generateContext(k)
    var [terms, mem] = generateTermsArray(n, ctx, PLANAR, mem)

    for (var i = 0; i < terms.length; i++) {
        console.log(prettyPrintDeBruijn(terms[i]))
    }

    return (
        <div className="church-room" >
            {terms.map((term) =>
                <Portrait key={prettyPrintDeBruijn(term)} term={term} context={ctx} />
            )}
        </div>)
}