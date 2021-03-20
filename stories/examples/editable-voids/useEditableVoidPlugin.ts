import {
  SlatePlugin,
  usePluginTypes,
  useRenderElement,
} from '@udecode/slate-plugins';
import { EDITABLE_VOID } from './defaults';

export const useEditableVoidPlugin = (): SlatePlugin => ({
  renderElement: useRenderElement(EDITABLE_VOID),
  voidTypes: usePluginTypes(EDITABLE_VOID),
});
