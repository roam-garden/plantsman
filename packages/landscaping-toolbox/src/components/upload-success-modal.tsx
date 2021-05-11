import React from "react"
import ReactModal from "react-modal"
import {Close, Flex, Heading, Link as A} from "theme-ui"
import {useUser} from "./user"

export interface UploadSuccessModalProps {
  showModal: boolean
  setShowModal: (showModal: boolean) => void
}

export const UploadSuccessModal = ({showModal, setShowModal}: UploadSuccessModalProps) => {
  const user = useUser()
  const gardenUrl = `https://${user?.getUsername()}.roam.garden`

  return <ReactModal
    isOpen={showModal}
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
    <Flex>
      <Heading as="h2" sx={{
        whiteSpace: "pre-line",
        lineHeight: "2em",
      }}>
        {"Your garden is growing. It usually takes 10-15min (longer if your garden is large)." +
        "\nYou'll get an email when it goes live." +
        "\nIt'll be available at "}
        <A href={gardenUrl}>{gardenUrl}</A>
      </Heading>
      <Close
        sx={{justifySelf: "start"}}
        onClick={() => setShowModal(false)}/>
    </Flex>
  </ReactModal>
}
