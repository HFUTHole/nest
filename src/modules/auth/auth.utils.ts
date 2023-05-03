import * as argon2 from 'argon2'
import * as crypto from 'crypto'

// TODO 加盐
export function encryptPassword(password: string) {
  const hash = crypto.createHash('sha256').update(password).digest('hex')
  return argon2.hash(
    hash.substring(0, hash.length / 2) +
      password +
      hash.substring(hash.length / 2, hash.length),
  )
}

export function verifyPassword(hashPwd: string, password: string) {
  const hash = crypto.createHash('sha256').update(password).digest('hex')
  return argon2.verify(
    hashPwd,
    hash.substring(0, hash.length / 2) +
      password +
      hash.substring(hash.length / 2, hash.length),
  )
}
