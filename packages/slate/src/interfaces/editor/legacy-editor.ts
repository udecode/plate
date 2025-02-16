import type { OmitFirst } from '@udecode/utils';
import type {
  deleteBackward as deleteBackwardBase,
  deleteForward as deleteForwardBase,
} from 'slate';

import type { EditorApi } from './editor-api';
import type { EditorTransforms } from './editor-transforms';
import type { Value } from './editor-type';

export type LegacyEditorApi<V extends Value = Value> = Pick<
  EditorApi<V>,
  | 'getDirtyPaths'
  | 'getFragment'
  | 'isElementReadOnly'
  | 'isInline'
  | 'isSelectable'
  | 'isVoid'
  | 'markableVoid'
  | 'onChange'
  | 'setNormalizing'
  | 'shouldMergeNodesRemovePrevNode'
  | 'shouldNormalize'
>;

export type LegacyEditorMethods<V extends Value = Value> = LegacyEditorApi<V> &
  LegacyEditorTransforms<V>;

export type LegacyEditorTransforms<V extends Value = Value> = {
  /** Delete content in the editor backward from the current selection. */
  deleteBackward: OmitFirst<typeof deleteBackwardBase>;
  /** Delete content in the editor forward from the current selection. */
  deleteForward: OmitFirst<typeof deleteForwardBase>;
} & Pick<
  EditorTransforms<V>,
  | 'addMark'
  | 'apply'
  | 'delete'
  | 'deleteFragment'
  | 'insertBreak'
  | 'insertFragment'
  | 'insertNode'
  | 'insertNodes'
  | 'insertSoftBreak'
  | 'insertText'
  | 'normalizeNode'
  | 'removeMark'
> &
  Pick<
    EditorTransforms<V>,
    'insertData' | 'insertFragmentData' | 'insertTextData' | 'setFragmentData'
  > &
  Pick<EditorTransforms<V>, 'writeHistory'>;
