import type { Path } from '@platejs/plite';
import { useElementPath } from '@platejs/plite-react';

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
