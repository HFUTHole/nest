import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston'
import { Inject } from '@nestjs/common'

export const InjectLogger = () => Inject(WINSTON_MODULE_NEST_PROVIDER)
