import { createReactEditor, type ReactEditor } from '@platejs/plite-react';

import {
  type CreateYjsPeerOptions,
  createYjsPeerWithEditor,
  type Peer,
} from './collaboration';

export type ReactPeer = Peer<ReactEditor>;

export const createYjsReactPeer = (options: CreateYjsPeerOptions): ReactPeer =>
  createYjsPeerWithEditor(createReactEditor(), options);

export const setEditorDomApi = (
  editor: ReactEditor,
  dom: Partial<Pick<ReactEditor['api']['dom'], 'resolveRangeRect'>>
): void => {
  editor.api = {
    ...editor.api,
    dom: {
      ...editor.api.dom,
      ...dom,
    },
  };
};
