import type { OmitFirst } from '@udecode/utils';
import type {
  deleteBackward as deleteBackwardBase,
  deleteForward as deleteForwardBase,
} from 'slate';

import type { Value } from './TEditor';
import type { TEditorApi } from './TEditorApi';
import type { TEditorTransforms } from './TEditorTransforms';

export type LegacyEditorApi<V extends Value = Value> = Pick<
  TEditorApi<V>,
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

export type LegacyEditorTransforms<V extends Value = Value> = {
  /** Delete content in the editor backward from the current selection. */
  deleteBackward: OmitFirst<typeof deleteBackwardBase>;
  /** Delete content in the editor forward from the current selection. */
  deleteForward: OmitFirst<typeof deleteForwardBase>;
} & Pick<
  TEditorTransforms<V>,
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
    TEditorTransforms<V>,
    'insertData' | 'insertFragmentData' | 'insertTextData' | 'setFragmentData'
  > &
  Pick<TEditorTransforms<V>, 'redo' | 'undo' | 'writeHistory'>;

export type LegacyEditorMethods<V extends Value = Value> = LegacyEditorApi<V> &
  LegacyEditorTransforms<V>;
