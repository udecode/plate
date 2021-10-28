import { Dispatch, SetStateAction, useMemo, useState } from 'react';
import { getRenderLeaf, PlatePlugin } from '@udecode/plate-core';
import { MARK_SEARCH_HIGHLIGHT } from './defaults';
import { getSearchHighlightDecorate } from './getSearchHighlightDecorate';

/**
 * Supports search highlight.
 * TODO: replace
 */
export const useFindReplacePlugin = (): {
  plugin: PlatePlugin;
  setSearch: Dispatch<SetStateAction<string>>;
} => {
  const [search, setSearch] = useState('');

  return {
    plugin: useMemo(
      () => ({
        renderLeaf: getRenderLeaf(MARK_SEARCH_HIGHLIGHT),
        decorate: getSearchHighlightDecorate({ search }),
      }),
      [search]
    ),
    setSearch,
  };
};
