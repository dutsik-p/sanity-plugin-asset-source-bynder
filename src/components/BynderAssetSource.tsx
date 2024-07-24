import {SearchIcon} from '@sanity/icons'
import {Dialog, Flex, Spinner, Stack, Text} from '@sanity/ui'
import React from 'react'
import InfiniteScroll from 'react-infinite-scroll-component'
import PhotoAlbum from 'react-photo-album'
import {BehaviorSubject, type Subscription} from 'rxjs'
import {type AssetFromSource, type AssetSourceComponentProps} from 'sanity'

import {fetchDownloadUrl, search} from '../datastores/bynder'
import {BynderConfig} from '../index'
import type {BynderPhoto} from '../types'
import {SearchInput} from './BynderAssetSource.styled'
import Photo from './Photo'

type State = {
  query: string
  searchResults: BynderPhoto[][]
  page: number
  hasMore: boolean
  cursor: number
}

const RESULTS_PER_PAGE = 42
const PHOTO_SPACING = 2
const PHOTO_PADDING = 1 // offset the 1px border width

class BynderAssetSourceInternal extends React.Component<
  AssetSourceComponentProps & {config: BynderConfig},
  State
> {
  static defaultProps = {
    selectedAssets: undefined,
  }

  state = {
    cursor: 0,
    query: '',
    page: 1,
    searchResults: [[]],
    hasMore: true,
  }

  searchSubscription: Subscription | null = null

  searchSubject$ = new BehaviorSubject('')
  pageSubject$ = new BehaviorSubject(1)

  componentDidMount() {
    this.searchSubscription = search(
      this.props.config,
      this.searchSubject$,
      this.pageSubject$,
      RESULTS_PER_PAGE,
    ).subscribe({
      next: (results: BynderPhoto[]) => {
        this.setState((prev) => ({
          searchResults: [...prev.searchResults, results],
          hasMore: results.length === RESULTS_PER_PAGE,
        }))
      },
    })
  }

  componentWillUnmount() {
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe()
    }
  }

  handleSelect = async (photo: BynderPhoto) => {
    const downloadUrl = fetchDownloadUrl(this.props.config, photo)
    const description = photo.description || ''
    const title = photo.name || ''
    const asset: AssetFromSource = {
      kind: 'url',
      value: downloadUrl,
      assetDocumentProps: {
        _type: 'sanity.imageAsset',
        source: {
          name: 'bynder',
          id: photo.id,
          url: photo.transformBaseUrl,
        },
        ...(description && {description}),
        ...(title && {title}),
        creditLine: `${photo.userCreated} by Bynder`,
      } as never,
    }
    this.props.onSelect([asset])
  }

  handleClose = () => {
    this.props.onClose()
  }

  handleSearchTermChanged = (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.currentTarget.value
    this.setState({query, page: 1, searchResults: [[]], cursor: 0})
    this.pageSubject$.next(1)
    this.searchSubject$.next(query)
  }

  handleSearchTermCleared = () => {
    this.setState({query: '', page: 1, searchResults: [[]], cursor: 0})
    this.pageSubject$.next(1)
    this.searchSubject$.next('')
  }

  scrollerLoadMore = () => {
    // eslint-disable-next-line react/no-access-state-in-setstate
    const nextPage = this.state.page + 1
    this.setState({page: nextPage})
    this.pageSubject$.next(nextPage)
    this.searchSubject$.next(this.state.query)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handleKeyDown = (event: any) => {
    const {cursor} = this.state
    if ((event.keyCode === 38 || event.keyCode === 37) && cursor > 0) {
      this.setState((prevState) => ({
        cursor: prevState.cursor - 1,
      }))
    } else if (
      (event.keyCode === 40 || event.keyCode === 39) &&
      cursor < this.getPhotos().length - 1
    ) {
      this.setState((prevState) => ({
        cursor: prevState.cursor + 1,
      }))
    }
  }

  getPhotos() {
    return this.state.searchResults.flat()
  }

  handleUpdateCursor = (photo: BynderPhoto) => {
    const index = this.getPhotos().findIndex((result: BynderPhoto) => result.id === photo.id)
    this.setState({cursor: index})
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  renderImage = (props: any) => {
    const {photo, layout} = props
    const active =
      this.getPhotos().findIndex((result: BynderPhoto) => result.id === photo.data.id) ===
        this.state.cursor || false
    return (
      <Photo
        onClick={this.handleSelect.bind(photo.data)}
        thumbnailPropName={this.props.config.thumbnailTransformerName}
        onKeyDown={this.handleKeyDown}
        data={photo.data}
        width={layout.width}
        height={layout.height}
        active={active}
        onFocus={this.handleUpdateCursor}
      />
    )
  }

  render() {
    const {query, searchResults, hasMore} = this.state

    return (
      <Dialog
        animate
        id="bynder-asset-source"
        header="Select image from Bynder"
        onClose={this.handleClose}
        open
        width={4}
      >
        <Stack space={3} paddingX={4} paddingBottom={4}>
          <SearchInput
            clearButton={query.length > 0}
            icon={SearchIcon}
            onChange={this.handleSearchTermChanged}
            onClear={this.handleSearchTermCleared}
            placeholder="Search by topics or colors"
            value={query}
          />
          <InfiniteScroll
            dataLength={this.getPhotos().length} // This is important field to render the next data
            next={this.scrollerLoadMore}
            // scrollableTarget="bynder-scroller"
            hasMore={hasMore}
            scrollThreshold={0.99}
            height="60vh"
            loader={
              <Flex align="center" justify="center" padding={3}>
                <Spinner muted />
              </Flex>
            }
            endMessage={
              <Flex align="center" justify="center" padding={3}>
                <Text size={1} muted>
                  That&lsquo;s all we have found so far
                </Text>
              </Flex>
            }
          >
            {searchResults
              .filter((photos) => {
                return photos.length > 0
              })
              .map((photos: BynderPhoto[], index) => {
                return (
                  <PhotoAlbum
                    // eslint-disable-next-line react/no-array-index-key
                    key={`gallery-${query || 'popular'}-${index}`}
                    layout="rows"
                    spacing={PHOTO_SPACING}
                    padding={PHOTO_PADDING}
                    targetRowHeight={(width) => {
                      if (width < 300) return 150
                      if (width < 600) return 200
                      return 300
                    }}
                    photos={photos.map((photo: BynderPhoto) => ({
                      src: photo.thumbnails[this.props.config.thumbnailTransformerName],
                      width: photo.width,
                      height: photo.height,
                      key: photo.id,
                      data: photo,
                    }))}
                    renderPhoto={this.renderImage}
                    componentsProps={{
                      containerProps: {style: {marginBottom: `${PHOTO_SPACING}px`}},
                    }}
                  />
                )
              })}
          </InfiniteScroll>
        </Stack>
      </Dialog>
    )
  }
}

export default function BynderAssetSource(
  props: AssetSourceComponentProps & {config: BynderConfig},
) {
  return <BynderAssetSourceInternal {...props} />
}
