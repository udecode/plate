import { describe, expect, it } from 'bun:test';

import { getSearchResultGroup } from './search-result-groups';

describe('getSearchResultGroup', () => {
  it('keeps first-party API reference pages separate from docs API sections', () => {
    expect(
      getSearchResultGroup({
        content: '`insertNode`',
        id: 'editor-transforms-insert-node',
        type: 'heading',
        url: '/docs/api/slate/editor-transforms#insertnode',
      })
    ).toBe('apiReference');
  });

  it('uses search-index metadata for docs API sections', () => {
    expect(
      getSearchResultGroup({
        content: '`api.footnote.duplicateDefinitions`',
        id: 'footnote-api-duplicate-definitions',
        section: 'docsApi',
        type: 'heading',
        url: '/docs/footnote#apifootnoteduplicatedefinitions',
      })
    ).toBe('docsApiSections');
  });

  it('keeps ordinary docs results in documentation', () => {
    expect(
      getSearchResultGroup({
        content: 'Create your first editor',
        id: 'create-your-first-editor',
        type: 'heading',
        url: '/docs/installation/react#create-your-first-editor',
      })
    ).toBe('documentation');
  });

  it('does not treat plugin breadcrumbs as API evidence by themselves', () => {
    expect(
      getSearchResultGroup({
        breadcrumbs: ['Docs', 'Plugins'],
        content: 'Footnote',
        id: 'footnote',
        type: 'page',
        url: '/docs/footnote',
      })
    ).toBe('documentation');
  });
});
