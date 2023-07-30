export const ellipsisBody = (str: string, len: number) => {
  return `${str.slice(0, len)}${str.length > len ? '...' : ''}`
}
