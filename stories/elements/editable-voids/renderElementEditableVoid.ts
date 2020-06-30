import { RenderElementOptions } from '../../../packages/core/src/types';
import { getRenderElement } from '../../../packages/slate-plugins/src/common/utils/getRenderElement';
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
