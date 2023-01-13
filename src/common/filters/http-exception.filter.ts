import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common'
import { Response } from 'express'
import { isString } from 'class-validator'

@Catch(HttpException)
export class HttpExceptionFilter<T extends HttpException>
  implements ExceptionFilter
{
  catch(exception: T, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()

    const status = exception.getStatus()
    const exceptionResponse = exception.getResponse()

    const error = isString(exceptionResponse)
      ? { msg: exceptionResponse }
      : {
          statusCode: (exceptionResponse as any).statusCode,
          msg: (exceptionResponse as any).message,
          error: (exceptionResponse as any).error,
        }

    response.status(status).json({
      ...error,
      time: new Date().toISOString(),
    })
  }
}
