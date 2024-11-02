import { createAtomStore } from '@udecode/plate-common/react';

type Progresses = Record<string, number>;
interface PlaceholderStore {
  mediaSize: {
    height: number;
    width: number;
  } | null;
  isUploading: boolean;
  progresses: Progresses;
  updatedFiles: File[];
}

export const { PlaceholderProvider, placeholderStore, usePlaceholderStore } =
  createAtomStore(
    {
      isUploading: false,
      mediaSize: null,
      progresses: {},
      updatedFiles: [],
    } as PlaceholderStore,
    { name: 'placeholder' }
  );
