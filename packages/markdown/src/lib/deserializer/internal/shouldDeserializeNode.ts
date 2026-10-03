import type { MdRootContent } from '../../mdast';
import type { DeserializeMdOptions } from '../deserializeMd';

import { mdastToPlate } from '../../types';

export const isNodeTypeAllowed = (
  type: string,
  {
    allowedNodes,
    disallowedNodes,
  }: Pick<DeserializeMdOptions, 'allowedNodes' | 'disallowedNodes'>
) => {
  if (
    allowedNodes &&
    disallowedNodes &&
    allowedNodes.length > 0 &&
    disallowedNodes.length > 0
  ) {
    throw new Error('Cannot combine allowedNodes with disallowedNodes');
  }

  return allowedNodes
    ? allowedNodes.includes(type)
    : !disallowedNodes?.includes(type);
};

export const shouldDeserializeNode = (
  node: MdRootContent,
  options: DeserializeMdOptions
): boolean => {
  if (!node.type) return true;

  const type = mdastToPlate(options.editor!, node.type);

  if (!isNodeTypeAllowed(type, options)) return false;
  if (options.allowNode?.deserialize) {
    return options.allowNode.deserialize({
      ...node,
      type,
    });
  }

  return true;
};
