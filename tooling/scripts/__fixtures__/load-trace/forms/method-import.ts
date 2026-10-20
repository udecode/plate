import type { Dirent } from 'node:fs';

export type { Stats } from 'node:fs';

export const join = (
  fragment: { import: (other: unknown) => void },
  other: Dirent
) => fragment.import(other);
