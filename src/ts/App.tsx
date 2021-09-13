import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"

import { RootState } from "./redux/store"
import { Mode } from "./sidebar/sidebarSlice";
import { resize } from "./workbench/workbenchSlice"

import Sidebar from "./sidebar/Sidebar"
import Workbench from "./workbench/Workbench"
import Gallery from "./gallery/Gallery"

export const Spacer = () => <div className="spacer" />

export default function App() {

    const mode = useSelector((state: RootState) => state.sidebar).mode

    const dispatch = useDispatch()

    useEffect(() => {

        const onResize = () => {

            const height = window.innerHeight
            const width = window.innerWidth

            dispatch(resize({ height: height, width: width }))
        }

        window.addEventListener("resize", onResize)

        return () => {
            window.removeEventListener("resize", onResize)
        }

    })

    return (
        <div className="window">
            <div className="content">
                <Sidebar />
                {mode === Mode.VISUALISER ? <Workbench /> : <Gallery />}
            </div>
        </div>)
}