import { getPluginRenderElement } from '@udecode/slate-plugins-common';
import { SlatePlugin } from '@udecode/slate-plugins-core';
import { KEYS_CODE_BLOCK } from './defaults';
import { renderLeafCodeBlock } from './renderLeafCodeBlock';
import { useDecorateCodeBlock } from './useDecorateCodeBlock';
import { useDeserializeCodeBlock } from './useDeserializeCodeBlock';
import { useOnKeyDownCodeBlock } from './useOnKeyDownCodeBlock';
import { withCodeBlock } from './withCodeBlock';

/**
 * Enables support for pre-formatted code blocks.
 */
export const CodeBlockPlugin = (): SlatePlugin => ({
  pluginKeys: KEYS_CODE_BLOCK,
  renderElement: getPluginRenderElement(KEYS_CODE_BLOCK),
  renderLeaf: renderLeafCodeBlock(),
  deserialize: useDeserializeCodeBlock(),
  decorate: useDecorateCodeBlock(),
  onKeyDown: useOnKeyDownCodeBlock(),
  withOverrides: [withCodeBlock()],
});
