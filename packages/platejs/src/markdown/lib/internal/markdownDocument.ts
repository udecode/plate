import type {
  MdxJsxAttribute,
  MdxJsxExpressionAttribute,
  MdxJsxFlowElement,
  MdxJsxTextElement,
} from 'mdast-util-mdx';
import type { Node as UnistNode } from 'unist';

import type { Descendant, Element, Text, Value } from '../../../core';
import { ElementApi, PLUGINS, TextApi } from '../../../core';
import type { MarkdownConversionContext } from '../types';

export class MarkdownBlockIdError extends Error {
  override name = 'MarkdownBlockIdError';
}

export type MarkdownSerializeDocumentValue = {
  children: readonly Descendant[];
  roots?: Readonly<Record<string, Value>>;
};

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
  attributes?: Array<MdxJsxAttribute | MdxJsxExpressionAttribute>
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

    return typeof attribute.value === 'string'
      ? `${name}="${attribute.value}"`
      : name;
  });

  return serialized.length > 0 ? ` ${serialized.join(' ')}` : '';
};

export const serializeUnknownMdxNode = (
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

export const toMarkdownBlockContent = (
  context: MarkdownConversionContext,
  children: readonly Descendant[]
): Value => {
  const content: Element[] = [];
  const paragraphType = context.registry.type(PLUGINS.paragraph) ?? 'paragraph';
  let inline: Descendant[] = [];
  const flush = () => {
    if (inline.length === 0) return;

    content.push({
      children: inline,
      type: paragraphType,
    });
    inline = [];
  };

  children.forEach((child) => {
    if (
      ElementApi.isElement(child) &&
      context.isBlock(child) &&
      !context.isInline(child)
    ) {
      flush();
      content.push(child);

      return;
    }

    inline.push(child);
  });
  flush();

  return content.length > 0
    ? content
    : [
        {
          children: [{ text: '' }],
          type: paragraphType,
        },
      ];
};

export const toMarkdownCaptionContent = (
  context: MarkdownConversionContext,
  children: readonly Descendant[]
): readonly Descendant[] => {
  const blocks = toMarkdownBlockContent(context, children);
  const paragraphType = context.registry.type(PLUGINS.paragraph) ?? 'paragraph';

  if (blocks.length !== 1 || blocks[0].type !== paragraphType) {
    throw new Error('Media captions must contain one Markdown paragraph.');
  }

  return blocks[0].children;
};

export const readPlainMarkdownInlineContent = (
  content: readonly Descendant[]
): string | null => {
  if (
    !content.every(
      (child): child is Text =>
        TextApi.isText(child) &&
        Object.keys(child).every((key) => key === 'text')
    )
  ) {
    return null;
  }

  return content.map((child) => child.text).join('');
};
