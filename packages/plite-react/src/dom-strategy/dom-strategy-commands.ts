import type { Editor, EditorSnapshot, RuntimeId } from '@platejs/plite';
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
  if (!selection) {
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
  selection: EditorSnapshot['selection'],
  mountedTopLevelRuntimeIds: ReadonlySet<RuntimeId> | null,
  mountedTopLevelRanges?: readonly MountedTopLevelRange[] | null
) => {
  if (!mountedTopLevelRuntimeIds || !selection) {
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

const APPLE_USER_AGENT_PATTERN = /Mac OS X/;

const getSelectAllHotkeyPlatform = (): SelectAllHotkeyPlatform =>
  typeof navigator !== 'undefined' &&
  APPLE_USER_AGENT_PATTERN.test(navigator.userAgent)
    ? 'apple'
    : 'other';

export const isSelectAllHotkey = (
  {
    altKey,
    ctrlKey,
    key,
    metaKey,
    shiftKey,
  }: {
    altKey: boolean;
    ctrlKey: boolean;
    key: string;
    metaKey: boolean;
    shiftKey: boolean;
  },
  platform: SelectAllHotkeyPlatform = getSelectAllHotkeyPlatform()
) =>
  !altKey &&
  !shiftKey &&
  key.toLowerCase() === 'a' &&
  (platform === 'apple' ? metaKey && !ctrlKey : ctrlKey && !metaKey);
