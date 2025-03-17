import { createAtomStore } from '@udecode/plate/react';

interface PlaceholderStore {
  isUploading: boolean;
  progresses: Progresses;
  size: {
    height: number;
    width: number;
  } | null;
  updatedFiles: File[];
}
type Progresses = Record<string, number>;

export const {
  PlaceholderProvider,
  placeholderStore,
  usePlaceholderSet,
  usePlaceholderState,
  usePlaceholderStore,
  usePlaceholderValue,
} = createAtomStore(
  {
    isUploading: false,
    progresses: {},
    size: null,
    updatedFiles: [],
  } as PlaceholderStore,
  { name: 'placeholder' }
);
