import type { Element } from '@platejs/plite';

import { createEditorPlugin, KEYS } from 'platejs';

import type { ExcalidrawDataState } from './types';

export interface ExcalidrawElement extends Element {
  data?: {
    elements: ExcalidrawDataState['elements'];
    state: ExcalidrawDataState['appState'];
  } | null;
}

/** Enables support for Excalidraw drawing tool within a Plite document */
export const BaseExcalidrawPlugin = createEditorPlugin({
  key: KEYS.excalidraw,
  node: { isElement: true, isVoid: true },
});
