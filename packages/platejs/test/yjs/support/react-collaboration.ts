import {
  createEditor as createPliteReactEditor,
  type Editor as ReactViewEditor,
} from '../../../src/react/core';
import {
  type CreateYjsPeerOptions,
  createYjsPeerWithEditor,
  type Peer,
} from './collaboration';

export type ReactPeer = Peer<ReactViewEditor>;

export const createYjsReactPeer = (options: CreateYjsPeerOptions): ReactPeer =>
  createYjsPeerWithEditor(createPliteReactEditor(), options);

export const setEditorDomApi = (
  editor: ReactViewEditor,
  dom: Partial<Pick<ReactViewEditor['api']['dom'], 'resolveRangeRect'>>
): void => {
  editor.api = {
    ...editor.api,
    dom: {
      ...editor.api.dom,
      ...dom,
    },
  };
};
