import { SignOut, UserIndicator, useGetUser } from "@roam-garden/landscaping-toolbox"
import * as React from "react"
/** @jsx jsx */

import { jsx, Theme, Button, Box } from "theme-ui"

function OpenGarden() {
  const user = useGetUser()

  return (
    <Button
      sx={{
        mx: "1em",
      }}
      onClick={() => window.open(`https://${user}.roam.garden`, "_blank")}
    >
      Open Garden
    </Button>
  )
}

export const Header = () => (
  <header sx={styles.header}>
    <UserIndicator />
    <Box>
      <OpenGarden />
      <SignOut />
    </Box>
  </header>
)

const styles = {
  header: {
    py: "1em",
    display: "flex",
    justifyContent: "space-between",
    width: "100%",
    transition: "all 0.4s ease",
    borderBottom: "1px solid #E9EDF5",
    borderTop: "1px solid #E9EDF5",
    marginBottom: "1em",
  } as Theme,
}
