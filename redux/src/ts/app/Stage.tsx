import React, { useState, KeyboardEvent, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "./reducers"

interface StageProps {
    sidebarWidth: number,
}

export default function Stage(props: StageProps) {

    return (
        <div className="stage">
            This is the stage
        </div>)
}