import type { Range } from '@platejs/slate';
import * as Y from 'yjs';

import { isRecord } from './record';
import {
  slateRangeToYjsRelativeRange,
  type YjsRelativeRange,
  yjsRelativeRangesEqual,
  yjsRelativeRangeToSlateRange,
} from './selection';
import type { YjsAwarenessSelection } from './types';

export const createYjsAwarenessSelection = (
  root: Y.XmlElement,
  range: Range
): YjsAwarenessSelection => {
  const relative = slateRangeToYjsRelativeRange(root, range);

  return {
    anchor: Y.relativePositionToJSON(relative.anchor),
    focus: Y.relativePositionToJSON(relative.focus),
  };
};

export const readYjsAwarenessSelection = (
  root: Y.XmlElement,
  value: unknown
): Range | null => {
  if (!isYjsAwarenessSelection(value)) {
    return null;
  }

  try {
    return yjsRelativeRangeToSlateRange(
      root,
      readYjsAwarenessRelativeRange(value)
    );
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
  if (!isYjsAwarenessSelection(a)) {
    return false;
  }

  try {
    const left = readYjsAwarenessRelativeRange(a);
    const right = readYjsAwarenessRelativeRange(b);

    return yjsRelativeRangesEqual(left, right);
  } catch {
    return false;
  }
};

const readYjsAwarenessRelativeRange = (
  value: YjsAwarenessSelection
): YjsRelativeRange => ({
  anchor: Y.createRelativePositionFromJSON(value.anchor),
  focus: Y.createRelativePositionFromJSON(value.focus),
});

const isYjsAwarenessSelection = (
  value: unknown
): value is YjsAwarenessSelection =>
  isRecord(value) && 'anchor' in value && 'focus' in value;
