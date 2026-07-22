import type { RootKey, Selection } from '@platejs/plite';

import { MAIN_ROOT_KEY } from '../root-key';

const cloneSelection = (selection: Selection): Selection =>
  selection ? structuredClone(selection) : null;

export const getSelectionRoot = (selection: Selection): RootKey | null => {
  if (!selection) {
    return null;
  }

  return (selection.anchor.root ??
    selection.focus.root ??
    MAIN_ROOT_KEY) as RootKey;
};

export const createRootSelectionCache = () => {
  const selections = new Map<RootKey, Selection>();

  return {
    get: (root: RootKey): Selection =>
      cloneSelection(selections.get(root) ?? null),
    record: (
      selection: Selection,
      root: RootKey | null = getSelectionRoot(selection)
    ) => {
      if (!selection || !root) {
        return;
      }

      selections.set(root, cloneSelection(selection));
    },
  };
};
