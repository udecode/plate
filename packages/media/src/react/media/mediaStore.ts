import { createAtomStore } from '@udecode/plate/react';

interface MediaStore {
  showCaption: boolean;
}

export const { MediaProvider, mediaStore, useMediaStore } = createAtomStore(
  {
    showCaption: false,
  } as MediaStore,
  { name: 'media' }
);
