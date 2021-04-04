import React, {FormEvent, useEffect, useState} from 'react'

import {Box, Button, Checkbox, Container, Heading, Input, Label, Link as A, Spinner} from 'theme-ui'
import {Tag} from 'react-tag-autocomplete'
import {API, Auth} from 'aws-amplify'

import {CognitoUser} from "amazon-cognito-identity-js"
import {TagInput} from "./tag-input"
import {useLocalState} from "../common/react"
import {gardenApi} from "../config"
import {upload} from "../common/storage"
import {RoamJsonQuery, RoamPage} from "roam-export"
import {executeAfterDelay} from "../common/async"
import {Controlled as CodeMirror} from 'react-codemirror2'

require('codemirror/lib/codemirror.css')
require('codemirror/mode/css/css')


// import {SubscriptionModal} from "../components/subscription-modal"


interface UploadFormProps {
    allPageNames: string[]
    roamDataSupplier?: () => RoamPage[]
}

const progressIndicator = (processingState: string) => <><Spinner/> {processingState}</>

export const UploadForm = ({allPageNames, roamDataSupplier}: UploadFormProps) => {
    const [titlePlaceholder, setTitlePlaceholder] = useState("")
    const [title, setTitle] = useLocalState("title", "")
    const [publicTags, setPublicTags] = useLocalState<Tag[]>("publicTags", [{id: 0, name: "make-public"}])
    const [privateTags, setPrivateTags] = useLocalState<Tag[]>("privateTags", [])
    const [entryPageTag, setEntryPageTag] = useLocalState<Tag[]>("entryPageTag", [])
    const [allPagesPublic, setAllPagesPublic] = useLocalState("allPagesPublic", false)
    const [processingState, setProcessingState] = useState("")
    const [file, setFile] = useState<File | undefined>(undefined)
    const [cssCode, setCssCode] = useLocalState("cssCode", "")

    useEffect(() => {
        (async () => {
            const user: CognitoUser = await Auth.currentAuthenticatedUser()
            setTitlePlaceholder(`${user.getUsername()}'s Garden`)
        })()
    }, [])

    const allPageTags = allPageNames.map(it => ({name: it, id: it}))

    return (
        // <SubscriptionModal/>
        <Box as="section" id="upload">
            <Container>
                <Heading as={"h3"}>Plant a garden</Heading>
                <Box
                  as='form'
                  onSubmit={submit}>
                    <Label htmlFor='title'>Garden Title *</Label>
                    <Input
                      name="title"
                      mb={3}
                      value={title}
                      onChange={event => setTitle(event.target.value)}
                      placeholder={titlePlaceholder}
                      required
                    />
                    <Label htmlFor='entry'>Starting page *</Label>
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
                        <Label htmlFor='db'>Your graph JSON (
                            <A
                              href="https://roamresearch.freshdesk.com/support/solutions/articles/64000248331-how-to-export-your-roam-graph">
                                how to get it</A>)
                        </Label>
                        <Input
                          type='file'
                          name='db'
                          mb={3}
                          accept='application/json'
                          onChange={
                              e => setFile(e.target.files?.[0])
                          }
                          required
                        />
                    </>}

                    <Label>Custom CSS (optional)</Label>
                    {codeEditor()}

                    {processingState ? progressIndicator(processingState) :
                      <Button disabled={!isValid()}>Submit</Button>}
                </Box>
            </Container>
        </Box>
    )

    /**
     * Making it a proper components interferes with CodeMirror rendering somehow (cursor disappearance?)
     */
    function codeEditor() {
        return <Box
          sx={{
              marginTop: "1em",
              marginBottom: "1em",
              ".CodeMirror": {
                  maxHeight: "20em",

                  ".CodeMirror-scroll": {
                      height: "100%",
                  },
              },
          }}
        >
            <CodeMirror
              value={cssCode}
              options={{
                  mode: 'css',
                  lineNumbers: true,
              }}
              onBeforeChange={(editor, data, value) => {
                  setCssCode(value)
              }}
              onKeyHandled={(_, __, e) => e.stopPropagation()}
            />
        </Box>
    }

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
        const result = await API.put(gardenApi, "/garden", {body: payload,})
        console.log(result)

        // todo success indicator on timeout
        setProcessingState("")
        // await navigate("/upload-success")
    }

    function entryPageName() {
        return entryPageTag[0].name
    }
}
