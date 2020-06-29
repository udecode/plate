import { DeserializeHtml, getElementDeserializer } from '@udecode/core';
import { CODE_BLOCK, CodeBlockDeserializeOptions } from './types';

export const deserializeCodeBlock = ({
  typeCodeBlock = CODE_BLOCK,
}: CodeBlockDeserializeOptions = {}): DeserializeHtml => ({
  element: getElementDeserializer(typeCodeBlock, { tagNames: ['PRE'] }),
});
