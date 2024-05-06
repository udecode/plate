import type { ImportedDataState } from '@excalidraw/excalidraw/types/data/types';
import type { ExcalidrawElement } from '@excalidraw/excalidraw/types/element/types';
import type { ExcalidrawProps } from '@excalidraw/excalidraw/types/types';
import type { TElement } from '@udecode/plate-common/server';

export interface TExcalidrawElement extends TElement {
  data?: {
    elements: ExcalidrawDataState['elements'];
    state: ExcalidrawDataState['appState'];
  } | null;
}

export interface ExcalidrawDataState
  extends Omit<ImportedDataState, 'elements'> {
  elements?: null | readonly Partial<ExcalidrawElement>[];
}

// ExcalidrawProps with improved types
export interface TExcalidrawProps extends Omit<ExcalidrawProps, 'initialData'> {
  initialData: ExcalidrawDataState | Promise<ExcalidrawDataState | null> | null;
}
