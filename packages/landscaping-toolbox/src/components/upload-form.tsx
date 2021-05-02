import React, {FormEvent, useEffect, useState} from 'react'

import {Box, Button, Checkbox, Container, Input, Label, Link as A} from 'theme-ui'
import {Tag} from 'react-tag-autocomplete'
import {API, Auth} from 'aws-amplify'

import {CognitoUser} from "amazon-cognito-identity-js"
import {TagInput} from "./tag-input"
import {useLocalState} from "../common/react"
import {gardenApi} from "../config"
import {upload} from "../common/storage"
import {RoamJsonQuery, RoamPage} from "roam-export"
import {executeAfterDelay} from "../common/async"

import {CssEditor} from "./css-editor"
import {ProgressIndicator, useSuccessIndicator} from "./progress-indicator"

import {SubscriptionExistsModal} from "./subscription-exists-modal"

interface UploadFormProps {
  allPageNames: string[]
  roamDataSupplier?: () => RoamPage[]
  showModal?: boolean
  onSubmit?: () => Promise<void>
}

export const UploadForm = (
  {
    allPageNames,
    roamDataSupplier,
    showModal = true,
    onSubmit,
  }: UploadFormProps,
) => {
  const [titlePlaceholder, setTitlePlaceholder] = useState("")
  const [title, setTitle] = useLocalState("title", "")
  const [publicTags, setPublicTags] = useLocalState<Tag[]>("publicTags", [{id: 0, name: "make-public"}])
  const [privateTags, setPrivateTags] = useLocalState<Tag[]>("privateTags", [])
  const [entryPageTag, setEntryPageTag] = useLocalState<Tag[]>("entryPageTag", [])
  const [allPagesPublic, setAllPagesPublic] = useLocalState("allPagesPublic", false)
  const [processingState, setProcessingState] = useState("")
  const [file, setFile] = useState<File | undefined>(undefined)
  const [cssCode, setCssCode] = useLocalState("cssCode", "")
  const [cssValid, setCssValid] = useState(false)
  const [isSuccess, indicateSuccess] = useSuccessIndicator()

  useEffect(() => {
    (async () => {
      const user: CognitoUser = await Auth.currentAuthenticatedUser()
      setTitlePlaceholder(`${user.getUsername()}'s Garden`)
    })()
  }, [])

  const allPageTags = allPageNames.map(it => ({name: it, id: it}))

  return (
    <Box as="section" id="upload" sx={{
      " label": {
        marginBottom: "0.7em",
      },
    }}>
      {showModal && <SubscriptionExistsModal/>}
      <Container>
        <Box
          as="form"
          onSubmit={submit}>
          <Label htmlFor="title">Garden Title *</Label>
          <Input
            name="title"
            mb={3}
            value={title}
            onChange={event => setTitle(event.target.value)}
            placeholder={titlePlaceholder}
            required
          />
          <Label htmlFor="entry">Starting page *</Label>
          <TagInput minTags={1}
                    maxTags={1}
                    suggestions={allPageTags}
                    tags={entryPageTag}
                    setTags={setEntryPageTag}
                    placeholderText="About these notes"/>

          <Label>
            <Checkbox
              checked={allPagesPublic}
              onChange={event => setAllPagesPublic(event.target.checked)}
            />
            Make All pages public
          </Label>

          <Label>Make pages with these tags public (all pages are private by default) *</Label>
          <TagInput minTags={1}
                    suggestions={allPageTags}
                    tags={publicTags}
                    setTags={setPublicTags}
                    disabled={allPagesPublic}/>

          <Label>Make blocks with these tags private</Label>
          <TagInput tags={privateTags}
                    suggestions={allPageTags}
                    setTags={setPrivateTags}/>

          {!roamDataSupplier && <>
              <Label htmlFor="db">Your graph JSON (
                  <A
                      href="https://roamresearch.freshdesk.com/support/solutions/articles/64000248331-how-to-export-your-roam-graph">
                      how to get it</A>)
              </Label>
              <Input
                  type="file"
                  name="db"
                  mb={3}
                  accept="application/json"
                  onChange={
                    e => setFile(e.target.files?.[0])
                  }
                  required
              />
          </>}

          <Label>Custom CSS (optional)</Label>
          {CssEditor({cssCode, setCssCode, cssValid, setCssValid})}

          {processingState ?
            <ProgressIndicator processingState={processingState} isSuccess={isSuccess}/> :
            <Button disabled={!isValid()}>Submit</Button>}
        </Box>
      </Container>
    </Box>
  )


  function isValid() {
    let result = true
    if (!(publicTags.length || allPagesPublic)) {
      result = false
      console.log("Must specify at least one public tag")
    }

    if (!entryPageTag.length) {
      result = false
      console.log("Must specify entry page")
    }

    if (!file && !roamDataSupplier) {
      result = false
      console.log("Must select file")
    }

    if (!title) {
      result = false
      console.log("Must enter title")
    }

    if (!cssValid) {
      result = false
      console.log("CSS is invalid")
    }

    return result
  }

  async function getDataToUpload() {
    if (!roamDataSupplier) {
      return file
    }

    setProcessingState("Creating full data export")
    const roamExport = await executeAfterDelay(0, roamDataSupplier)
    console.log("Export done, performing filtering")
    const {pages} = new RoamJsonQuery(roamExport, constructFilter()).getPagesToRender()
    console.log("Export & filtering done")
    return JSON.stringify(pages)
  }

  function constructFilter() {
    return {
      makeAllPagesPublic: allPagesPublic,
      pagesToMakePublic: [entryPageName()],
      makePagesWithTheseTagsPublic: publicTags.map(it => it.name),
      makeBlocksWithTheseTagsPrivate: privateTags.map(it => it.name),
    }
  }

  async function submit(e: FormEvent<HTMLDivElement>) {
    e.preventDefault()
    if (!isValid()) return

    setProcessingState("Initiating upload")
    const roamData = await getDataToUpload()
    setProcessingState("Uploading the export to Roam Garden")
    const [url, cssUrl] = await Promise.all([upload(roamData), upload(cssCode)])
    const entryPage = entryPageName()
    const payload = {
      config: {
        filter: constructFilter(),
        siteTitle: title,
        entryPage,
        cssUrl,
      },
      dbUrl: url,
    }
    console.log("sending", payload)
    // todo don't commit
    const result = await API.put(gardenApi, "/garden", {body: payload})
    console.log(result)

    await indicateSuccess()
    setProcessingState("")
    await onSubmit?.()
  }

  function entryPageName() {
    return entryPageTag[0].name
  }
}
