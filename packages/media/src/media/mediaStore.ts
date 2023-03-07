import { createAtomStore, SCOPE_ELEMENT } from '@udecode/plate-common';
import { EmbedUrlData } from './parseMediaUrl';

export const { mediaStore, useMediaStore } = createAtomStore(
  {
    urlData: {} as EmbedUrlData,
  },
  { name: 'media' as const, scope: SCOPE_ELEMENT }
);
