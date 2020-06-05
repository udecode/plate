import { SlatePlugin } from '../../../packages/slate-plugins/src/common';
import { RenderElementOptions } from '../../../packages/slate-plugins/src/element';
import { renderElementEditableVoid } from './renderElementEditableVoid';
import { EDITABLE_VOID } from './types';

export const EditableVoidPlugin = (
  options?: RenderElementOptions
): SlatePlugin => ({
  renderElement: renderElementEditableVoid(options),
  voidTypes: [EDITABLE_VOID],
});
