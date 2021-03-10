import { useRenderElements } from '@udecode/slate-plugins-common';
import { SlatePlugin } from '@udecode/slate-plugins-core';
import { KEYS_CODE_BLOCK } from './defaults';
import { renderLeafCodeBlock } from './renderLeafCodeBlock';
import { useDecorateCodeBlock } from './useDecorateCodeBlock';
import { useDeserializeCodeBlock } from './useDeserializeCodeBlock';
import { useOnKeyDownCodeBlock } from './useOnKeyDownCodeBlock';

/**
 * Enables support for pre-formatted code blocks.
 */
export const CodeBlockPlugin = (): SlatePlugin => ({
  elementKeys: KEYS_CODE_BLOCK,
  renderElement: useRenderElements(KEYS_CODE_BLOCK),
  renderLeaf: renderLeafCodeBlock(),
  deserialize: useDeserializeCodeBlock(),
  decorate: useDecorateCodeBlock(),
  onKeyDown: useOnKeyDownCodeBlock(),
});
