import type { AnyObject, SlateEditor } from 'platejs';

import { BaseIndentPlugin } from '../BaseIndentPlugin';

export type IndentNodesOptions = NonNullable<
  Parameters<SlateEditor['api']['nodes']>[0]
>;

export type SetIndentOptions = {
  /** GetNodeEntries options */
  getNodesOptions?: IndentNodesOptions;

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
};

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

  editor.update((tx) => {
    nodes.forEach(([node, path]) => {
      const blockIndent = (node[nodeKey!] as number) ?? 0;
      const newIndent = blockIndent + offset;

      const props = setNodesProps?.({ indent: newIndent }) ?? {};

      if (newIndent <= 0) {
        tx.nodes.unset([nodeKey!, ...unsetNodesProps], {
          at: path,
        });
      } else {
        tx.nodes.set({ [nodeKey!]: newIndent, ...props }, { at: path });
      }
    });
  });
};
