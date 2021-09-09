import { useAppSelector, useAppDispatch } from "../redux/hooks"
import { Mode, changeMode } from "./sidebarSlice"

import { sidebarWidth, updateTerm } from "../workbench/workbenchSlice"

import Github from "../../data/svgs/github.svg"
import Lambda from "../../data/svgs/lambda.svg"
import Skip from "../../data/svgs/skip.svg"
import { normalise } from "../../bs/Evaluator.bs"

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
    <div className="sidebar-block">
        <img className="sidebar-icon" src={props.src} alt={props.alt} onClick={props.onClick}>
        </img>
    </div>
)
const Spacer = () => <div className="spacer" />

export default function Sidebar() {

    let dispatch = useAppDispatch()
    const mode = useAppSelector((state) => state.workbench).mode
    const currentTerm = useAppSelector((state) => state.workbench).currentTerm

    function setMode(mode: Mode) {
        dispatch(changeMode(mode))
    }

    const WorkbenchButtons = () => (
        <ActionButton onClick={(e) => dispatch(updateTerm(normalise(currentTerm)))} title="Reduce the term completely" src={Skip} alt="Skip symbol" />
    )

    return (
        <div className="sidebar" style={{ width: sidebarWidth }}>
            <LinkButton link="https://www.georgejkaye.com/lambda-visualiser" title="Details about the visualiser" src={Lambda} alt="Lambda symbol" />
            <Spacer />
            {mode === Mode.VISUALISER ? <WorkbenchButtons /> : ""}
            <Spacer />
            <LinkButton link="https://github.com/georgejkaye/lamviz" title="GitHub repository for this project" src={Github} alt="GitHub logo" />
        </ div >
    )
}