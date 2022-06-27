import { editableVoidElementFile } from './code-EditableVoidElement';
import { createEditableVoidPluginFile } from './code-createEditableVoidPlugin';
import { editableVoidsValueFile } from './code-editableVoidsValue';
import { indexFile } from './code-index';

export const editableVoidsFiles = {
  ...editableVoidElementFile,
  ...createEditableVoidPluginFile,
  ...editableVoidsValueFile,
  ...indexFile,
};
