export interface IUser {
  id: number
  studentId: number
  iat: number
  exp: number
}

declare global {
  // eslint-disable-next-line no-unused-vars
  namespace Express {
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface User extends IUser {}
  }
}
