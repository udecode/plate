import {
  type SetNodesOptions,
  type SlateEditor,
  setNodes,
} from '@udecode/plate-common';

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
) => setNodes(editor, props, options);
