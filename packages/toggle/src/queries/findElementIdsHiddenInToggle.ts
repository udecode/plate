import type { TIndentElement } from '@udecode/plate-indent';

import { buildToggleIndex } from '../toggle-controller-store';

export const findElementIdsHiddenInToggle = (
  openToggleIds: Set<string>,
  elements: TIndentElement[]
): string[] => {
  const toggleIndex = buildToggleIndex(elements);

  return elements
    .filter((element) => {
      const enclosingToggleIds = toggleIndex.get(element.id as string) || [];

      return enclosingToggleIds.some(
        (toggleId) => !openToggleIds.has(toggleId)
      );
    })
    .map((element) => element.id as string);
};
