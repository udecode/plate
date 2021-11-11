import { PlatePlugin } from '@udecode/plate';
import { EDITABLE_VOID } from './defaults';

export const createEditableVoidPlugin = (): PlatePlugin => ({
  key: EDITABLE_VOID,
  isElement: true,
  isVoid: true,
});
