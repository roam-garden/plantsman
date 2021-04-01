import * as React from "react"
import Amplify from "aws-amplify"
import amplifyConfig from "../amplify/config"
import {withAuthenticator} from '@aws-amplify/ui-react'
import {UploadForm} from "@roam-garden/landscaping-toolbox"

Amplify.configure({
    ...amplifyConfig,
    // Need this to do the user migration to new UserPool
    authenticationFlowType: 'USER_PASSWORD_AUTH',
})


// const reactLogo = require("./../assets/img/react_logo.svg");
// import "./../assets/scss/App.scss";

export const App = () => <UploadForm/>


declare let module: Record<string, unknown>

export default withAuthenticator(App)
