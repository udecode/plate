import type { ExcalidrawProps } from '@excalidraw/excalidraw/types';

import type { ExcalidrawDataState } from '../lib';

export interface TExcalidrawProps extends Omit<ExcalidrawProps, 'initialData'> {
  initialData: ExcalidrawDataState | Promise<ExcalidrawDataState | null> | null;
}
