const API_LIST_ANCHOR_SEGMENTS: Record<string, string> = {
  api: 'api',
  attributes: 'attrs',
  methods: 'methods',
  options: 'opt',
  parameters: 'params',
  props: 'props',
  returns: 'returns',
  state: 'state',
  transforms: 'tf',
};

const NON_ALPHANUMERIC_REGEX = /[^\da-z]+/g;
const EDGE_DASH_REGEX = /^-|-$/g;

/** The id of an `<API name>` list heading, such as `Properties-attrs`. */
export function apiListAnchor(apiName: string, listType: string) {
  return `${apiName}-${API_LIST_ANCHOR_SEGMENTS[listType]}`;
}

/**
 * The id of an `<APIItem>` or `<APISubListItem>` row, such as
 * `properties-attrs-decorate`.
 */
export function apiItemAnchor(
  apiName: string,
  listType: string | undefined,
  ...names: string[]
) {
  return [
    apiName,
    ...(listType ? [API_LIST_ANCHOR_SEGMENTS[listType]] : []),
    ...names,
  ]
    .join('-')
    .toLowerCase()
    .replace(NON_ALPHANUMERIC_REGEX, '-')
    .replace(EDGE_DASH_REGEX, '');
}

/** The id of an `<APIReference package symbol>` section. */
export function apiReferenceAnchor(packageName: string, symbol: string) {
  return `api-${packageName}-${symbol}`
    .toLowerCase()
    .replace(NON_ALPHANUMERIC_REGEX, '-');
}
