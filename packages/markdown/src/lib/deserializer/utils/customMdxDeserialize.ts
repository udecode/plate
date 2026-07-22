import type {
  MdxJsxAttribute,
  MdxJsxExpressionAttribute,
  MdxJsxFlowElement,
  MdxJsxTextElement,
} from 'mdast-util-mdx';
import type { Node as UnistNode } from 'unist';

import { KEYS } from '@platejs/utils';

import type { DeserializeMdContext, MdDecoration } from '../../types';

import { mdastToPlate } from '../../types';
import { getDeserializerByKey } from './getDeserializerByKey';

const MDX_ATTR_NAME_TO_HTML_ATTR: Record<string, string> = {
  className: 'class',
  htmlFor: 'for',
};

const isMdxJsxNode = (
  node: UnistNode
): node is MdxJsxFlowElement | MdxJsxTextElement =>
  node.type === 'mdxJsxTextElement' || node.type === 'mdxJsxFlowElement';

const serializeUnknownMdxChild = (child: UnistNode): string => {
  if (isMdxJsxNode(child)) {
    return serializeUnknownMdxNode(child);
  }

  if ('value' in child && typeof child.value === 'string') {
    return child.value;
  }

  if ('children' in child && Array.isArray(child.children)) {
    return child.children.map(serializeUnknownMdxChild).join('');
  }

  return '';
};

const serializeUnknownMdxAttributes = (
  attributes?: (MdxJsxAttribute | MdxJsxExpressionAttribute)[]
) => {
  if (!attributes?.length) return '';

  const serialized = attributes.map((attribute) => {
    if (attribute.type === 'mdxJsxExpressionAttribute') {
      return `{${attribute.value}}`;
    }

    const name = MDX_ATTR_NAME_TO_HTML_ATTR[attribute.name] ?? attribute.name;

    if (attribute.value === undefined || attribute.value === null) {
      return name;
    }

    if (
      typeof attribute.value === 'object' &&
      attribute.value.type === 'mdxJsxAttributeValueExpression'
    ) {
      return `${name}={${attribute.value.value}}`;
    }

    return `${name}="${String(attribute.value)}"`;
  });

  return serialized.length > 0 ? ` ${serialized.join(' ')}` : '';
};

const serializeUnknownMdxNode = (
  mdastNode: MdxJsxFlowElement | MdxJsxTextElement
) => {
  const attrs = serializeUnknownMdxAttributes(mdastNode.attributes);
  const openTag = `<${mdastNode.name}${attrs}`;

  if (!mdastNode.children?.length) {
    return `${openTag} />`;
  }

  const inner = mdastNode.children
    .map(serializeUnknownMdxChild)
    .join(mdastNode.type === 'mdxJsxFlowElement' ? '\n' : '');

  if (mdastNode.type === 'mdxJsxFlowElement') {
    return `${openTag}>\n${inner}\n</${mdastNode.name}>`;
  }

  return `${openTag}>${inner}</${mdastNode.name}>`;
};

export const customMdxDeserialize = (
  mdastNode: MdxJsxFlowElement | MdxJsxTextElement,
  deco: MdDecoration,
  options: DeserializeMdContext
) => {
  const customJsxElementKey = mdastNode.name;

  const key = customJsxElementKey
    ? (options.getPluginKey(customJsxElementKey) ?? customJsxElementKey)
    : null;

  if (key) {
    const nodeParserDeserialize = getDeserializerByKey(
      options.getPluginType(mdastToPlate(key)),
      options
    );

    if (nodeParserDeserialize)
      return nodeParserDeserialize(mdastNode, deco, options);
  } else {
    console.warn(
      'This MDX node does not have a parser for deserialization',
      mdastNode
    );
  }

  // Default fallback: preserve tag structure as text
  if (mdastNode.type === 'mdxJsxTextElement') {
    return [
      {
        text: serializeUnknownMdxNode(mdastNode),
      },
    ];
  }

  if (mdastNode.type === 'mdxJsxFlowElement') {
    return [
      {
        children: [
          {
            text: serializeUnknownMdxNode(mdastNode),
          },
        ],
        type: options.getPluginType(KEYS.p),
      },
    ];
  }

  throw new Error('Unsupported MDX node type.');
};
