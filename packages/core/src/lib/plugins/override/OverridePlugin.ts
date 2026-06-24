import { type OverrideEditor, getPluginByType } from '../../plugin';
import { createEditorPlugin } from '../../plugin/createEditorPlugin';

/**
 * Merge and register all the inline types and void types from the plugins and
 * options, using `editor.api.isInline`, `editor.api.markableVoid` and
 * `editor.api.isVoid`
 */
export const withOverrides: OverrideEditor = ({ api, editor }) => {
  const { isInline, isSelectable, isVoid, markableVoid } = api as any;

  // Use pre-computed arrays from plugin resolution
  return {
    api: {
      isInline(element: any) {
        return getPluginByType(editor, element.type as string)?.node.isInline
          ? true
          : isInline(element);
      },
      isSelectable(element: any) {
        return getPluginByType(editor, element.type as string)?.node
          .isSelectable === false
          ? false
          : isSelectable(element);
      },
      isVoid(element: any) {
        return getPluginByType(editor, element.type as string)?.node.isVoid
          ? true
          : isVoid(element);
      },
      markableVoid(element: any) {
        return getPluginByType(editor, element.type as string)?.node
          .isMarkableVoid
          ? true
          : markableVoid(element);
      },
    },
  };
};

/** Override the editor api and transforms based on the plugins. */
const OverridePluginBase = createEditorPlugin({
  key: 'override',
}).overrideEditor(withOverrides);

export const OverridePlugin = Object.assign(OverridePluginBase, {
  runtimeOverrideMergeRules: true,
  runtimeOverrideNormalizeRules: true,
});
