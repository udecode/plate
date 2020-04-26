import { getRenderElement } from 'slate-plugins-next/src';
import { EditableVoidElement } from './EditableVoidElement';
import { EDITABLE_VOID } from './types';

export const renderElementEditableVoid = getRenderElement({
  type: EDITABLE_VOID,
  component: EditableVoidElement,
});
