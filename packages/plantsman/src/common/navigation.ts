import {getPageTitleByPageUid} from "roam-client"

export const Navigation = {
  get currentPageUid() {
    const parts = new URL(window.location.href).hash.split("/")
    return parts[parts.length - 1]
  },
  get currentPageName() {
    return getPageTitleByPageUid(this.currentPageUid)
  },
}
