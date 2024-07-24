import {type BehaviorSubject, concat, defer, from, type Observable} from 'rxjs'
import {debounceTime, switchMap, withLatestFrom} from 'rxjs/operators'

import {BynderConfig} from '../index'
import type {BynderPhoto} from '../types'

type SearchSubject = BehaviorSubject<string>
type PageSubject = BehaviorSubject<number>

const fetchAsObservable = (url: string, options?: RequestInit) => {
  return from(
    fetch(url, options).then((response) => {
      if (!response.ok) {
        throw new Error('Network response was not ok')
      }
      return response.json()
    }),
  )
}

const fetchSearch = (
  config: BynderConfig,
  query: string,
  page: number,
  perPage: number,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Observable<any> =>
  defer(
    () =>
      fetchAsObservable(
        `${config.portalDomain}api/v4/media?keyword=${encodeURIComponent(query)}&page=${page}&limit=${perPage}&type=image`,
        {
          headers: {
            Authorization: `Bearer ${config.apiToken}`,
          },
        },
      ) as never,
  )

const fetchList = (
  config: BynderConfig,
  type: string,
  page: number,
  perPage: number,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Observable<any> =>
  defer(() => {
    return fetchAsObservable(
      `${config.portalDomain}api/v4/media?orderBy=${type}&page=${page}&limit=${perPage}`,
      {
        headers: {
          Authorization: `Bearer ${config.apiToken}`,
        },
      },
    ) as never
  })

export function fetchDownloadUrl(config: BynderConfig, photo: BynderPhoto): string {
  return photo.transformBaseUrl
}

export const search = (
  config: BynderConfig,
  query: SearchSubject,
  page: PageSubject,
  resultsPerPage: number,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Observable<any> => {
  return concat(
    query.pipe(
      withLatestFrom(page),
      debounceTime(800),
      switchMap(([q, p]) => {
        if (q) {
          return fetchSearch(config, q, p, resultsPerPage)
        }
        return fetchList(config, 'dateCreated asc', p, resultsPerPage)
      }),
    ),
  )
}
