import { createAtomStore, SCOPE_ELEMENT } from '@udecode/plate-common';

import { EmbedUrlData } from './useMediaState';

export const { mediaStore, useMediaStore } = createAtomStore(
  {
    urlData: {} as EmbedUrlData,
  },
  { name: 'media' as const, scope: SCOPE_ELEMENT }
);
