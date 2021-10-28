import {
  EditorNodesOptions,
  getNodes,
  setNodes,
  UnhangRangeOptions,
} from '@udecode/plate-common';
import { AnyObject, TEditor } from '@udecode/plate-core';
import { Transforms } from 'slate';
import { KEY_INDENT } from '../defaults';

export interface SetIndentOptions {
  keyIndent?: string;

  /**
   * 1 to indent
   * -1 to outdent
   * @default 1
   */
  offset: number;

  /**
   * Set other props than the indent one.
   * These will be unset if indent = 0.
   */
  setNodesProps: ({ indent }: { indent: number }) => AnyObject;

  /**
   * getNodes options
   */
  getNodesOptions: EditorNodesOptions & UnhangRangeOptions;
}

/**
 * Add offset to the indentation of the selected blocks.
 */
export const setIndent = (
  editor: TEditor,
  {
    offset = 1,
    keyIndent = KEY_INDENT,
    getNodesOptions,
    setNodesProps,
  }: SetIndentOptions
) => {
  const nodes = Array.from(
    getNodes(editor, {
      block: true,
      ...getNodesOptions,
    })
  );

  nodes.forEach(([node, path]) => {
    const blockIndent = node[keyIndent] ?? 0;
    const newIndent = blockIndent + offset;

    const props = setNodesProps?.({ indent: newIndent }) ?? {};
    const keys = Object.keys(props);

    if (newIndent <= 0) {
      Transforms.unsetNodes(editor, [keyIndent, ...keys], { at: path });
    } else {
      setNodes(editor, { [keyIndent]: newIndent, ...props }, { at: path });
    }
  });
};
