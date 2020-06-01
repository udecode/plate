import {
  getRenderElement,
  RenderElementOptions,
} from '../../../packages/slate-plugins/src';
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
