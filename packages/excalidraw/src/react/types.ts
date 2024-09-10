import type { ExcalidrawProps } from '@excalidraw/excalidraw/types/types';

import type { ExcalidrawDataState } from '../lib';

// ExcalidrawProps with improved types
export interface TExcalidrawProps extends Omit<ExcalidrawProps, 'initialData'> {
  initialData: ExcalidrawDataState | Promise<ExcalidrawDataState | null> | null;
}
