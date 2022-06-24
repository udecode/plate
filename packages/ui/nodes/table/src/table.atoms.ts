import { atom, TElement } from '@udecode/plate-core';

export const hoveredColIndexAtom = atom<number | null>(null);

export const resizingColAtom = atom<{ index: number; width: number } | null>(
  null
);

export const selectedCellsAtom = atom<TElement[] | null>(null);
