import React, { useState, KeyboardEvent, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { betaRedexes, prettyPrint, printHTML, printHTMLAndContext, prettyPrintDeBruijn } from "../bs/Lambda.bs";
import { RootState } from "../reducers"
import { updateTerms, updateMem } from "../reducers/gallerySlice"
import { initialiseTermBank, generateTermsArray, generateContext } from "../bs/Generators.bs"
import Portrait from "./Portrait"
import { updateTerm } from "../reducers/slice";

const PURE = 0;
const LINEAR = 1;
const PLANAR = 2;

export default function Gallery() {

    let dispatch = useDispatch()

    const n = useSelector((state: RootState) => state.gallerySlice).n
    const k = useSelector((state: RootState) => state.gallerySlice).k
    const mem = useSelector((state: RootState) => state.gallerySlice).mem
    const fragment = useSelector((state: RootState) => state.gallerySlice).fragment
    const terms = useSelector((state: RootState) => state.gallerySlice).terms

    let [ctx, setCtx] = useState(undefined)

    useEffect(() => {
        setCtx(generateContext(k))
        var [newTerms, newMem] = generateTermsArray(n, ctx, fragment, mem)
        dispatch(updateTerms(newTerms))
        dispatch(updateMem(newMem))
    }, [n, k])

    return (
        <div className="church-room" >
            {terms.map((term) =>
                <Portrait key={prettyPrintDeBruijn(term)} term={term} context={ctx} />
            )}
        </div>)
}