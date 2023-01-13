export const createResponse = <T extends object>(msg: string, data: T = {} as T, code = 200) => {
  return {
    data,
    msg,
    code,
  }
}
