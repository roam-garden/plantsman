import {Box, Flex, Spinner} from "theme-ui"
import {CSSTransition, TransitionGroup} from "react-transition-group"
import {Success} from "./icons"
import React, {useState} from "react"
import {delay} from "../common/async"

export interface ProgressIndicatorParams {
  processingState: string
  isSuccess?: boolean
}

const successIndicatorClass = "successIndicator"
export const ProgressIndicator = ({processingState, isSuccess}: ProgressIndicatorParams) => <Flex sx={{
  alignItems: "center",
  [`.${successIndicatorClass}-enter`]: {
    opacity: 0.01,
    transform: "scale(1.1)",
  },

  [`.${successIndicatorClass}-enter-active`]: {
    opacity: 1,
    transform: "scale(1)",
    transition: "all 1000ms",
  },

}}>
  <TransitionGroup
    component={null}
  >{
    isSuccess ? <CSSTransition classNames={successIndicatorClass} timeout={300}>
        <Success height="4em"/>
      </CSSTransition> :
      <>
        <Spinner/>
        <Box sx={{
          textAlign: "center",
          flexGrow: 1,
        }}>{processingState}</Box>
      </>
  }</TransitionGroup>
</Flex>

export const useSuccessIndicator = (indicationDurationMs: number = 2000): [boolean, () => Promise<void>] => {
  const [isSuccess, setIsSuccess] = useState(false)

  return [isSuccess, async () => {
    setIsSuccess(true)
    await delay(indicationDurationMs)
    setIsSuccess(false)
  }]
}
