import { getRenderElement, setDefaults } from '@udecode/slate-plugins';
import { EditableVoidElement } from './EditableVoidElement';
import { EDITABLE_VOID } from './types';

export const renderElementEditableVoid = (options?: any) => {
  const { editable_void } = setDefaults(options, {
    editable_void: {
      type: EDITABLE_VOID,
      component: EditableVoidElement,
    },
  });

  return getRenderElement(editable_void);
};
