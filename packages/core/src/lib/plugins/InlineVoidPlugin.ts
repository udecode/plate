import { type ExtendEditor, createSlatePlugin } from '../plugin';

/**
 * Merge and register all the inline types and void types from the plugins and
 * options, using `editor.isInline`, `editor.markableVoid` and `editor.isVoid`
 */
export const withInlineVoid: ExtendEditor = ({ editor }) => {
  const { isInline, isVoid, markableVoid } = editor;

  const voidTypes: string[] = [];
  const inlineTypes: string[] = [];
  const markableVoidTypes: string[] = [];

  editor.pluginList.forEach((plugin) => {
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
export const InlineVoidPlugin = createSlatePlugin({
  extendEditor: withInlineVoid,
  key: 'inlineVoid',
});
