import { Transform } from 'class-transformer'
import { applyDecorators } from '@nestjs/common'
import { Column } from 'typeorm'
import { ColumnCommonOptions } from 'typeorm/decorator/options/ColumnCommonOptions'
import { ColumnWithWidthOptions } from 'typeorm/decorator/options/ColumnWithWidthOptions'

export const TimestampTransformer = {
  from: (value: number): Date => {
    return new Date(+value)
  },
  to: (value: Date) => {
    if (!value) return value
    return value.getTime()
  },
}

export const Timestamp = (
  options?: ColumnCommonOptions & ColumnWithWidthOptions,
) => {
  const transformer = Transform(({ value, type }) => {
    if (value)
      return type === 1
        ? (value as Date).getTime()
        : type === 0
        ? new Date(value)
        : value
  })
  if (!options) return applyDecorators(transformer)
  return applyDecorators(
    Column(
      'bigint',
      Object.assign({}, options, {
        transformer: options.transformer
          ? options.transformer instanceof Array
            ? options.transformer.push(TimestampTransformer)
            : [options.transformer, TimestampTransformer]
          : TimestampTransformer,
      }),
    ),
    transformer,
  )
}
