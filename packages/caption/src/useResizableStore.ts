import { createAtomStore } from '@udecode/plate-common';

interface CaptionStore {
  showCaption: boolean;
}

export const { CaptionProvider, captionStore, useCaptionStore } =
  createAtomStore(
    {
      showCaption: false,
    } as CaptionStore,
    { name: 'caption' }
  );
