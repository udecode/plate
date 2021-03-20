import { getRenderElement, setDefaults } from '@udecode/slate-plugins';
import { EDITABLE_VOID } from './defaults';
import { EditableVoidElement } from './EditableVoidElement';

// TODO
export const useRenderElementEditableVoid = (options?: any) => {
  const { editable_void } = setDefaults(options, {
    editable_void: {
      type: EDITABLE_VOID,
      component: EditableVoidElement,
    },
  });

  return getRenderElement(editable_void);
};
