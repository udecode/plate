import type { ExcalidrawDataState } from '../lib';

export type TExcalidrawProps = {
  initialData: ExcalidrawDataState | Promise<ExcalidrawDataState | null> | null;
  [key: string]: unknown;
};
