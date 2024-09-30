import { matchSorter } from 'match-sorter';

import type { Action } from '../types';

import { buildMenuTree } from './buildMenuTree';
import { flattenMenuTree } from './flattenMenuTree';

export function filterAndBuildMenuTree(
  actions: Action[],
  searchValue: string
): Action[] | null {
  if (!searchValue) return null;

  const options = flattenMenuTree(actions);

  const matches = matchSorter(options, searchValue, {
    keys: ['label', 'group', 'value', 'keywords'],
  });

  return buildMenuTree(matches.slice(0, 15));
}
