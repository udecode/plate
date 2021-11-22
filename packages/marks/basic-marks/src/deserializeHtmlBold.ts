import { DeserializeHtml } from '@udecode/plate-core';

export const deserializeHtmlBold: DeserializeHtml[] = [
  { validNodeName: ['STRONG', 'B'] },
  {
    validStyle: {
      fontWeight: ['600', '700', 'bold'],
    },
  },
];
