import { createBasePlugin } from '@platejs/core';
import type {
  Element,
  NodeInsertNodesOptions,
  NodeProps,
} from '@platejs/plite';
import { KEYS } from '@platejs/utils';

import type { ExcalidrawDataState } from './types';
import { insertExcalidraw } from './transforms';

export interface TExcalidrawElement extends Element {
  data?: {
    elements: ExcalidrawDataState['elements'];
    state: ExcalidrawDataState['appState'];
  } | null;
}

/** Enables support for Excalidraw drawing tool within a Slate document */
export const BaseExcalidrawPlugin = createBasePlugin({
  key: KEYS.excalidraw,
  node: { isElement: true, isVoid: true },
}).extendTx(({ editor, type }) => (tx) => ({
  insert: (
    props?: NodeProps<TExcalidrawElement>,
    options?: NodeInsertNodesOptions<TExcalidrawElement>
  ) => insertExcalidraw(editor, tx, type, props, options),
}));
