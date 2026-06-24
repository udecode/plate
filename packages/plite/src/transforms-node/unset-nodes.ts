import { getEditorTransformRegistry } from '../core/transform-registry';
import type { NodeMutationMethods } from '../interfaces/transforms/node';

export const unsetNodes: NodeMutationMethods['unsetNodes'] = (
  editor,
  props,
  options = {}
) => {
  const targetProps = Array.isArray(props) ? props : [props];

  const obj: any = {};

  for (const key of targetProps) {
    obj[key] = null;
  }

  getEditorTransformRegistry(editor).setNodes(obj, options);
};
