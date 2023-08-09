import { Value } from '@udecode/slate';

import { PlateEditor } from '../types/PlateEditor';
import { createPluginFactory } from '../utils/createPluginFactory';

export const KEY_INLINE_VOID = 'inline-void';

/**
 * Merge and register all the inline types and void types from the plugins and options,
 * using `editor.isInline`, `editor.markableVoid` and `editor.isVoid`
 */
export const withInlineVoid = <
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>,
>(
  editor: E
) => {
  const { isInline, isVoid, markableVoid } = editor;

  const voidTypes: string[] = [];
  const inlineTypes: string[] = [];

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

  editor.isVoid = (element) => {
    return voidTypes.includes(element.type) ? true : isVoid(element);
  };

  editor.markableVoid = (element) => {
    return voidTypes.includes(element.type) ? true : isMarkableVoid(element);
  };

  return editor;
};

/**
 * @see {@link withInlineVoid}
 */
export const createInlineVoidPlugin = createPluginFactory({
  key: KEY_INLINE_VOID,
  withOverrides: withInlineVoid,
});
