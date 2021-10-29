import {
  EditorNodesOptions,
  getNodes,
  setNodes,
  UnhangRangeOptions,
} from '@udecode/plate-common';
import {
  AnyObject,
  getPlatePluginOptions,
  SPEditor,
} from '@udecode/plate-core';
import { Transforms } from 'slate';
import { KEY_INDENT } from '../defaults';
import { IndentPluginOptions } from '../types';

export interface SetIndentOptions {
  nodeKey?: string;

  /**
   * 1 to indent
   * -1 to outdent
   * @default 1
   */
  offset?: number;

  /**
   * Set other props than the indent one.
   * These will be unset if indent = 0.
   */
  setNodesProps?: ({ indent }: { indent: number }) => AnyObject;

  /**
   * getNodes options
   */
  getNodesOptions?: EditorNodesOptions & UnhangRangeOptions;
}

/**
 * Add offset to the indentation of the selected blocks.
 */
export const setIndent = (
  editor: SPEditor,
  { offset = 1, getNodesOptions, setNodesProps }: SetIndentOptions
) => {
  const { nodeKey } = getPlatePluginOptions<Required<IndentPluginOptions>>(
    editor,
    KEY_INDENT
  );

  const nodes = Array.from(
    getNodes(editor, {
      block: true,
      ...getNodesOptions,
    })
  );

  nodes.forEach(([node, path]) => {
    const blockIndent = node[nodeKey] ?? 0;
    const newIndent = blockIndent + offset;

    const props = setNodesProps?.({ indent: newIndent }) ?? {};
    const keys = Object.keys(props);

    if (newIndent <= 0) {
      Transforms.unsetNodes(editor, [nodeKey, ...keys], { at: path });
    } else {
      setNodes(editor, { [nodeKey]: newIndent, ...props }, { at: path });
    }
  });
};
