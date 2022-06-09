import { PlateEditor, Value } from '@udecode/plate-core';
import { findMentionInput } from './findMentionInput';

export const isSelectionInMentionInput = <V extends Value>(
  editor: PlateEditor<V>
) => findMentionInput(editor) !== undefined;
