import {
  type TElement,
  createPluginFactory,
} from '@udecode/plate-common/server';

export const ELEMENT_INLINE_DATE = 'inline_date';

export const createInlineDatePlugin = createPluginFactory({
  isElement: true,
  isInline: true,
  isVoid: true,
  key: ELEMENT_INLINE_DATE,
  withOverrides: (editor) => {
    const { isSelectable } = editor;

    editor.isSelectable = (element) => {
      if ((element as TElement).type === ELEMENT_INLINE_DATE) {
        return false;
      }

      return isSelectable(element);
    };

    return editor;
  },
});
