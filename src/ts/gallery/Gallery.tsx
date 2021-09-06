import React, { useState, useEffect } from "react"
import { useDispatch } from "react-redux"

import { Fragment, getLowerFragmentString } from "./gallerySlice"
import { useAppSelector } from "../redux/hooks";

import Portrait from "./Portrait"

import { Term, prettyPrintDeBruijn } from "../../bs/Lambda.bs"
import { initialiseTermBank, generateTermsArray, generateContext } from "../../bs/Generators.bs"

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

    const n = useAppSelector((state) => state.gallery).n
    const k = useAppSelector((state) => state.gallery).k
    const fragment = useAppSelector((state) => state.gallery).fragment

    let [ctx, setCtx] = useState(generateContext(k))
    let [terms, setTerms] = useState<Term[]>([])
    let [mem, setMem] = useState(initialiseTermBank(16, 16))

    let [total, setTotal] = useState(0)
    let [selected, setSelected] = useState(0)

    useEffect(() => {
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