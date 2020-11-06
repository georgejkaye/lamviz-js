import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "./reducers"
import { Mode, changeMode, newTerm, newError, clear } from "./reducers/slice"
import { lexAndParse } from "../../bs/Parser.bs";

export default function VisualiserSidebar() {

    const dispatch = useDispatch()

    return (
        <div className="gallery-sidebar">
        </div>)
}