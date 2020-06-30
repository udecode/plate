import { DeserializeHtml } from '@udecode/core';
import { getElementDeserializer } from '../../common/utils/getElementDeserializer';
import { CODE_BLOCK, CodeBlockDeserializeOptions } from './types';

export const deserializeCodeBlock = ({
  typeCodeBlock = CODE_BLOCK,
}: CodeBlockDeserializeOptions = {}): DeserializeHtml => ({
  element: getElementDeserializer(typeCodeBlock, { tagNames: ['PRE'] }),
});
