import { DeserializeHtml } from '../../common';
import { getElementDeserializer } from '../../element/utils';
import { CODE_BLOCK, CodeBlockDeserializeOptions } from './types';

export const deserializeCodeBlock = ({
  typeCodeBlock = CODE_BLOCK,
}: CodeBlockDeserializeOptions = {}): DeserializeHtml => ({
  element: getElementDeserializer(typeCodeBlock, { tagNames: ['PRE'] }),
});
