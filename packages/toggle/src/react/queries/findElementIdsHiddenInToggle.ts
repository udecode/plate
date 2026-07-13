import type { Element } from '@platejs/plite';

import { buildToggleIndex } from '../toggleIndexAtom';

export const findElementIdsHiddenInToggle = (
  openToggleIds: Set<string>,
  elements: readonly Element[]
): string[] => {
  const toggleIndex = buildToggleIndex(elements);

  return elements
    .filter((element) => {
      if (typeof element.id !== 'string') return false;

      const enclosingToggleIds = toggleIndex.get(element.id) ?? [];

      return enclosingToggleIds.some(
        (toggleId) => !openToggleIds.has(toggleId)
      );
    })
    .flatMap((element) => (typeof element.id === 'string' ? [element.id] : []));
};
