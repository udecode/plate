import type { MdxJsxFlowElement, MdxJsxTextElement } from 'mdast-util-mdx';

import { getPluginKey, getPluginType, KEYS } from 'platejs';

import type { MdDecoration } from '../../types';
import type { DeserializeMdOptions } from '../deserializeMd';

import { mdastToPlate } from '../../types';
import { getDeserializerByKey } from './getDeserializerByKey';

const MDX_ATTR_NAME_TO_HTML_ATTR: Record<string, string> = {
  className: 'class',
  htmlFor: 'for',
};

const serializeUnknownMdxChild = (child: any): string => {
  if (
    child?.type === 'mdxJsxTextElement' ||
    child?.type === 'mdxJsxFlowElement'
  ) {
    return serializeUnknownMdxNode(child);
  }

  if ('value' in (child ?? {})) {
    return child.value ?? '';
  }

  if (Array.isArray(child?.children)) {
    return child.children.map(serializeUnknownMdxChild).join('');
  }

  return '';
};

const serializeUnknownMdxAttributes = (attributes?: any[]) => {
  if (!attributes?.length) return '';

  const serialized = attributes.map((attribute) => {
    const name = MDX_ATTR_NAME_TO_HTML_ATTR[attribute.name] ?? attribute.name;

    if (attribute.value === undefined || attribute.value === null) {
      return name;
    }

    if (
      typeof attribute.value === 'object' &&
      attribute.value?.type === 'mdxJsxAttributeValueExpression'
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
  const attrs = serializeUnknownMdxAttributes(mdastNode.attributes as any[]);
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
  options: DeserializeMdOptions
) => {
  const customJsxElementKey = mdastNode.name;

  const key =
    getPluginKey(options.editor!, customJsxElementKey as any) ?? mdastNode.name;

  if (key) {
    const nodeParserDeserialize = getDeserializerByKey(
      mdastToPlate(options.editor!, key as any),
      options
    );

    if (nodeParserDeserialize)
      return nodeParserDeserialize(mdastNode, deco, options) as any;
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
        type: getPluginType(options.editor!, KEYS.p),
      },
    ];
  }
};
