import { getPluginType } from '@platejs/core';
import { KEYS } from '@platejs/utils';

import type { MdRules } from '../types';

import { convertChildrenDeserialize } from '../deserializer/convertChildrenDeserialize';
import { convertNodesSerialize } from '../serializer';
import { isMdFlowContent } from '../serializer/wrapWithBlockId';
import { parseAttributes, propsToAttributes } from './utils';

export const columnRules = {
  column: {
    deserialize: (mdastNode, deco, options) => {
      const props = parseAttributes(mdastNode.attributes);
      return {
        children: convertChildrenDeserialize(
          mdastNode.children,
          { ...deco },
          options
        ),
        type: getPluginType(options.editor!, KEYS.column),
        ...props,
      };
    },
    serialize: (node, options) => {
      const { id, children, type, ...rest } = node;

      const serializedChildren = convertNodesSerialize(children, options);

      if (!serializedChildren.every(isMdFlowContent)) {
        throw new Error('Column children must be Markdown flow content.');
      }

      return {
        attributes: propsToAttributes(rest),
        children: serializedChildren,
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
        ),
        type: getPluginType(options.editor!, KEYS.columnGroup),
        ...props,
      };
    },
    serialize: (node, options) => {
      const { id, children, type, ...rest } = node;

      const serializedChildren = convertNodesSerialize(children, options);

      if (!serializedChildren.every(isMdFlowContent)) {
        throw new Error('Column group children must be Markdown flow content.');
      }

      return {
        attributes: propsToAttributes(rest),
        children: serializedChildren,
        name: type,
        type: 'mdxJsxFlowElement',
      };
    },
  },
} satisfies MdRules;
