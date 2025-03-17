import { createAtomStore } from '@udecode/plate/react';

interface MediaStore {
  showCaption: boolean;
}

export const {
  MediaProvider,
  mediaStore,
  useMediaSet,
  useMediaStore,
  useMediaValue,
} = createAtomStore(
  {
    showCaption: false,
  } as MediaStore,
  { name: 'media' }
);
