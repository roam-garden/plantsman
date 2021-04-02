import React, {FormEvent, useEffect, useState} from 'react'

import {Box, Button, Checkbox, Container, Heading, Input, Label, Link as A, Spinner} from 'theme-ui'
import {Tag} from 'react-tag-autocomplete'
import {API, Auth} from 'aws-amplify'

import {CognitoUser} from "amazon-cognito-identity-js"
import {TagInput} from "./tag-input"
import {useLocalState} from "../common/react"
import {gardenApi} from "../config"
import {upload} from "../common/storage"
import {RoamPage} from "roam-export"
import {executeAfterDelay} from "../common/async"

// import {SubscriptionModal} from "../components/subscription-modal"


interface UploadFormProps {
    allPageNames: string[]
    roamDataSupplier?: () => RoamPage[]
}

export const UploadForm = ({allPageNames, roamDataSupplier}: UploadFormProps) => {
    const [titlePlaceholder, setTitlePlaceholder] = useState("")
    const [title, setTitle] = useLocalState("title", "")
    const [publicTags, setPublicTags] = useLocalState<Tag[]>("publicTags", [{id: 0, name: "make-public"}])
    const [privateTags, setPrivateTags] = useLocalState<Tag[]>("privateTags", [])
    const [entryPageTag, setEntryPageTag] = useLocalState<Tag[]>("entryPageTag", [])
    const [allPagesPublic, setAllPagesPublic] = useLocalState("allPagesPublic", false)
    const [processing, setProcessing] = useState(false)
    const [file, setFile] = useState<File | undefined>(null)
    const [cssFile, setCssFile] = useState<File | undefined>(null)

    useEffect(() => {
        (async () => {
            const user: CognitoUser = await Auth.currentAuthenticatedUser()
            setTitlePlaceholder(`${user.getUsername()}'s Garden`)
        })()
    }, [])

    const allPageTags = allPageNames.map(it => ({name: it}))

    return (
        // <SubscriptionModal/>
        <Box as="section" id="upload">
            <Container>
                <Heading as={"h3"}>Create or update your garden</Heading>
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
                    <Input
                        type='file'
                        name='db'
                        mb={3}
                        accept='text/css'
                        onChange={
                            e => setCssFile(e.target.files?.[0])
                        }
                    />

                    {processing ? <Spinner/> : <Button disabled={processing || !isValid()}>
                        Submit
                    </Button>}
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

        return result
    }

    async function submit(e: FormEvent<HTMLDivElement>) {
        e.preventDefault()
        if (!isValid()) return

        setProcessing(true)

        let dataToUpload: File | string = file
        if (roamDataSupplier) {
            console.log("starting the export")
            const roamData = await executeAfterDelay(0, roamDataSupplier)
            dataToUpload = JSON.stringify(roamData)
            console.log("export finished the export")
        }

        const [url, cssUrl] = await Promise.all([upload(dataToUpload), upload(cssFile)])
        const entryPage = entryPageTag[0].name
        const payload = {
            config: {
                filter: {
                    makeAllPagesPublic: allPagesPublic,
                    pagesToMakePublic: [entryPage],
                    makePagesWithTheseTagsPublic: publicTags.map(it => it.name),
                    makeBlocksWithTheseTagsPrivate: privateTags.map(it => it.name),
                },
                siteTitle: title,
                entryPage,
                cssUrl,
            },
            dbUrl: url,
        }
        console.log("sending", payload)
        const result = await API.put(gardenApi, "/garden", {
            body: payload,
        })
        console.log(result)

        setProcessing(false)
        // await navigate("/upload-success")
    }
}
