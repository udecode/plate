import { SlatePlugin } from '@udecode/slate-plugins';
import { renderElementEditableVoid } from './renderElementEditableVoid';
import { EDITABLE_VOID } from './types';

export const EditableVoidPlugin = (options?: any): SlatePlugin => ({
  renderElement: renderElementEditableVoid(options),
  voidTypes: [EDITABLE_VOID],
});
