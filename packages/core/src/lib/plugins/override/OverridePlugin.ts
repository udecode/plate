import type { OverrideEditor } from '../../plugin';

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
  const voidTypes = editor.meta.pluginCache.node.isVoid;
  const inlineTypes = editor.meta.pluginCache.node.isInline;
  const markableVoidTypes = editor.meta.pluginCache.node.isMarkableVoid;
  const notSelectableTypes = editor.meta.pluginCache.node.isNotSelectable;
  const types = editor.meta.pluginCache.node.types;

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
        return voidTypes.includes(types[element.type] as any) ? true : isVoid(element);
      },
      markableVoid(element) {
        return markableVoidTypes.includes(element.type)
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
