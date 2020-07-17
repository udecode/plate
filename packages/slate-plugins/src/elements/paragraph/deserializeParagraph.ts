import { DeserializeHtml } from '@udecode/slate-plugins-core';
import { getElementDeserializer } from '../../common/utils/getElementDeserializer';
import { setDefaults } from '../../common/utils/setDefaults';
import { DEFAULTS_PARAGRAPH } from './defaults';
import { ParagraphDeserializeOptions } from './types';

export const deserializeParagraph = (
  options?: ParagraphDeserializeOptions
): DeserializeHtml => {
  const { p } = setDefaults(options, DEFAULTS_PARAGRAPH);

  return {
    element: getElementDeserializer({
      type: p.type,
      rules: [{ nodeNames: 'P' }],
    }),
  };
};
