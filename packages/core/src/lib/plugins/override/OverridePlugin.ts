import type { OverrideEditor } from '../../plugin';

import { createSlatePlugin } from '../../plugin/createSlatePlugin';
import { BaseParagraphPlugin } from '../paragraph';
import { withBreakMode } from './withBreakMode';
import { withDeleteMode } from './withDeleteMode';
import { withMergeMode } from './withMergeMode';
import { withNormalizeMode } from './withNormalizeMode';

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
  const voidTypes = editor.meta.pluginKeys.node.isVoid;
  const inlineTypes = editor.meta.pluginKeys.node.isInline;
  const markableVoidTypes = editor.meta.pluginKeys.node.isMarkableVoid;
  const notSelectableTypes = editor.meta.pluginKeys.node.isNotSelectable;

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

/** Override the editor api and transforms based on the plugins. */
export const OverridePlugin = createSlatePlugin({
  key: 'override',
})
  .overrideEditor(withOverrides)
  .overrideEditor(withBreakMode)
  .overrideEditor(withDeleteMode)
  .overrideEditor(withMergeMode)
  .overrideEditor(withNormalizeMode);
