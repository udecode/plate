import type { Path } from 'plitejs';
import { useElementPath } from 'plitejs/react';

import { useElementContext } from './useElementStore';

/** Subscribe to the live path for the nearest rendered element. */
export const usePath = (): Path => {
  const renderedPath = useElementPath();
  const storedPath = useElementContext()?.path;
  const value = renderedPath ?? storedPath;

  if (!value) {
    throw new Error(
      'usePath() must be used inside a rendered element provider.'
    );
  }

  return value;
};

/** Subscribe to the live path, or return `null` outside a rendered element. */
export const useOptionalPath = (): Path | null => useElementPath();
