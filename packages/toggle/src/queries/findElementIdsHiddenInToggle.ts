import { TIndentElement } from '@udecode/plate-indent';

import { buildToggleIndex } from './getEnclosingToggleIds';

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
