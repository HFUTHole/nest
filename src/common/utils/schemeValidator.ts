import { TypedConfigModuleOptions } from 'nest-typed-config/lib/interfaces/typed-config-module-options.interface'
import { AppConfig } from '@/app.config'

export const schemeValidator: TypedConfigModuleOptions['validate'] = (
  config: AppConfig,
) => {
  return config
}
