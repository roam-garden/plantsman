import React from "react"
import {Box, Link as A} from 'theme-ui'
import {UserIcon} from "../icons"
import {useGetUser} from "../auth"


export function UserIndicator() {
  const user = useGetUser()

  return <A href="https://roam.garden/user" target="_blank" sx={styles.loginBtn}>
    <Box sx={{marginRight: "0.2em"}}>
      <UserIcon/>
    </Box>
    {user}
  </A>
}

const styles = {
  loginBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    fontSize: '15px',
    color: '#0F2137',
    fontWeight: 500,
    mr: '20px',
    img: {
      mr: '9px',
    },
  },
}
