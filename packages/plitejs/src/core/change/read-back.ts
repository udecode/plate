/** @internal */
export type ReadBack = { changed: boolean };

/** @internal */
export const markReadBack = (readBack: ReadBack | null) => {
  if (readBack) readBack.changed = true;
};
