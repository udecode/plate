import type { SortedResult } from 'fumadocs-core/search';

const API_DOCS_PATH_REGEX = /^\/(?:cn\/)?docs\/api(?:\/|$)/;
const DOCS_PATH_REGEX = /^\/(?:cn\/)?docs(?:\/|$)/;

export type SearchResult = SortedResult<string> & {
  section?: 'docsApi';
};
export type SearchResultGroup =
  | 'apiReference'
  | 'docsApiSections'
  | 'documentation';

export const searchResultGroupOrder: SearchResultGroup[] = [
  'apiReference',
  'docsApiSections',
  'documentation',
];

export function getSearchResultKey(item: SearchResult) {
  return `${item.url}:${item.type}:${item.content}`;
}

export function getSearchResultGroup(item: SearchResult): SearchResultGroup {
  if (API_DOCS_PATH_REGEX.test(item.url)) {
    return 'apiReference';
  }

  if (!DOCS_PATH_REGEX.test(item.url)) {
    return 'documentation';
  }

  if (item.section === 'docsApi') {
    return 'docsApiSections';
  }

  return 'documentation';
}
