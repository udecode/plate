import { RenderElementOptions, SlatePlugin } from 'slate-plugins-next/src';
import { renderElementEditableVoid } from './renderElementEditableVoid';

export const EditableVoidPlugin = (
  options?: RenderElementOptions
): SlatePlugin => ({
  renderElement: renderElementEditableVoid(options),
});
