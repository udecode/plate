import {
  RenderElementOptions,
  SlatePlugin,
} from '../../../../packages/slate-plugins/src';
import { renderElementEditableVoid } from './renderElementEditableVoid';

export const EditableVoidPlugin = (
  options?: RenderElementOptions
): SlatePlugin => ({
  renderElement: renderElementEditableVoid(options),
});
