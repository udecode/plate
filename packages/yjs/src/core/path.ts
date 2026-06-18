import type { Path } from '@platejs/slate';

export const lastPathIndex = (path: Path): number | undefined => {
  const index = path.length - 1;

  return index < 0 ? undefined : path[index];
};

export const copyPath = (path: Path): Path => {
  const copy = new Array<number>(path.length);

  let index = 0;

  while (index < path.length) {
    const pathValue = path[index];

    if (pathValue === undefined) {
      throw new Error('Cannot copy an invalid path.');
    }

    copy[index] = pathValue;
    index++;
  }

  return copy;
};

export const parentPath = (path: Path): Path => {
  const parent = new Array<number>(Math.max(0, path.length - 1));

  let index = 0;

  while (index < parent.length) {
    const pathValue = path[index];

    if (pathValue === undefined) {
      throw new Error('Cannot get a parent path for an invalid path.');
    }

    parent[index] = pathValue;
    index++;
  }

  return parent;
};

export const nextPath = (path: Path): Path => {
  const lastIndex = path.length - 1;
  const index = path[lastIndex];

  if (index === undefined) {
    throw new Error('Cannot get a next path for the root.');
  }

  const next = new Array<number>(path.length);

  let pathIndex = 0;

  while (pathIndex < lastIndex) {
    const pathValue = path[pathIndex];

    if (pathValue === undefined) {
      throw new Error('Cannot get a next path for an invalid path.');
    }

    next[pathIndex] = pathValue;
    pathIndex++;
  }

  next[lastIndex] = index + 1;

  return next;
};

export const pathsEqual = (
  left: readonly number[],
  right: readonly number[]
): boolean => {
  if (left.length !== right.length) {
    return false;
  }

  let index = 0;

  while (index < left.length) {
    if (left[index] !== right[index]) {
      return false;
    }
    index++;
  }

  return true;
};
