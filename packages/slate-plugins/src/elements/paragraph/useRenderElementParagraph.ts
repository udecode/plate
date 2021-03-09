import { getRenderElement, setDefaults } from '@udecode/slate-plugins-common';
import { useSlatePluginsOptions } from '@udecode/slate-plugins-core';
import { DEFAULTS_PARAGRAPH } from './defaults';
import { ParagraphRenderElementOptions } from './types';

/**
 * input: id
 * useSlatePluginsComponent
 * useSlatePlugins
 * {
 *   p: {
 *
 *   }
 * }
 *
 * createComponents
 * @param options
 */
export const useRenderElementParagraph = (
  options?: ParagraphRenderElementOptions
) => {
  const { p } = setDefaults(options, DEFAULTS_PARAGRAPH);

  const type = useSlatePluginsOptions({
    id: 'Elements/Basic Elements',
    optionKey: 'type',
    pluginKey: 'p',
  });
  console.log(type);

  return getRenderElement(p);
};
