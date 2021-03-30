import * as React from "react"
import {render} from "react-dom"
import App from "./components/App"

// todo check for the appropriate title
const parentRoot = document.getElementsByClassName("rm-title-display").item(0) as HTMLElement
let rootEl = document.createElement("div")

parentRoot.parentElement?.appendChild(rootEl)

render(<App/>, rootEl)
