import {
  type AnyObject,
  type GetNodeEntriesOptions,
  type SlateEditor,
  type TEditor,
  type UnhangRangeOptions,
  getNodeEntries,
  setElements,
  unsetNodes,
  withoutNormalizing,
} from '@udecode/plate-common';

import { IndentPlugin } from '../IndentPlugin';

export interface SetIndentOptions<E extends TEditor = TEditor> {
  /** GetNodeEntries options */
  getNodesOptions?: GetNodeEntriesOptions<E> & UnhangRangeOptions;

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
export const setIndent = <E extends SlateEditor>(
  editor: E,
  {
    getNodesOptions,
    offset = 1,
    setNodesProps,
    unsetNodesProps = [],
  }: SetIndentOptions<E>
) => {
  const { nodeKey } = editor.getInjectProps(IndentPlugin);

  const _nodes = getNodeEntries(editor, {
    block: true,
    mode: 'lowest',
    ...getNodesOptions,
  });
  const nodes = Array.from(_nodes);

  withoutNormalizing(editor, () => {
    nodes.forEach(([node, path]) => {
      const blockIndent = (node[nodeKey!] as number) ?? 0;
      const newIndent = blockIndent + offset;

      const props = setNodesProps?.({ indent: newIndent }) ?? {};

      if (newIndent <= 0) {
        unsetNodes(editor, [nodeKey!, ...unsetNodesProps], {
          at: path,
        });
      } else {
        setElements(editor, { [nodeKey!]: newIndent, ...props }, { at: path });
      }
    });
  });
};
