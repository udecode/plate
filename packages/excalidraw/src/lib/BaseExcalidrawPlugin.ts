import { type TElement, createSlatePlugin } from '@udecode/plate-common';

import type { ExcalidrawDataState } from './types';

export interface TExcalidrawElement extends TElement {
  data?: {
    elements: ExcalidrawDataState['elements'];
    state: ExcalidrawDataState['appState'];
  } | null;
}

/** Enables support for Excalidraw drawing tool within a Slate document */
export const BaseExcalidrawPlugin = createSlatePlugin({
  key: 'excalidraw',
  node: { isElement: true, isVoid: true },
});
