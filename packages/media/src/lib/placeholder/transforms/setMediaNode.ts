import type { SetNodesOptions, SlateEditor } from 'platejs';

interface MediaNodeProps {
  [key: string]: unknown;
  type: string;
  url: string;
  id?: string;
  initialHeight?: number;
  initialWidth?: number;
  isUpload?: boolean;
  name?: string;
  placeholderId?: string;
  width?: number;
}

export const setMediaNode = (
  editor: SlateEditor,
  props: MediaNodeProps,
  options?: SetNodesOptions
) => editor.tf.setNodes(props, options);
