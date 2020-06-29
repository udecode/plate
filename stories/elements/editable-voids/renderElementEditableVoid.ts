import { getRenderElement, RenderElementOptions } from '@udecode/slate-plugins';
import { EditableVoidElement } from './EditableVoidElement';
import { EDITABLE_VOID } from './types';

export const renderElementEditableVoid = ({
  typeEditableVoid = EDITABLE_VOID,
  component = EditableVoidElement,
}: RenderElementOptions & { typeEditableVoid?: string } = {}) =>
  getRenderElement({
    type: typeEditableVoid,
    component,
  });
