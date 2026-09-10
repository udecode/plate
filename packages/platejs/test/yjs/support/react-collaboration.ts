import {
  type CreateYjsPeerOptions,
  createYjsPeerWithEditor,
  type Peer,
} from '../../../../plitejs/test/yjs/support/collaboration';
import {
  createEditor as createPliteReactEditor,
  type Editor as ReactViewEditor,
} from '../../../src/react/core';

export type ReactPeer = Peer<ReactViewEditor>;

export const createYjsReactPeer = (options: CreateYjsPeerOptions): ReactPeer =>
  createYjsPeerWithEditor(createPliteReactEditor(), options);
