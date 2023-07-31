export const isNullable = (val: unknown): val is null | undefined =>
  typeof val === 'undefined' || val === null
