import {CognitoUser} from "amazon-cognito-identity-js"
import {useEffect, useState} from "react"
import {Auth} from 'aws-amplify'

export const useUser = () => {
  const [user, setUser] = useState<CognitoUser>()
  useEffect(() => {
    (async () => {
      const user: CognitoUser = await Auth.currentAuthenticatedUser()
      setUser(user)
    })()
  }, [])

  return user
}
