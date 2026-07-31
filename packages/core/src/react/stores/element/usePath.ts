import type { Path } from '@platejs/plite';

import type { PlateElementDescriptor } from './useElement';
import { useElementContext } from './useElementStore';

/** Get the current element path and fail when the requested provider is absent. */
export const usePath = (plugin?: PlateElementDescriptor): Path => {
  const scope = plugin?.name;
  const value = useElementContext(scope)?.path;

  if (!value) {
    throw new Error(
      `usePath(${
        scope ?? 'nearest'
      }) must be used inside the matching element provider.`
    );
  }

  return value;
};

/** Get the memoized element path, or `null` when its provider is absent. */
export const useOptionalPath = (plugin?: PlateElementDescriptor): Path | null =>
  useElementContext(plugin?.name)?.path ?? null;
