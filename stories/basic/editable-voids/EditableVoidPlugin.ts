import { SlatePlugin } from '../../../packages/slate-plugins/src/common/types';
import { RenderElementOptions } from '../../../packages/slate-plugins/src';
import { renderElementEditableVoid } from './renderElementEditableVoid';

export const EditableVoidPlugin = (
  options?: RenderElementOptions
): SlatePlugin => ({
  renderElement: renderElementEditableVoid(options),
});
