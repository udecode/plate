import { Path } from 'slate';

export const getPreviousPath = (path: Path): Path | undefined => {
  if (path.length === 0) return;

  const last = path[path.length - 1];

  if (last <= 0) return;

  return path.slice(0, -1).concat(last - 1);
};
