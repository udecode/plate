import {
  type TElement,
  createPluginFactory,
  isCollapsed,
} from '@udecode/plate-common/server';

export const ELEMENT_INLINE_DATE = 'inline_date';

export const createInlineDatePlugin = createPluginFactory({
  handlers: {},
  isElement: true,
  isInline: true,
  isVoid: true,
  key: ELEMENT_INLINE_DATE,
  withOverrides: (editor) => {
    const { isSelectable, move } = editor;

    // https://github.com/ianstormtaylor/slate/blob/main/site/examples/inlines.tsx#L74-L96
    // Default left/right behavior is unit:'character'.
    // This fails to distinguish between two cursor positions, such as
    // <inline>foo<cursor/></inline> vs <inline>foo</inline><cursor/>.
    // Here we modify the behavior to unit:'offset'.
    // This lets the user step into and out of the inline without stepping over characters.
    // You may wish to customize this further to only use unit:'offset' in specific cases.
    editor.move = (op) => {
      if (editor.selection && isCollapsed(editor.selection)) {
        return move({
          ...op,
          unit: 'offset',
        });
      }

      move(op);
    };

    editor.isSelectable = (element) =>
      (element as TElement).type !== ELEMENT_INLINE_DATE &&
      isSelectable(element);

    return editor;
  },
});
