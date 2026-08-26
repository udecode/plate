import {
  type Editor,
  type EditorSnapshot,
  type NodeKey,
  type Range,
  RangeApi,
} from '@platejs/plite';
import { usesAppleDOMHotkeys } from '@platejs/plite-dom/internal';

import { point as editorPoint } from '../editable/runtime-editor-api';

export type MountedTopLevelRange = {
  endIndex: number;
  startIndex: number;
};

const samePath = (left: readonly number[], right: readonly number[]) =>
  left.length === right.length &&
  left.every((segment, index) => segment === right[index]);

const samePoint = (
  left: { offset: number; path: readonly number[] },
  right: { offset: number; path: readonly number[] }
) => left.offset === right.offset && samePath(left.path, right.path);

export const getFullDocumentRange = (editor: Editor) => ({
  anchor: editorPoint(editor, [], { edge: 'start' }),
  focus: editorPoint(editor, [], { edge: 'end' }),
});

export const isFullDocumentSelection = (
  editor: Editor,
  selection: EditorSnapshot['selection']
) => {
  if (!selection || !RangeApi.isRange(selection)) {
    return false;
  }

  const fullRange = getFullDocumentRange(editor);

  return (
    (samePoint(selection.anchor, fullRange.anchor) &&
      samePoint(selection.focus, fullRange.focus)) ||
    (samePoint(selection.anchor, fullRange.focus) &&
      samePoint(selection.focus, fullRange.anchor))
  );
};

export const isSelectionPartialDOMBacked = (
  selection: Range | null,
  mountedTopLevelNodeKeys: ReadonlySet<NodeKey> | null,
  mountedTopLevelRanges?: readonly MountedTopLevelRange[] | null
) => {
  if (!mountedTopLevelNodeKeys || !selection) {
    return false;
  }

  const anchorIndex = selection.anchor.path[0];
  const focusIndex = selection.focus.path[0];

  if (typeof anchorIndex !== 'number' || typeof focusIndex !== 'number') {
    return false;
  }

  const startIndex = Math.min(anchorIndex, focusIndex);
  const endIndex = Math.max(anchorIndex, focusIndex);

  if (mountedTopLevelRanges) {
    return !mountedTopLevelRanges.some(
      (range) => startIndex >= range.startIndex && endIndex <= range.endIndex
    );
  }

  return false;
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
