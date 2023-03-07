import {
  AnyObject,
  getNodeEntries,
  GetNodeEntriesOptions,
  getPluginInjectProps,
  PlateEditor,
  setElements,
  UnhangRangeOptions,
  unsetNodes,
  Value,
  withoutNormalizing,
} from '@udecode/plate-common';
import { KEY_INDENT } from '../createIndentPlugin';

export interface SetIndentOptions<V extends Value = Value> {
  /**
   * 1 to indent
   * -1 to outdent
   * @default 1
   */
  offset?: number;

  /**
   * getNodeEntries options
   */
  getNodesOptions?: GetNodeEntriesOptions<V> & UnhangRangeOptions;

  /**
   * Set other props than the indent one.
   * These will be unset if indent = 0.
   */
  setNodesProps?: ({ indent }: { indent: number }) => AnyObject;

  /**
   * Nodes props to unset when indent = 0.
   */
  unsetNodesProps?: string[];
}

/**
 * Add offset to the indentation of the selected blocks.
 */
export const setIndent = <V extends Value>(
  editor: PlateEditor<V>,
  {
    offset = 1,
    getNodesOptions,
    setNodesProps,
    unsetNodesProps = [],
  }: SetIndentOptions<V>
) => {
  const { nodeKey } = getPluginInjectProps(editor, KEY_INDENT);

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
