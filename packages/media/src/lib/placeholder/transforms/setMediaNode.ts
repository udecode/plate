import {
  type SetNodesOptions,
  type SlateEditor,
  setNodes,
} from '@udecode/plate-common';

type props = {
  type: string;
  url: string;
  isUpload?: boolean;
  name?: string;
  width?: number;
};

export const setMediaNode = (
  editor: SlateEditor,
  props: props,
  options?: SetNodesOptions
) => setNodes(editor, props, options);
