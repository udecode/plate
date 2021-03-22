import { useRenderElement } from '@udecode/slate-plugins-common';
import { SlatePlugin } from '@udecode/slate-plugins-core';
import { KEYS_CODE_BLOCK } from './defaults';
import { useDecorateCodeBlock } from './useDecorateCodeBlock';
import { useDeserializeCodeBlock } from './useDeserializeCodeBlock';
import { useOnKeyDownCodeBlock } from './useOnKeyDownCodeBlock';
import { useRenderLeafCodeBlock } from './useRenderLeafCodeBlock';
import { withCodeBlock } from './withCodeBlock';

/**
 * Enables support for pre-formatted code blocks.
 */
export const useCodeBlockPlugin = (): SlatePlugin => ({
  pluginKeys: KEYS_CODE_BLOCK,
  renderElement: useRenderElement(KEYS_CODE_BLOCK),
  renderLeaf: useRenderLeafCodeBlock(),
  deserialize: useDeserializeCodeBlock(),
  decorate: useDecorateCodeBlock(),
  onKeyDown: useOnKeyDownCodeBlock(),
  withOverrides: withCodeBlock(),
});
