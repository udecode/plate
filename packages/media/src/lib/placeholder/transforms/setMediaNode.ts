import type { BaseEditor } from '@platejs/core';
import type { Node, NodeSetNodesOptions } from '@platejs/plite';

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
  editor: BaseEditor,
  props: props,
  options?: NodeSetNodesOptions<Node>
) => editor.update.nodes.set(props, options);
