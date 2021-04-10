import * as React from "react"
import { Header } from "./header"

export const Layout = ({ children }: { children: JSX.Element | JSX.Element[] }) => (
  <>
    <Header />
    <main>{children}</main>
  </>
)
