import {
  SlatePlugin,
  useRenderElement,
  useSlatePluginTypes,
} from '@udecode/slate-plugins';
import { EDITABLE_VOID } from './defaults';

export const useEditableVoidPlugin = (): SlatePlugin => ({
  renderElement: useRenderElement(EDITABLE_VOID),
  voidTypes: useSlatePluginTypes(EDITABLE_VOID),
});
