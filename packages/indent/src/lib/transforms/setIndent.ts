import type {
  AnyObject,
  EditorNodesOptions,
  SlateEditor,
} from '@udecode/plate';

import { BaseIndentPlugin } from '../BaseIndentPlugin';

export interface SetIndentOptions {
  /** GetNodeEntries options */
  getNodesOptions?: EditorNodesOptions;

  /**
   * 1 to indent -1 to outdent
   *
   * @default 1
   */
  offset?: number;

  /** Set other props than the indent one. These will be unset if indent = 0. */
  setNodesProps?: ({ indent }: { indent: number }) => AnyObject;

  /** Nodes props to unset when indent = 0. */
  unsetNodesProps?: string[];
}

/** Add offset to the indentation of the selected blocks. */
export const setIndent = (
  editor: SlateEditor,
  {
    getNodesOptions,
    offset = 1,
    setNodesProps,
    unsetNodesProps = [],
  }: SetIndentOptions
) => {
  const { nodeKey } = editor.getInjectProps(BaseIndentPlugin);

  const _nodes = editor.api.nodes({
    block: true,
    mode: 'lowest',
    ...getNodesOptions,
  });
  const nodes = Array.from(_nodes);

  editor.tf.withoutNormalizing(() => {
    nodes.forEach(([node, path]) => {
      const blockIndent = (node[nodeKey!] as number) ?? 0;
      const newIndent = blockIndent + offset;

      const props = setNodesProps?.({ indent: newIndent }) ?? {};

      if (newIndent <= 0) {
        editor.tf.unsetNodes([nodeKey!, ...unsetNodesProps], {
          at: path,
        });
      } else {
        editor.tf.setNodes({ [nodeKey!]: newIndent, ...props }, { at: path });
      }
    });
  });
};
