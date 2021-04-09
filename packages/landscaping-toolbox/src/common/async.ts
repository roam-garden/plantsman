export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export async function executeAfterDelay<T>(ms: number, block: () => T) {
  await delay(ms)
  return block()
}
