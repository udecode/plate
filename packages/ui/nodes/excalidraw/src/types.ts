import { ImportedDataState } from '@excalidraw/excalidraw-next/types/data/types';
import { ExcalidrawElement } from '@excalidraw/excalidraw-next/types/element/types';
import { ExcalidrawProps } from '@excalidraw/excalidraw-next/types/types';
import { TElement } from '@udecode/plate-core';

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
