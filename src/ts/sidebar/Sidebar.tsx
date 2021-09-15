import { useAppSelector, useAppDispatch } from "../redux/hooks"
import { Mode, changeMode, toggleSettings } from "./sidebarSlice"

import Icon from "@mdi/react"

import { sidebarWidth, updateTerm, originalTerm, resetTerm, backTerm } from "../workbench/workbenchSlice"

import Github from "../../data/svgs/github.svg"
import Lambda from "../../data/svgs/lambda.svg"
import Skip from "../../data/svgs/skip.svg"
import { normalise } from "../../bs/Evaluator.bs"

import { Spacer } from "../App"

import { mdiCog, mdiSkipNext, mdiSkipPrevious, mdiRefresh, mdiArrowLeftCircle } from "@mdi/js"
import { betaRedexes } from "../../bs/Lambda.bs"

interface LinkButtonProps {
    link: string
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
interface ActionButtonProps {
    onClick: (e: React.MouseEvent<any>) => void
    clickable: () => boolean
    title: string
    src: string
    alt: string
}
const ActionButton = (props: ActionButtonProps) => (
    <div className={"sidebar-block " + (props.clickable() ? "clickable" : "")} onClick={(e) => props.clickable() ? props.onClick(e) : ""} >
        <Icon className="sidebar-icon" color={props.clickable() ? "#f2f2f2" : "#9c9c9c"} path={props.src} />
    </div>
)

export default function Sidebar() {

    let dispatch = useAppDispatch()
    const mode = useAppSelector((state) => state.workbench).mode
    const currentTerm = useAppSelector((state) => state.workbench).currentTerm
    const origTerm = useAppSelector((state) => state.workbench).originalTerm
    const termHistory = useAppSelector((state) => state.workbench).termHistory
    function setMode(mode: Mode) {
        dispatch(changeMode(mode))
    }
    const Separator = () => (<div className="separator"><hr /></div>)
    const WorkbenchButtons = () => (
        <div>
            <ActionButton onClick={(e) => dispatch(backTerm())} clickable={() => termHistory.length > 0} title="Back to previous term" src={mdiArrowLeftCircle} alt="Back symbol" />
            <ActionButton onClick={(e) => dispatch(resetTerm())} clickable={() => true} title="Reset this term to its original shape" src={mdiRefresh} alt="Refresh symbol" />
            <Separator />
            <ActionButton onClick={(e) => dispatch(originalTerm())} clickable={() => origTerm !== undefined} title="Return to the original term" src={mdiSkipPrevious} alt="Skip to beginning symbol" />
            <ActionButton onClick={(e) => dispatch(updateTerm(normalise(currentTerm)))} clickable={() => betaRedexes(currentTerm) > 0} title="Reduce the term completely" src={mdiSkipNext} alt="Skip to end symbol" />
        </div>
    )

    return (
        <div className="side">
            <div className="sidebar" style={{ width: sidebarWidth }}>
                <LinkButton link="https://www.georgejkaye.com/lambda-visualiser" title="Details about the visualiser" src={Lambda} alt="Lambda symbol" />
                <Spacer />
                {mode === Mode.VISUALISER ? <WorkbenchButtons /> : ""}
                <Spacer />
                <LinkButton link="https://github.com/georgejkaye/lamviz" title="GitHub repository for this project" src={Github} alt="GitHub logo" />
            </div>
        </div>
    )
}