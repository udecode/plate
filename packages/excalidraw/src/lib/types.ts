import type { ImportedDataState } from '@excalidraw/excalidraw/data/types';
import type { ExcalidrawElement } from '@excalidraw/excalidraw/element/types';

export interface ExcalidrawDataState
  extends Omit<ImportedDataState, 'elements'> {
  elements?: readonly Partial<ExcalidrawElement>[] | null;
}
