import { Dispatch, SetStateAction, useMemo, useState } from 'react';
import { PlatePlugin } from '@udecode/plate-core';
import { createFindReplacePlugin } from './createFindReplacePlugin';

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
    plugin: useMemo(() => createFindReplacePlugin({ search }), [search]),
    setSearch,
  };
};
