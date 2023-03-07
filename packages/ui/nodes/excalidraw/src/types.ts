import { ImportedDataState } from '@excalidraw/excalidraw/types/data/types';
import { ExcalidrawElement } from '@excalidraw/excalidraw/types/element/types';
import { ExcalidrawProps } from '@excalidraw/excalidraw/types/types';
import { TElement } from '@udecode/plate-common';

export interface TExcalidrawElement extends TElement {
  data?: {
    elements: ExcalidrawDataState['elements'];
    state: ExcalidrawDataState['appState'];
  } | null;
}

export interface ExcalidrawDataState
  extends Omit<ImportedDataState, 'elements'> {
  elements?: readonly Partial<ExcalidrawElement>[] | null;
}

// ExcalidrawProps with improved types
export interface TExcalidrawProps extends Omit<ExcalidrawProps, 'initialData'> {
  initialData: ExcalidrawDataState | null | Promise<ExcalidrawDataState | null>;
}
