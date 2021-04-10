import React from 'react'

import {Auth, Hub} from 'aws-amplify'
import {Button} from "theme-ui"
import {AuthState} from "@aws-amplify/ui-components"

async function signOut() {
  try {
    await Auth.signOut()

    // copied from https://github.com/aws-amplify/amplify-js/blob/df95ea3724eb6406f64b03f25086cd3e8644cb5f/packages/amplify-ui-components/src/common/helpers.ts#L34
    // to make the component re-render properly
    Hub.dispatch('UI Auth', {
      event: 'AuthStateChange',
      message: AuthState.SignedOut,
    });

  } catch (error) {
    console.log('error signing out: ', error)
  }
}

export interface SignOutProps {
  onSignOut?: () => void
}

export const SignOut = ({onSignOut}: SignOutProps) =>
  <Button onClick={async () => {
    await signOut()
    onSignOut?.()
  }}
          sx={{
            backgroundColor: "#f90",
            paddingLeft: "2em",
            paddingRight: "2em",
          }}
  >Sign Out</Button>
