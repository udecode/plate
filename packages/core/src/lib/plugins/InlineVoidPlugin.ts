import { type OverrideEditor, createSlatePlugin } from '../plugin';

/**
 * Merge and register all the inline types and void types from the plugins and
 * options, using `editor.api.isInline`, `editor.api.markableVoid` and
 * `editor.api.isVoid`
 */
export const withInlineVoid: OverrideEditor = ({
  api: { isInline, isSelectable, isVoid, markableVoid },
  editor,
}) => {
  // Use pre-computed arrays from plugin resolution
  const voidTypes = editor.meta.pluginKeys.node.isVoid;
  const inlineTypes = editor.meta.pluginKeys.node.isInline;
  const markableVoidTypes = editor.meta.pluginKeys.node.isMarkableVoid;
  const notSelectableTypes = editor.meta.pluginKeys.node.isNotSelectable;

  return {
    api: {
      isInline(element) {
        return inlineTypes.includes(element.type as any)
          ? true
          : isInline(element);
      },
      isSelectable(element) {
        return notSelectableTypes.includes(element.type)
          ? false
          : isSelectable(element);
      },
      isVoid(element) {
        return voidTypes.includes(element.type as any) ? true : isVoid(element);
      },
      markableVoid(element) {
        return markableVoidTypes.includes(element.type)
          ? true
          : markableVoid(element);
      },
    },
  };
};

/** @see {@link withInlineVoid} */
export const InlineVoidPlugin = createSlatePlugin({
  key: 'inlineVoid',
}).overrideEditor(withInlineVoid);
