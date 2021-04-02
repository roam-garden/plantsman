import * as React from "react"
import {render} from "react-dom"
import App from "./components/App"

const rootId = "roam-garden-root"

const parentRoot = document
  .getElementsByClassName("rm-title-display")
  .item(0) as HTMLElement

const prevRoot = document.getElementById(rootId)
if (prevRoot) {
  parentRoot.parentElement?.removeChild(prevRoot)
}
// todo check for the appropriate title
// todo currently the ui will show up only if I stop-start the thing for some reason?
// try to render on each navigation =\?

const root = document.createElement("div")
root.id = rootId

parentRoot.parentElement?.appendChild(root)

render(<App/>, root)
