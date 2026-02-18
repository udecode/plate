import type { ExcalidrawDataState } from '../lib';

export interface TExcalidrawProps {
  initialData: ExcalidrawDataState | Promise<ExcalidrawDataState | null> | null;
  [key: string]: unknown;
}
