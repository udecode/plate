import { createAtomStore } from '@platejs/core/react';

type MediaStore = {
  showCaption: boolean;
};

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
) as any;
