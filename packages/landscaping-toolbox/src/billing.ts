import {CognitoUser, CognitoUserAttribute} from "amazon-cognito-identity-js"
import {Auth} from "aws-amplify"

const StripeAttributes = {
  subscriptionEnd: "custom:StripeSubEnd",
}

const getUserAttributes = (user: CognitoUser) =>
  new Promise<CognitoUserAttribute[] | undefined>(((resolve, reject) => {
    user.getUserAttributes((err, data) => {
      if (err !== null) reject(err)
      else resolve(data)
    })
  }))


export async function getSubscriptionAttribute(user: CognitoUser) {
  const attrs = await getUserAttributes(user)

  return attrs?.find(it => it.getName() === StripeAttributes.subscriptionEnd)
}

export const hasValidSubscription = async (user: CognitoUser) => {
  const endDate = await getSubscriptionAttribute(user)
  if (!endDate) return false

  return new Date(endDate.getValue()) > new Date()
}

export const currentUserHasValidSubscription = async () => {
  const user = await Auth.currentAuthenticatedUser()
  return hasValidSubscription(user)
}
