import { type OverrideEditor, getPluginByType } from '../../plugin';
import { createSlatePlugin } from '../../plugin/createSlatePlugin';
import { BaseParagraphPlugin } from '../paragraph';
import { withBreakRules } from './withBreakRules';
import { withDeleteRules } from './withDeleteRules';
import { withMergeRules } from './withMergeRules';
import { withNormalizeRules } from './withNormalizeRules';

/**
 * Merge and register all the inline types and void types from the plugins and
 * options, using `editor.api.isInline`, `editor.api.markableVoid` and
 * `editor.api.isVoid`
 */
export const withOverrides: OverrideEditor = ({
  api: { isInline, isSelectable, isVoid, markableVoid },
  editor,
}) => {
  // Use pre-computed arrays from plugin resolution
  return {
    api: {
      create: {
        block: (node) => ({
          children: [{ text: '' }],
          type: editor.getType(BaseParagraphPlugin.key),
          ...node,
        }),
      },
      isInline(element) {
        return getPluginByType(editor, element.type as string)?.node.isInline
          ? true
          : isInline(element);
      },
      isSelectable(element) {
        return getPluginByType(editor, element.type as string)?.node
          .isSelectable === false
          ? false
          : isSelectable(element);
      },
      isVoid(element) {
        return getPluginByType(editor, element.type as string)?.node.isVoid
          ? true
          : isVoid(element);
      },
      markableVoid(element) {
        return getPluginByType(editor, element.type as string)?.node
          .isMarkableVoid
          ? true
          : markableVoid(element);
      },
    },
  };
};

/** Override the editor api and transforms based on the plugins. */
export const OverridePlugin = createSlatePlugin({
  key: 'override',
})
  .overrideEditor(withOverrides)
  .overrideEditor(withBreakRules)
  .overrideEditor(withDeleteRules)
  .overrideEditor(withMergeRules)
  .overrideEditor(withNormalizeRules);
