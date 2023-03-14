import { PlateEditor, Value } from '@udecode/plate-common';
import { findMentionInput } from './findMentionInput';

export const isSelectionInMentionInput = <V extends Value>(
  editor: PlateEditor<V>
) => findMentionInput(editor) !== undefined;
