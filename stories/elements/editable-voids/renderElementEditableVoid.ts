import { getRenderElement, RenderElementOptions } from 'slate-plugins-next/src';
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
