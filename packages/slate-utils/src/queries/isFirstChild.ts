import type { Path } from 'slate';

/** Is it the first child of the parent */
export const isFirstChild = (path: Path) => path.at(-1) === 0;
