import * as React from "react"
import Amplify from "aws-amplify"
import amplifyConfig from "../aws-exports"
import { UploadForm, withAuth } from "@roam-garden/landscaping-toolbox"
import { getAllPageNames } from "roam-client"
import { generateRoamExport } from "../roam"
import { Box, Heading, ThemeProvider } from "theme-ui"
import theme from "../theme"
import { Layout } from "../navigation/layout"

Amplify.configure({
  ...amplifyConfig,
  // Need this to do the user migration to new UserPool
  authenticationFlowType: "USER_PASSWORD_AUTH",
})

const AuthenticatedApp = withAuth(() => (
  <Layout>
    <Box
      id="subscription-modal-parent"
      sx={{
        marginBottom: "1em",
        // a bit of a hack to shift the parent element for modal
        transform: "scale(1)",
      }}
    >
      <Heading
        as={"h2"}
        sx={{
          textAlign: "center",
          fontSize: "2.5rem",
        }}
      >
        Plant a garden
      </Heading>
      <UploadForm allPageNames={getAllPageNames()} roamDataSupplier={generateRoamExport} />
    </Box>
  </Layout>
))

export const App = () => (
  <ThemeProvider theme={theme}>
    <Box
      sx={{
        // prevent Amplify from taking up the whole screen space
        "amplify-container": {
          height: "auto",
        },
        "amplify-authenticator": {
          "--container-height": "auto",
        },
      }}
    >
      <AuthenticatedApp />
    </Box>
  </ThemeProvider>
)

export default App
