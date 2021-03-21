import React, { useState, KeyboardEvent, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { betaRedexes, prettyPrint, printHTML, printHTMLAndContext, prettyPrintDeBruijn } from "../bs/Lambda.bs";
import { RootState } from "../reducers"
import { } from "../reducers/gallerySlice"
import { initialiseTermBank, generateTermsArray, generateContext } from "../bs/Generators.bs"
import Portrait from "./Portrait"
import { updateTerm } from "../reducers/slice";

export default function Gallery() {

    let dispatch = useDispatch()

    const n = useSelector((state: RootState) => state.gallerySlice).n
    const k = useSelector((state: RootState) => state.gallerySlice).k
    const fragment = useSelector((state: RootState) => state.gallerySlice).fragment

    let [ctx, setCtx] = useState(undefined)
    let [terms, setTerms] = useState([])
    let [mem, setMem] = useState(initialiseTermBank(16, 16))

    useEffect(() => {
        setCtx(generateContext(k))
        var [newTerms, newMem] = generateTermsArray(n, ctx, fragment, mem)
        setMem(newMem)
        setTerms(newTerms)
    }, [n, k, fragment])

    return (
        <div className="church-room" >
            {terms.map((term) =>
                <Portrait key={prettyPrintDeBruijn(term)} term={term} context={ctx} />
            )}
        </div>)
}