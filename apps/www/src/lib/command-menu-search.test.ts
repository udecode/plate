import { describe, expect, it } from 'bun:test';

import { getCommandMenuSearchState } from './command-menu-search';

describe('getCommandMenuSearchState', () => {
  it('treats input ahead of the debounced docs query as pending', () => {
    expect(
      getCommandMenuSearchState({
        docsSearch: '',
        inputSearch: 'duplicate',
        isQueryLoading: false,
        minSearchLength: 2,
      }).isPending
    ).toBe(true);
  });

  it('keeps results hidden while the matching docs query is loading', () => {
    const state = getCommandMenuSearchState({
      docsSearch: 'duplicate',
      inputSearch: 'duplicate',
      isQueryLoading: true,
      minSearchLength: 2,
    });

    expect(state.isPending).toBe(true);
    expect(state.shouldShowSearchResults).toBe(false);
  });

  it('shows results only after the debounced query is current and loaded', () => {
    const state = getCommandMenuSearchState({
      docsSearch: 'duplicate',
      inputSearch: 'duplicate',
      isQueryLoading: false,
      minSearchLength: 2,
    });

    expect(state.isPending).toBe(false);
    expect(state.shouldShowSearchResults).toBe(true);
  });
});
