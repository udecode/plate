import { Value } from '@udecode/plate-common';
import { KEY_INDENT } from '@udecode/plate-indent';
import { KEY_LIST_STYLE_TYPE } from '@udecode/plate-indent-list';
import { memoize } from 'lodash';

import { ELEMENT_TOGGLE } from '../types';

export function getEnclosingToggleIds(
  elements: Value,
  elementId: string
): string[] {
  return memoizedBuildToggleIndex(elements).get(elementId) || [];
}

// Returns, for each child, the enclosing toggle ids
export const buildToggleIndex = (elements: Value): Map<string, string[]> => {
  const result: Map<string, string[]> = new Map();
  let currentEnclosingToggles: [string, number][] = []; // [toggleId, indent][]
  elements.forEach((element) => {
    const elementIndent = (element[KEY_INDENT] as number) || 0;
    // For some reason, indent lists have a min indent of 1, even though they are not indented
    const elementIndentWithIndentListCorrection =
      element[KEY_LIST_STYLE_TYPE] && element[KEY_INDENT]
        ? elementIndent - 1
        : elementIndent;

    const enclosingToggles = currentEnclosingToggles.filter(([_, indent]) => {
      return indent < elementIndentWithIndentListCorrection;
    });
    currentEnclosingToggles = enclosingToggles;
    result.set(
      element.id as string,
      enclosingToggles.map(([toggleId]) => toggleId)
    );
    if (element.type === ELEMENT_TOGGLE) {
      currentEnclosingToggles.push([element.id as string, elementIndent]);
    }
  });

  return result;
};

const memoizedBuildToggleIndex = memoize(buildToggleIndex);
