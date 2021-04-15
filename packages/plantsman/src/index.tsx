import * as React from "react"
import { render } from "react-dom"
import App from "./components/App"
import "arrive"
import { Navigation } from "./common/navigation"
import { RoamPage } from "./roam"

const rootId = "roam-garden-root"
const pageToRenderOn = "roam/garden"

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

function getOrCreateHostPage() {
  let gardenPageUid = RoamPage.fromName(pageToRenderOn)?.uid
  if (!gardenPageUid) {
    gardenPageUid = window.roamAlphaAPI.util.generateUID()
    window.roamAlphaAPI.data.page.create({ page: { title: pageToRenderOn, uid: gardenPageUid } })
  }
  return gardenPageUid
}

function initPlugin() {
  const gardenPageUid = getOrCreateHostPage()
  window.roamAlphaAPI.ui.commandPalette.addCommand({
    label: "Roam Garden",
    callback: () => Navigation.goToUid(gardenPageUid),
  })
}

initPlugin()
