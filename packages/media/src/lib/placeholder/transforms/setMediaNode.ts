import type { EditorUpdateTransaction } from '@platejs/slate';
import type { SlateEditor } from 'platejs';

type SetNodesOptions = Parameters<EditorUpdateTransaction['nodes']['set']>[1];

type props = {
  type: string;
  url: string;
  id?: string;
  initialHeight?: number;
  initialWidth?: number;
  isUpload?: boolean;
  name?: string;
  placeholderId?: string;
  width?: number;
};

export const setMediaNode = (
  editor: SlateEditor,
  props: props,
  options?: SetNodesOptions
) => {
  editor.update((tx) => {
    tx.nodes.set(props, options);
  });
};
