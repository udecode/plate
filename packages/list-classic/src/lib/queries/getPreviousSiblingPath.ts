import type { Path } from '@platejs/plite';

export const getPreviousSiblingPath = (path: Path): Path | undefined => {
  const index = path.at(-1);

  if (index == null || index <= 0) {
    return;
  }

  return [...path.slice(0, -1), index - 1];
};
