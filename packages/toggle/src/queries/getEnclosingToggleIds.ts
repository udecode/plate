import { KEY_INDENT, TIndentElement } from '@udecode/plate-indent';
import { KEY_LIST_STYLE_TYPE } from '@udecode/plate-indent-list';
import { memoize } from 'lodash';
import { NodeEntry } from 'slate';

import { ELEMENT_TOGGLE } from '../types';

export function getEnclosingToggleIds(
  elements: TIndentElement[],
  [_node, path]: NodeEntry
): string[] {
  // TODO Type so that there is no need to cast as indent elements
  return memoizedBuildToggleIndex(elements)[path[0]];
}

// Returns, for each child, the enclosing toggle ids
export const buildToggleIndex = (elements: TIndentElement[]): string[][] => {
  const result: string[][] = [];
  let currentEnclosingToggles: [string, number][] = []; // [toggleId, indent][]
  elements.forEach((element, index) => {
    const elementIndent = element[KEY_INDENT] || 0;
    // For some reason, indent lists have a min indent of 1, even though they are not indented
    const elementIndentWithIndentListCorrection =
      element[KEY_LIST_STYLE_TYPE] && element[KEY_INDENT]
        ? elementIndent - 1
        : elementIndent;

    const enclosingToggles = currentEnclosingToggles.filter(([_, indent]) => {
      return indent < elementIndentWithIndentListCorrection;
    });
    currentEnclosingToggles = enclosingToggles;
    result[index] = enclosingToggles.map(([toggleId]) => toggleId);
    if (element.type === ELEMENT_TOGGLE) {
      // TODO Use the identifier provided as option instead of the default identifier of the node-id plugin, and type accordingly
      currentEnclosingToggles.push([
        element.id as string,
        element[KEY_INDENT] || 0,
      ]);
    }
  });

  return result;
};

const memoizedBuildToggleIndex = memoize(buildToggleIndex);
