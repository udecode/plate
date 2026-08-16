import { dispatchCommand } from '../core/command-registry';
import { editorCommands } from '../core/editor-commands';
import type { AnyEditor, EditorStaticApi } from '../interfaces/editor';
import type { Descendant, Node, NodeTypeSelector } from '../interfaces/node';
import type { NodeInsertNodesOptions } from '../interfaces/transforms/node';

export const insertNode = ((
  editor: AnyEditor,
  node: Descendant,
  options?: NodeInsertNodesOptions<Node, NodeTypeSelector | undefined>
) => {
  dispatchCommand(editor, editorCommands.insertNodes, {
    nodes: node,
    options,
  });
}) as EditorStaticApi['insertNode'];
