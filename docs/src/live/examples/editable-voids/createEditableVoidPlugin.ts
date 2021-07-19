import {
  getPlatePluginTypes,
  getRenderElement,
  PlatePlugin,
} from '@udecode/plate';
import { EDITABLE_VOID } from './defaults';

export const createEditableVoidPlugin = (): PlatePlugin => ({
  renderElement: getRenderElement(EDITABLE_VOID),
  voidTypes: getPlatePluginTypes(EDITABLE_VOID),
});
