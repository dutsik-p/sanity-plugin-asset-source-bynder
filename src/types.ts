/**
 * @public
 */
export interface Asset {
  kind: 'url' | 'base64' | 'file' | 'assetDocumentId'
  value: string | File
  assetDocumentProps?: {
    originalFileName?: string
    label?: string
    title?: string
    description?: string
    source?: {
      id: string
      name: string
      url?: string
    }
    creditLine?: string
  }
}

/**
 * @public
 */
export interface AssetDocument {
  _id: string
  label?: string
  title?: string
  description?: string
  source?: {
    id: string
    name: string
    url?: string
  }
  creditLine?: string
  originalFilename?: string
}

interface File {
  url: string
  width?: number
  height?: number
  fileSize?: number
  isFakeOriginal?: boolean
}

export interface BynderPhoto {
  dateModified: string
  type: string
  brandId: string
  fileSize: number
  id: string
  height: number
  description: string
  idHash: string
  name: string
  tags: string[]
  orientation: string
  width: number
  datePublished: string
  copyright: string
  extension: string[]
  userCreated: string
  dateCreated: string
  archive: number
  watermarked: number
  limited: number
  isPublic: number
  thumbnails: {
    mini: string
    webimage: string
    thumbnail: string
    [key: string]: string // To handle dynamic keys like "67E391FA"
  }
  videoPreviewURLs?: string[]
  original?: string
  transformBaseUrl: string
}
