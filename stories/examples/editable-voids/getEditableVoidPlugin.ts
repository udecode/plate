import {
  getRenderElement,
  getSlatePluginTypes,
  SlatePlugin,
} from '@udecode/slate-plugins';
import { EDITABLE_VOID } from './defaults';

export const getEditableVoidPlugin = (): SlatePlugin => ({
  renderElement: getRenderElement(EDITABLE_VOID),
  voidTypes: getSlatePluginTypes(EDITABLE_VOID),
});
