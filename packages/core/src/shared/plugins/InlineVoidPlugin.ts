import type { WithOverride } from '../types';

import { createPlugin } from '../utils';

export const KEY_INLINE_VOID = 'inline-void';

/**
 * Merge and register all the inline types and void types from the plugins and
 * options, using `editor.isInline`, `editor.markableVoid` and `editor.isVoid`
 */
export const withInlineVoid: WithOverride = (editor) => {
  const { isInline, isVoid, markableVoid } = editor;

  const voidTypes: string[] = [];
  const inlineTypes: string[] = [];
  const markableVoidTypes: string[] = [];

  editor.plugins.forEach((plugin) => {
    if (plugin.isInline) {
      inlineTypes.push(plugin.type);
    }
    if (plugin.isVoid) {
      voidTypes.push(plugin.type);
    }
    if (plugin.isMarkableVoid) {
      markableVoidTypes.push(plugin.type);
    }
  });

  editor.isInline = (element) => {
    return inlineTypes.includes(element.type) ? true : isInline(element);
  };

  editor.isVoid = (element) => {
    return voidTypes.includes(element.type) ? true : isVoid(element);
  };

  editor.markableVoid = (element) => {
    return markableVoidTypes.includes(element.type)
      ? true
      : markableVoid(element);
  };

  return editor;
};

/** @see {@link withInlineVoid} */
export const InlineVoidPlugin = createPlugin({
  key: KEY_INLINE_VOID,
  withOverrides: withInlineVoid,
});
