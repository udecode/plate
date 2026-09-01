import * as Y from 'yjs';

import type { Range } from '../../core';
import {
  isYjsAwarenessSelectionValue,
  readYjsAwarenessRelativeRange,
  readYjsAwarenessRelativeSelection,
} from './awareness-relative-selection';
import {
  pliteRangeToYjsRelativeRange,
  yjsRelativeRangesEqual,
  yjsRelativeRangeToPliteRange,
} from './selection';
import type { YjsAwarenessSelection } from './types';

export const createYjsAwarenessSelection = (
  root: Y.XmlElement,
  rootKey: string,
  range: Range
): YjsAwarenessSelection => {
  const relative = pliteRangeToYjsRelativeRange(root, range);

  return {
    anchor: Y.relativePositionToJSON(relative.anchor),
    focus: Y.relativePositionToJSON(relative.focus),
    root: rootKey,
  };
};

export const readYjsAwarenessSelection = (
  rootFor: (root: string) => Y.XmlElement | null,
  value: unknown
): Range | null => {
  const relativeSelection = readYjsAwarenessRelativeSelection(value);

  if (!relativeSelection) return null;

  try {
    const root = rootFor(relativeSelection.root);

    if (root === null) return null;

    const range = yjsRelativeRangeToPliteRange(root, relativeSelection.range);

    if (range === null || relativeSelection.root === 'main') return range;

    return {
      anchor: { ...range.anchor, root: relativeSelection.root },
      focus: { ...range.focus, root: relativeSelection.root },
    };
  } catch {
    return null;
  }
};

export const yjsAwarenessSelectionsEqual = (
  a: unknown,
  b: YjsAwarenessSelection | null
): boolean => {
  if (a === b) {
    return true;
  }
  if (a === null || b === null) {
    return a === b;
  }
  if (!isYjsAwarenessSelectionValue(a)) {
    return false;
  }

  try {
    if (a.root !== b.root) return false;

    const left = readYjsAwarenessRelativeRange(a);
    const right = readYjsAwarenessRelativeRange(b);

    return yjsRelativeRangesEqual(left, right);
  } catch {
    return false;
  }
};
