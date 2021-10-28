import { SPEditor } from '@udecode/plate-core';
import { findMentionInput } from './findMentionInput';

export const isSelectionInMentionInput = (editor: SPEditor) =>
  findMentionInput(editor) !== undefined;
