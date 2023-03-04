import { Value } from '@udecode/slate-utils';
import { PlateEditor } from '../types/plate/PlateEditor';
import { createPluginFactory } from '../utils/plate/createPluginFactory';

export const KEY_INLINE_VOID = 'inline-void';

/**
 * Merge and register all the inline types and void types from the plugins and options,
 * using `editor.isInline` and `editor.isVoid`
 */
export const withInlineVoid = <
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>
>(
  editor: E
) => {
  const { isInline } = editor;
  const { isVoid } = editor;

  const inlineTypes: string[] = [];
  const voidTypes: string[] = [];

  editor.plugins.forEach((plugin) => {
    if (plugin.isInline) {
      inlineTypes.push(plugin.type);
    }

    if (plugin.isVoid) {
      voidTypes.push(plugin.type);
    }
  });

  editor.isInline = (element) => {
    return inlineTypes.includes(element.type) ? true : isInline(element);
  };

  editor.isVoid = (element) =>
    voidTypes.includes(element.type) ? true : isVoid(element);

  return editor;
};

/**
 * @see {@link withInlineVoid}
 */
export const createInlineVoidPlugin = createPluginFactory({
  key: KEY_INLINE_VOID,
  withOverrides: withInlineVoid,
});
