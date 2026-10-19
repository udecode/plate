import type { Path } from '../../../facade';
import { PathApi } from '../../../facade';
import { useNodeSelector } from '../../plite-react';
import { useElementStoreContext } from './useElementStore';
import { useElementStoreSelector } from './useElementStoreSelector.internal';

/** Subscribe to the live path for the nearest rendered element. */
export function usePath(): Path;
/** Subscribe to a derived path value, skipping equal results. */
export function usePath<T>(
  selector: (path: Path) => T,
  options?: { equalityFn?: (left: T, right: T) => boolean }
): T;
export function usePath<T>(
  selector?: (path: Path) => T,
  options?: { equalityFn?: (left: T, right: T) => boolean }
): T | Path {
  const context = useElementStoreContext();
  const project = (path: Path): T | Path =>
    selector ? selector([...path]) : [...path];
  const equal = (left: T | Path, right: T | Path) => {
    if (selector) {
      return options?.equalityFn
        ? options.equalityFn(left as T, right as T)
        : Object.is(left, right);
    }

    return PathApi.equals(left as Path, right as Path);
  };
  const stored = useElementStoreSelector(context, 'path', project, equal);
  const live = useNodeSelector(
    ({ path }) =>
      path
        ? { found: true as const, value: project(path) }
        : { found: false as const },
    (left, right) => {
      if (!left || left.found !== right.found) return false;
      if (!left.found || !right.found) return true;

      return equal(left.value, right.value);
    }
  );

  if (live.found) return live.value;
  if (context?.runtime.getState().path) return stored as T | Path;

  throw new Error('usePath() must be used inside a rendered element provider.');
}
