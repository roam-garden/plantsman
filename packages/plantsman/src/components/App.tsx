import * as React from "react";
import Amplify from "aws-amplify"
import amplifyConfig from "../amplify/config"
import { withAuthenticator, AmplifySignOut } from '@aws-amplify/ui-react';

Amplify.configure({
    ...amplifyConfig,
    // Need this to do the user migration to new UserPool
    authenticationFlowType: 'USER_PASSWORD_AUTH',
})


import { hot } from "react-hot-loader";

const reactLogo = require("./../assets/img/react_logo.svg");
import "./../assets/scss/App.scss";

class App extends React.Component<Record<string, unknown>, undefined> {
  public render() {
    return (
      <div className="app">
        <h1>Hello World!</h1>
        <p>Foo to the barz!!!</p>
        <img src={reactLogo.default} height="480" />
      </div>
    );
  }
}


declare let module: Record<string, unknown>;

export default hot(module)(withAuthenticator(App));
