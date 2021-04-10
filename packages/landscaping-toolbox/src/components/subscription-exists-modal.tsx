import React, {useEffect} from "react"
import ReactModal from "react-modal"
import {Box, Heading, Link as A} from "theme-ui"
import {currentUserHasValidSubscription} from "../billing"
import {useLocalState} from "../common/react"


export const SubscriptionExistsModal = () => {
  const [modalOpen, setModalOpen] = useLocalState("lastSubscriptionState", true)

  useEffect(() => {
    (async () => {
      const hasSubscription = await currentUserHasValidSubscription()
      setModalOpen(!hasSubscription)
    })()
  })

  return <ReactModal
    isOpen={modalOpen}
    shouldCloseOnEsc={false}
    ariaHideApp={false}
    parentSelector={() => document.getElementById("subscription-modal-parent")!}
    style={{
      overlay: {
        display: "flex",
      },
      content: {
        margin: "auto",
        position: "unset",
      },
    }}
  >
    <Box>
      <Heading as="h2">
        No subscription found. Please go to <A href="https://roam.garden/app" target="_blank">Roam Garden</A> to set one
        up
      </Heading>
    </Box>
  </ReactModal>
}

