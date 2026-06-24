import { createAtomStore } from 'platejs/react';

export type PlaceholderProgresses = Record<string, number>;

export type PlaceholderSize = {
  height: number;
  width: number;
} | null;

export type PlaceholderStore = {
  isUploading: boolean;
  progresses: PlaceholderProgresses;
  size: PlaceholderSize;
  updatedFiles: File[];
};

export type PlaceholderStoreSetter<K extends keyof PlaceholderStore> = (
  value: PlaceholderStore[K]
) => void;

const placeholderInitialState: PlaceholderStore = {
  isUploading: false,
  progresses: {},
  size: null,
  updatedFiles: [],
};

export const {
  PlaceholderProvider,
  placeholderStore,
  usePlaceholderSet,
  usePlaceholderState,
  usePlaceholderStore,
  usePlaceholderValue,
} = createAtomStore(placeholderInitialState, { name: 'placeholder' as const });
