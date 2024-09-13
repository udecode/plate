import type { ImportedDataState } from '@excalidraw/excalidraw/types/data/types';
import type { ExcalidrawElement } from '@excalidraw/excalidraw/types/element/types';

export interface ExcalidrawDataState
  extends Omit<ImportedDataState, 'elements'> {
  elements?: readonly Partial<ExcalidrawElement>[] | null;
}
