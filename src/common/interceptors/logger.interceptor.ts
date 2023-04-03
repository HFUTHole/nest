import {
  CallHandler,
  ExecutionContext,
  Inject,
  Injectable,
  LoggerService,
  NestInterceptor,
} from '@nestjs/common'
import { Observable, catchError } from 'rxjs'
import { tap } from 'rxjs/operators'
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston'
import { Request } from 'express'
import { isNotEmptyObject } from 'class-validator'

@Injectable()
export class LoggerInterceptor implements NestInterceptor {
  @Inject(WINSTON_MODULE_NEST_PROVIDER)
  private readonly logger: LoggerService

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const now = Date.now()
    const request = context.switchToHttp().getRequest() as Request

    const logBaseInfo = `[${context.getClass().name}]${context.getHandler().name}(${
      request.url
    }): ${request.user?.studentId || request.body?.studentId}(${request.ip})`

    return next.handle().pipe(
      tap(() => {
        this.logger.log(`${logBaseInfo} cost: ${Date.now() - now}ms`)
      }),
      catchError((err) => {
        this.logger.error(
          `${logBaseInfo} ${err.stack} \ninputs: ${JSON.stringify(
            isNotEmptyObject(request.params) ? request.params : request.body,
          )} cost: ${Date.now() - now}ms\n`,
        )
        throw err
      }),
    )
  }
}
