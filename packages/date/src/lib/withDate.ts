import type { ExtendEditor, TElement } from '@udecode/plate-common';

export const withDate: ExtendEditor = ({ editor, type }) => {
  const { isSelectable } = editor;

  editor.isSelectable = (element) => {
    return (element as TElement).type !== type && isSelectable(element);
  };

  return editor;
};
