import { createAtomStore } from '@udecode/plate-common/react';

type progresses = Record<string, number>;
interface placeholderStore {
  isUploading: boolean;
  progresses: progresses;
  updatedFiles: File[];
}

export const { PlaceholderProvider, placeholderStore, usePlaceholderStore } =
  createAtomStore(
    {
      isUploading: false,
      progresses: {},
      updatedFiles: [],
    } as placeholderStore,
    { name: 'placeholder' }
  );
