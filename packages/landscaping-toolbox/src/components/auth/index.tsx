import {AmplifyAuthenticator, AmplifyContainer, AmplifySignUp} from "@aws-amplify/ui-react"
import React, {ComponentPropsWithRef, ComponentType, FunctionComponent, useEffect, useState} from 'react'
import {AuthState, onAuthUIStateChange} from '@aws-amplify/ui-components'
import {Auth} from "aws-amplify"

export const signUpWithUsernameFields = [
  {
    type: 'username',
    label: 'Username (your garden address will be based on it) *',
  },
  {type: 'password'},
  {type: 'email'},
]

/**
 * Mostly replicating withAuthenticator from amplify lib, but with custom fields.
 * Haven't found an easier way. If I just wrap component - something weird happens to styling
 */
export function withAuth(
  Component: ComponentType,
  authenticatorProps?: ComponentPropsWithRef<typeof AmplifyAuthenticator>,
) {
  const AppWithAuthenticator: FunctionComponent = props => {
    const [signedIn, setSignedIn] = useState(false)

    React.useEffect(() => {
      // checkUser returns an "unsubscribe" function to stop side-effects
      return checkUser()
    }, [])

    function checkUser() {
      setUser()

      return onAuthUIStateChange(authState => {
        if (authState === AuthState.SignedIn) {
          setSignedIn(true)
        } else if (authState === AuthState.SignedOut) {
          setSignedIn(false)
        }
      })
    }

    async function setUser() {
      try {
        const user = await Auth.currentAuthenticatedUser()
        if (user) setSignedIn(true)
      } catch (err) {
        console.log(err)
      }
    }

    if (!signedIn) {
      return (
        <AmplifyContainer>
          <AmplifyAuthenticator {...authenticatorProps} {...props}>
            <AmplifySignUp slot="sign-up" formFields={signUpWithUsernameFields}/>
          </AmplifyAuthenticator>
        </AmplifyContainer>
      )
    }
    return <Component/>
  }

  return AppWithAuthenticator
}

export function useGetUser() {
  const [user, setUser] = useState("")

  useEffect(() => {
    (async () => {
      try {
        const user = await Auth.currentAuthenticatedUser()
        setUser(user.getUsername())
      } catch (e) {
        console.log("Can't fetch user", e)
      }
    })()
  }, [])

  return user
}
