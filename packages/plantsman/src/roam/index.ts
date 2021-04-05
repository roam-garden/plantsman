import {RoamBlock as RoamExportBlock, RoamPage as RoamExportPage} from "roam-export"
import {RawRoamBlock, RawRoamPage, RoamNode} from "./types"

const Roam = {
  query(query: string, ...params: any[]): any[] {
    return window.roamAlphaAPI.q(query, ...params)
  },
  pull(id: number | string, selector = "[*]"): RawRoamPage | RawRoamBlock {
    if (!id) {
      console.log("bad id")
      return undefined
    }
    //@ts-ignore TODO
    return window.roamAlphaAPI.pull(selector, id)
  },
  queryFirst(query: string, ...params: any[]) {
    const results = this.query(query, ...params)
    if (!results?.[0] || results?.[0].lenght < 1) return null

    return this.pull(results[0][0])
  },

  listPageIds() {
    return this.query("[:find ?page :where [?page :node/title ?title] [?page :block/uid ?uid]]").flat()
  },

  listPages(): RawRoamPage[] {
    // return this.query(
    //   "[:find ?page ?uid ?title :where [?page :node/title ?title] [?page :block/uid ?uid]]",
    // ).map(([dbId, uid, name]: [string, string, string]) => ({
    //   dbId,
    //   uid,
    //   name,
    // }))
    return this.listPageIds().map((dbId: number) => this.pull(dbId))
  },

  getUid(node: RoamNode) {
    return this.pull(node[":db/id"])[":block/uid"]
  },
}

abstract class RoamEntity {
  constructor(readonly rawEntity: RawRoamBlock | RawRoamPage) {}

  abstract toExportJson(): RoamExportPage | RoamExportBlock

  get rawChildren(): RawRoamBlock[] | undefined {
    const children = this.rawEntity[":block/children"]?.map(it => Roam.pull(it[":db/id"])) as RawRoamBlock[]
    /**
     * Sorted because the order of the children returned is ~arbitrary
     */
    return children?.sort((a, b) => a[":block/order"] - b[":block/order"])
  }

  get children(): RoamBlock[] | undefined {
    return this.rawChildren?.map(it => new RoamBlock(it))
  }
}

class RoamPage extends RoamEntity {
  constructor(readonly rawPage: RawRoamPage) {
    super(rawPage)
  }

  toExportJson(): RoamExportPage {
    return {
      title: this.rawPage[":node/title"],
      children: this.children?.map(it => it.toExportJson()),
      "create-time": this.rawPage[":create/time"],
      //todo
      // "create-email": this.rawPage.,
      // "edit-email": string,
      "edit-time": this.rawPage[":edit/time"],
      uid: this.rawPage[":block/uid"],
    }
  }
}

class RoamBlock extends RoamEntity {
  constructor(readonly rawBlock: RawRoamBlock) {
    super(rawBlock)
  }

  toExportJson(): RoamExportBlock {
    return {
      // ":block/refs": todo
      "text-align": this.rawBlock[":block/text-align"],
      children: this.children?.map(it => it.toExportJson()),
      heading: this.rawBlock[":block/heading"],
      refs: this.rawBlock[":block/refs"]?.map(it => ({
        uid: Roam.getUid(it),
      })),
      string: this.rawBlock[":block/string"],
      // children: RoamBlock[],
      "create-time": this.rawBlock[":create/time"],
      //todo
      // "create-email": this.rawPage.,
      // "edit-email": string,
      "edit-time": this.rawBlock[":edit/time"],
      uid: this.rawBlock[":block/uid"],
    }
  }
}

export function generateRoamExport() {
  return Roam.listPages().map(it => new RoamPage(it).toExportJson())
}
