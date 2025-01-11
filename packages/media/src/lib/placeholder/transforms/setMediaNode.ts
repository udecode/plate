import type { SetNodesOptions, SlateEditor } from '@udecode/plate';

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
) => editor.tf.setNodes(props, options);
