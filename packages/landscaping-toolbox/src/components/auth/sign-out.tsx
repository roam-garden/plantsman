import React from 'react'

import {Auth} from '@aws-amplify/auth'
import {Button} from "theme-ui"

async function signOut() {
    try {
        await Auth.signOut()
        // todo pass in action?
        // await navigate("/")
    } catch (error) {
        console.log('error signing out: ', error)
    }
}

export const SignOut = () =>
    <Button onClick={signOut}
            sx={{
                backgroundColor: "#f90",
                paddingLeft: "2em",
                paddingRight: "2em",
            }}
    >Sign Out</Button>
