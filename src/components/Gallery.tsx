import React, { useState, KeyboardEvent, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { betaRedexes, prettyPrint, printHTML, printHTMLAndContext, prettyPrintDeBruijn } from "../bs/Lambda.bs";
import { RootState } from "../reducers"
import { Fragment, getLowerFragmentString } from "../reducers/gallerySlice"
import { initialiseTermBank, generateTermsArray, generateContext } from "../bs/Generators.bs"
import Portrait from "./Portrait"
import { updateTerm } from "../reducers/slice";

interface GalleryHeaderProps {
    selected: number
    total: number
    fragment: Fragment
    n: number
    k: number
}

function GalleryHeader(props: GalleryHeaderProps) {
    return <div className="subtop-bar">There are {props.total} {getLowerFragmentString(props.fragment)} terms for n={props.n}, k={props.k}. {props.selected}/{props.total} terms</div>
}

export default function Gallery() {

    let dispatch = useDispatch()

    const n = useSelector((state: RootState) => state.gallerySlice).n
    const k = useSelector((state: RootState) => state.gallerySlice).k
    const fragment = useSelector((state: RootState) => state.gallerySlice).fragment

    let [ctx, setCtx] = useState(undefined)
    let [terms, setTerms] = useState([])
    let [mem, setMem] = useState(initialiseTermBank(16, 16))

    let [total, setTotal] = useState(0)
    let [selected, setSelected] = useState(0)

    useEffect(() => {
        setCtx(generateContext(k))
        var [newTerms, newMem] = generateTermsArray(n, ctx, fragment, mem)
        console.log(newMem)
        setTotal(newTerms.length)
        setSelected(newTerms.length)
        setMem(newMem)
        setTerms(newTerms)
    }, [n, k, fragment])

    return (
        <div className="gallery">
            <GalleryHeader total={total} selected={selected} fragment={fragment} n={n} k={k} />
            <div className="church-room" >
                {terms.map((term) =>
                    <Portrait key={prettyPrintDeBruijn(term)} term={term} context={ctx} />
                )}
            </div>
        </div>)
}