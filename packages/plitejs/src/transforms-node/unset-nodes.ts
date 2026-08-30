import type { AnyEditor as Editor } from '../interfaces/editor';
import type {
  NodeMutationMethods,
  NodeUnsetNodesOptions,
} from '../interfaces/transforms/node';
import { setNodes } from './set-nodes';

export const unsetNodes = ((
  editor: Editor,
  props: string | readonly string[],
  options: NodeUnsetNodesOptions = {}
) => {
  const targetProps = Array.isArray(props) ? props : [props];

  const obj: any = {};

  for (const key of targetProps) {
    obj[key] = null;
  }

  setNodes(editor, obj, options);
}) as NodeMutationMethods['unsetNodes'];
