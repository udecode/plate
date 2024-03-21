import {
  ELEMENT_DEFAULT,
  PlateEditor,
  setNodes,
  TElement,
  Value,
} from '@udecode/plate-common';

export const unSetIndentTodo = <V extends Value>(editor: PlateEditor<V>) =>
  setNodes<TElement>(editor, {
    type: ELEMENT_DEFAULT,
    indent: 0,
  });
