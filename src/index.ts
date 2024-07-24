import {AssetSource, definePlugin} from 'sanity'

import Bynder from './components/BynderAssetSource'
import Icon from './components/Icon'

export type {Asset, AssetDocument, BynderPhoto} from './types'

export interface BynderConfig {
  name: string
  apiToken: string
  menuTitle: string
  thumbnailTransformerName: string
  portalDomain: string
}

/**
 * @public
 */
export const bynderAssetSource = (config: BynderConfig): AssetSource => ({
  name: config.name,
  i18nKey: config.menuTitle,
  component: (props) => Bynder({...props, config}),
  icon: Icon,
})

/**
 * @public
 */
export const bynderImageAsset = definePlugin((config: Partial<BynderConfig>) => {
  const reqConfig: BynderConfig = {
    name: 'bynder',
    apiToken: '',
    portalDomain: '',
    menuTitle: 'Bynder',
    thumbnailTransformerName: 'transformBaseUrl',
    ...config,
  }

  //Normalize portalDomain
  let normalizedDomain = reqConfig.portalDomain
  if (!/^https?:\/\//i.test(normalizedDomain)) {
    normalizedDomain = `https://${normalizedDomain}`
  }
  if (!normalizedDomain.endsWith('/')) {
    normalizedDomain += '/'
  }
  reqConfig.portalDomain = normalizedDomain

  //validate portalDomain so it is a valid url without path and query
  if (!/^https?:\/\/[^/]+\/$/.test(reqConfig.portalDomain)) {
    throw new Error('portalDomain must be a valid url without path and query.')
  }

  // Validate apiToken
  if (!reqConfig.apiToken) {
    throw new Error('apiToken cannot be empty.')
  }

  return {
    name: 'asset-source-bynder-plugin',
    form: {
      image: {
        assetSources: (prev) => {
          return [...prev, bynderAssetSource(reqConfig)]
        },
      },
    },
  }
})
