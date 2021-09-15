import { useAppSelector, useAppDispatch } from "../redux/hooks"
import { Mode, changeMode, toggleSettings } from "./sidebarSlice"

import Icon from "@mdi/react"

import { sidebarWidth, updateTerm, originalTerm, resetTerm } from "../workbench/workbenchSlice"

import Github from "../../data/svgs/github.svg"
import Lambda from "../../data/svgs/lambda.svg"
import Skip from "../../data/svgs/skip.svg"
import { normalise } from "../../bs/Evaluator.bs"

import { Spacer } from "../App"

import { mdiCog, mdiSkipNext, mdiSkipPrevious, mdiRefresh } from "@mdi/js"

interface LinkButtonProps {
    link: string
    title: string
    src: string
    alt: string
}
interface ActionButtonProps {
    onClick: (e: React.MouseEvent<any>) => void
    title: string
    src: string
    alt: string
}

const LinkButton = (props: LinkButtonProps) => (
    <div className="sidebar-block">
        <a href={props.link} title={props.title}>
            <img className="sidebar-icon" src={props.src} alt={props.alt}>
            </img>
        </a>
    </div>
)
const ActionButton = (props: ActionButtonProps) => (
    <div className="sidebar-block" onClick={props.onClick} >
        <Icon className="sidebar-icon" path={props.src} />
    </div>
)

export default function Sidebar() {

    let dispatch = useAppDispatch()
    const mode = useAppSelector((state) => state.workbench).mode
    const currentTerm = useAppSelector((state) => state.workbench).currentTerm
    function setMode(mode: Mode) {
        dispatch(changeMode(mode))
    }

    const WorkbenchButtons = () => (
        <div>
            <ActionButton onClick={(e) => dispatch(originalTerm())} title="Return to the original term" src={mdiSkipPrevious} alt="Skip to beginning symbol" />
            <ActionButton onClick={(e) => dispatch(updateTerm(normalise(currentTerm)))} title="Reduce the term completely" src={mdiSkipNext} alt="Skip to end symbol" />
            <ActionButton onClick={(e) => dispatch(resetTerm())} title="Return to the original term" src={mdiRefresh} alt="Refresh symbol" />
        </div>
    )

    return (
        <div className="side">
            <div className="sidebar" style={{ width: sidebarWidth }}>
                <LinkButton link="https://www.georgejkaye.com/lambda-visualiser" title="Details about the visualiser" src={Lambda} alt="Lambda symbol" />
                <Spacer />
                {mode === Mode.VISUALISER ? <WorkbenchButtons /> : ""}
                <Spacer />
                <ActionButton onClick={(e) => { dispatch(toggleSettings()) }} title="Open settings panel" src={mdiCog} alt="Cog symbol" />
                <LinkButton link="https://github.com/georgejkaye/lamviz" title="GitHub repository for this project" src={Github} alt="GitHub logo" />
            </div>
        </div>
    )
}