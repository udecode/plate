import type { NodeKey, Range } from '..';
import { usesAppleDOMHotkeys } from '../dom/internal';

export type MountedTopLevelRange = {
  endIndex: number;
  startIndex: number;
};

export const isSelectionViewportBacked = (
  selection: Range | null,
  mountedTopLevelNodeKeys: ReadonlySet<NodeKey> | null,
  mountedTopLevelRanges?: readonly MountedTopLevelRange[] | null
) => {
  if (!mountedTopLevelNodeKeys || !selection) return false;

  const anchorIndex = selection.anchor.path[0];
  const focusIndex = selection.focus.path[0];

  if (typeof anchorIndex !== 'number' || typeof focusIndex !== 'number') {
    return false;
  }

  const startIndex = Math.min(anchorIndex, focusIndex);
  const endIndex = Math.max(anchorIndex, focusIndex);

  return mountedTopLevelRanges
    ? !mountedTopLevelRanges.some(
        (range) => startIndex >= range.startIndex && endIndex <= range.endIndex
      )
    : false;
};

type SelectAllHotkeyPlatform = 'apple' | 'other';

export const isSelectAllHotkey = (
  event: {
    altKey: boolean;
    ctrlKey: boolean;
    key: string;
    metaKey: boolean;
    shiftKey: boolean;
  },
  platform: SelectAllHotkeyPlatform = usesAppleDOMHotkeys(event)
    ? 'apple'
    : 'other'
) => {
  const { altKey, ctrlKey, key, metaKey, shiftKey } = event;

  return (
    !altKey &&
    !shiftKey &&
    key.toLowerCase() === 'a' &&
    (platform === 'apple' ? metaKey && !ctrlKey : ctrlKey && !metaKey)
  );
};
