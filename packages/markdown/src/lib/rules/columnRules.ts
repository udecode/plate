import { getPluginType, KEYS } from 'platejs';

import type { MdRules } from '../types';

import { convertChildrenDeserialize } from '../deserializer/convertChildrenDeserialize';
import { convertNodesSerialize } from '../serializer';
import { parseAttributes, propsToAttributes } from './utils';

export const columnRules: MdRules = {
  column: {
    deserialize: (mdastNode, deco, options) => {
      const props = parseAttributes(mdastNode.attributes);
      return {
        children: convertChildrenDeserialize(
          mdastNode.children,
          { ...deco },
          options
        ) as any,
        type: getPluginType(options.editor!, KEYS.column),
        ...props,
      } as any;
    },
    serialize: (node, options) => {
      const { id, children, type, ...rest } = node;

      return {
        attributes: propsToAttributes(rest),
        children: convertNodesSerialize(children, options) as any,
        name: type,
        type: 'mdxJsxFlowElement',
      };
    },
  },
  column_group: {
    deserialize: (mdastNode, deco, options) => {
      const props = parseAttributes(mdastNode.attributes);

      return {
        children: convertChildrenDeserialize(
          mdastNode.children,
          { ...deco },
          options
        ) as any,
        type: getPluginType(options.editor!, KEYS.columnGroup) as any,
        ...props,
      };
    },
    serialize: (node, options) => {
      const { id, children, type, ...rest } = node;

      return {
        attributes: propsToAttributes(rest),
        children: convertNodesSerialize(children, options) as any,
        name: type,
        type: 'mdxJsxFlowElement',
      };
    },
  },
};
