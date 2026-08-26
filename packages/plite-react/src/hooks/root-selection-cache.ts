import { type RootKey, type Selection, SelectionApi } from '@platejs/plite';

import { MAIN_ROOT_KEY } from '../root-key';

const cloneSelection = (selection: Selection): Selection =>
  selection ? structuredClone(selection) : null;

export const createRootSelectionCache = () => {
  const selections = new Map<RootKey, Selection>();

  return {
    get: (root: RootKey): Selection =>
      cloneSelection(selections.get(root) ?? null),
    record: (
      selection: Selection,
      root: RootKey | null = selection
        ? (SelectionApi.root(selection) ?? MAIN_ROOT_KEY)
        : null
    ) => {
      if (!selection || !root) {
        return;
      }

      selections.set(root, cloneSelection(selection));
    },
  };
};
