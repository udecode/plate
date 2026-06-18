import { createContext } from 'react';

import type { SlateProjectionStore } from './hooks/use-slate-projection-entries';

export const ProjectionContext = createContext<SlateProjectionStore | null>(
  null
);
