import { atom } from 'jotai';

export const hoveredColIndexAtom = atom<number | null>(null);

export const resizingColAtom = atom<{ index: number; width: number } | null>(
  null
);
