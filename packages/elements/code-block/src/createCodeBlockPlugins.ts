import { getRenderElement, PlatePlugin } from '@udecode/plate-core';
import { ELEMENT_CODE_BLOCK, ELEMENT_CODE_LINE } from './defaults';
import {
  getCodeBlockDeserialize,
  getCodeLineDeserialize,
} from './getCodeBlockDeserialize';
import { getCodeBlockOnKeyDown } from './getCodeBlockOnKeyDown';
import { getCodeBlockRenderLeaf } from './getCodeBlockRenderLeaf';
import { getCodeLineDecorate } from './getCodeLineDecorate';
import { withCodeBlock } from './withCodeBlock';

/**
 * Enables support for pre-formatted code blocks.
 */
export const createCodeBlockPlugins = (): PlatePlugin[] => [
  {
    pluginKeys: ELEMENT_CODE_BLOCK,
    renderElement: getRenderElement(ELEMENT_CODE_BLOCK),
    renderLeaf: getCodeBlockRenderLeaf(),
    deserialize: getCodeBlockDeserialize(),
    onKeyDown: getCodeBlockOnKeyDown(),
    withOverrides: withCodeBlock(),
  },
  {
    pluginKeys: ELEMENT_CODE_LINE,
    renderElement: getRenderElement(ELEMENT_CODE_LINE),
    deserialize: getCodeLineDeserialize(),
    decorate: getCodeLineDecorate(),
  },
];
