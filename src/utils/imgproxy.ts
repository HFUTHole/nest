import { generateImageUrl, IGenerateImageUrl } from '@imgproxy/imgproxy-node'
import { AppConfig } from '@/app.config'

export const generateImgProxyUrl = (
  config: AppConfig,
  url: string,
  options: IGenerateImageUrl['options'] = {},
) => {
  const urlValue = url.replace('static', '')

  return generateImageUrl({
    endpoint: config.image.url,
    url: {
      value: `local:///${urlValue}`,
      displayAs: 'plain',
    },
    options: {
      q: 30,
      ...options,
    },
  })
}
