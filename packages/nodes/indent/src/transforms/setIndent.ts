import {
  AnyObject,
  EditorNodesOptions,
  getNodes,
  getPluginInjectProps,
  PlateEditor,
  setNodes,
  UnhangRangeOptions,
} from '@udecode/plate-core';
import { Transforms } from 'slate';
import { KEY_INDENT } from '../createIndentPlugin';

export interface SetIndentOptions {
  /**
   * 1 to indent
   * -1 to outdent
   * @default 1
   */
  offset?: number;

  /**
   * getNodes options
   */
  getNodesOptions?: EditorNodesOptions & UnhangRangeOptions;

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
export const setIndent = (
  editor: PlateEditor,
  {
    offset = 1,
    getNodesOptions,
    setNodesProps,
    unsetNodesProps = [],
  }: SetIndentOptions
) => {
  const { nodeKey } = getPluginInjectProps(editor, KEY_INDENT);

  const nodes = Array.from(
    getNodes(editor, {
      block: true,
      ...getNodesOptions,
    })
  );

  nodes.forEach(([node, path]) => {
    const blockIndent = node[nodeKey!] ?? 0;
    const newIndent = blockIndent + offset;

    const props = setNodesProps?.({ indent: newIndent }) ?? {};

    if (newIndent <= 0) {
      Transforms.unsetNodes(editor, [nodeKey!, ...unsetNodesProps], {
        at: path,
      });
    } else {
      setNodes(editor, { [nodeKey!]: newIndent, ...props }, { at: path });
    }
  });
};
