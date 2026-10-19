import * as Y from 'yjs';

import { isRecord } from './record';
import type { YjsRelativeRange } from './selection';
import type { YjsAwarenessSelection } from './types';

export type YjsAwarenessRelativeSelection = Readonly<{
  range: YjsRelativeRange;
  root: string;
}>;

export const readYjsAwarenessRelativeRange = (
  value: YjsAwarenessSelection
): YjsRelativeRange => ({
  anchor: Y.createRelativePositionFromJSON(value.anchor),
  focus: Y.createRelativePositionFromJSON(value.focus),
});

const isYjsAwarenessSelection = (
  value: unknown
): value is YjsAwarenessSelection =>
  isRecord(value) &&
  'anchor' in value &&
  'focus' in value &&
  typeof value.root === 'string';

export const readYjsAwarenessRelativeSelection = (
  value: unknown
): YjsAwarenessRelativeSelection | null => {
  if (!isYjsAwarenessSelection(value)) return null;

  try {
    return {
      range: readYjsAwarenessRelativeRange(value),
      root: value.root,
    };
  } catch {
    return null;
  }
};

export const isYjsAwarenessSelectionValue = isYjsAwarenessSelection;
