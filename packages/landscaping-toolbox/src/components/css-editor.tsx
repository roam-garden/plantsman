import {Box} from "theme-ui"
import {Controlled as CodeMirror} from "react-codemirror2"
import {Annotation} from "codemirror"
import React from "react"
import 'codemirror/mode/css/css'
import 'codemirror/addon/lint/lint'
import 'codemirror/addon/lint/css-lint'
import 'codemirror/lib/codemirror.css'
import 'codemirror/addon/lint/lint.css'

// @ts-ignore
window.CSSLint = require('csslint').CSSLint

interface CssEditorParams {
  cssCode: string
  setCssCode: (value: string) => void

  cssValid: boolean
  setCssValid: (value: boolean) => void
}

/**
 * Making it a proper component interferes with CodeMirror rendering somehow (cursor disappearance?)
 */
export const CssEditor = ({cssCode, setCssCode, cssValid, setCssValid}: CssEditorParams) =>
  <Box
    sx={{
      marginBottom: "1em",
      borderRadius: "8px",
      ".CodeMirror": {
        maxHeight: "20em",

        ".CodeMirror-scroll": {
          height: "100%",
        },
      },
      ...(cssValid ? {} : styles.invalid),
    }}
  >
    <CodeMirror
      value={cssCode}
      options={{
        mode: 'css',
        lineNumbers: true,
        gutters: ["CodeMirror-lint-markers"],
        lint: {
          onUpdateLinting(annotationsNotSorted: Annotation[]) {
            setCssValid(annotationsNotSorted.length === 0)
          },
        },
      }}
      onBeforeChange={(editor, data, value) => {
        setCssCode(value)
      }}
      onKeyHandled={(_, __, e) => e.stopPropagation()}
    />
  </Box>

const styles = {
  invalid: {
    borderColor: "var(--ck-color-base-error,#db3700)",
    boxShadow: "0 0 0 2px var(--ck-color-focus-error-shadow,rgba(255,64, 31, 0.3))",
  },
}
