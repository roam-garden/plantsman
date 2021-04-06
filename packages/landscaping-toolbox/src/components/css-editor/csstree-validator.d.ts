declare module "csstree-validator/dist/csstree-validator" {
  export interface SyntaxError {
    line: number
    offset: number
    column: number
    message?: string
    reference?: string
  }

  function validate(code: string): SyntaxError[];
}
