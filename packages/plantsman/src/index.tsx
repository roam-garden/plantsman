import * as React from "react"
import { render } from "react-dom"
import App from "./components/App"
import "arrive"
import { Navigation } from "./common/navigation"

const rootId = "roam-garden-root"
const pageToRenderOn = "roam/garden/plantsman"

document.arrive(".roam-article > div:first-of-type", { existing: true }, parentRoot => {
  const prevRoot = document.getElementById(rootId)
  if (prevRoot) {
    parentRoot.removeChild(prevRoot)
  }

  if (pageToRenderOn !== Navigation.currentPageName) return

  const root = document.createElement("div")
  root.id = rootId

  parentRoot.appendChild(root)
  parentRoot.insertBefore(root, parentRoot.children[1])

  render(<App />, root)
})
