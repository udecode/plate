import { editableVoidElementFile } from './code-EditableVoidElement';
import { createEditableVoidPluginFile } from './code-createEditableVoidPlugin';
import { editableVoidsValueFile } from './code-editableVoidsValue';

export const editableVoidsFiles = {
  ...editableVoidElementFile,
  ...createEditableVoidPluginFile,
  ...editableVoidsValueFile,
};
