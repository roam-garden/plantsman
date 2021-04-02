import {useState} from "react"

export function useLocalState<T>(name: string, initial: T): [T, (value: T) => void]
export function useLocalState<T = undefined>(name: string, initial?: T): [T | undefined, (value: T | undefined) => void] {
  // for Gatsby build: https://www.gatsbyjs.com/docs/debugging-html-builds/#how-to-check-if-window-is-defined
  const storage = typeof window !== `undefined` ? window.localStorage : undefined

  const initialWrapper = JSON.parse(storage?.getItem(name) || "{}")
  const initialValue = initialWrapper?.value !== undefined ? initialWrapper?.value as T : initial
  const [get, set] = useState(initialValue)

  return [get, (value: T | undefined) => {
    set(value)
    storage?.setItem(name, JSON.stringify({value}))
  }]
}
