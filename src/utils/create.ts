import { registerDecorator, ValidationOptions } from 'class-validator'

export const createResponse = <T extends object>(
  msg: string,
  data: T = {} as T,
  code = 200,
) => {
  return {
    data,
    msg,
    code,
  }
}

export const createClassValidator = (cls: { new (...args: any[]): any }) => {
  return (validationOptions?: ValidationOptions) => {
    return function (object: any, propertyName: string) {
      registerDecorator({
        target: object.constructor,
        propertyName,
        options: validationOptions,
        constraints: [],
        validator: cls,
      })
    }
  }
}
