import { createContext } from 'react';

import type { PliteProjectionStore } from './hooks/use-plite-projection-entries';

export const ProjectionContext = createContext<PliteProjectionStore | null>(
  null
);
