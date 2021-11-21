import { WithOverride } from '../types/plugins/WithOverride';
import { TElement } from '../types/slate/TElement';
import { createPluginFactory } from '../utils/createPluginFactory';

export const KEY_INLINE_VOID = 'inline-void';

/**
 * Merge and register all the inline types and void types from the plugins and options,
 * using `editor.isInline` and `editor.isVoid`
 */
export const withInlineVoid: WithOverride = (editor) => {
  const { isInline } = editor;
  const { isVoid } = editor;

  const inlineTypes: string[] = [];
  const voidTypes: string[] = [];

  editor.plugins.forEach((plugin) => {
    if (!plugin.key) return;

    if (plugin.isInline) {
      inlineTypes.push(plugin.key);
    }

    if (plugin.isVoid) {
      voidTypes.push(plugin.key);
    }
  });

  editor.isInline = (element) => {
    return inlineTypes.includes((element as TElement).type)
      ? true
      : isInline(element);
  };

  editor.isVoid = (element) =>
    voidTypes.includes((element as TElement).type) ? true : isVoid(element);

  return editor;
};

/**
 * @see {@link withInlineVoid}
 */
export const createInlineVoidPlugin = createPluginFactory({
  key: KEY_INLINE_VOID,
  withOverrides: withInlineVoid,
});
