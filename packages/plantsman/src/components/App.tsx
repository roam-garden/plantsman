import * as React from "react"
import Amplify from "aws-amplify"
import amplifyConfig from "../aws-exports"
import { withAuthenticator } from "@aws-amplify/ui-react"
import { UploadForm } from "@roam-garden/landscaping-toolbox"
import { getAllPageNames } from "roam-client"
import { generateRoamExport } from "../roam"

Amplify.configure({
  ...amplifyConfig,
  // Need this to do the user migration to new UserPool
  authenticationFlowType: "USER_PASSWORD_AUTH",
})

export const App = () => {
  return <UploadForm allPageNames={getAllPageNames()} roamDataSupplier={generateRoamExport} />
}

export default withAuthenticator(App)
