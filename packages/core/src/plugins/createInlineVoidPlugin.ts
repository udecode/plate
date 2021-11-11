import { PlatePlugin } from '../types/PlatePlugin/PlatePlugin';
import { WithOverride } from '../types/PlatePlugin/WithOverride';
import { TElement } from '../types/TElement';
import { getPlatePluginWithOverrides } from '../utils/getPlatePluginWithOverrides';

export interface WithInlineVoidOptions {
  plugins?: PlatePlugin[];
  inlineTypes?: string[];
  voidTypes?: string[];
}

/**
 * Merge and register all the inline types and void types from the plugins and options,
 * using `editor.isInline` and `editor.isVoid`
 */
export const withInlineVoid = ({
  plugins = [],
  inlineTypes: _inlineTypes = [],
  voidTypes: _voidTypes = [],
}: WithInlineVoidOptions): WithOverride => (editor) => {
  const { isInline } = editor;
  const { isVoid } = editor;

  const inlineTypes = [..._inlineTypes];
  const voidTypes = [..._voidTypes];

  plugins.forEach((plugin) => {
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
export const createInlineVoidPlugin = getPlatePluginWithOverrides(
  withInlineVoid
);
