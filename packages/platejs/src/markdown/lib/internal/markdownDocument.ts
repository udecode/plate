import type {
  MdxJsxAttribute,
  MdxJsxExpressionAttribute,
  MdxJsxFlowElement,
  MdxJsxTextElement,
} from 'mdast-util-mdx';
import type { Node as UnistNode } from 'unist';

import type {
  Descendant,
  EditorDocumentValue,
  Element,
  Text,
  Value,
} from '../../../core';
import { ElementApi, TextApi } from '../../../core';
import { getMarkdownParagraphType } from '../../../internal/plugin/markdownParagraph';
import type { MarkdownConversionContext } from '../types';
import { getMarkdownTagRepair } from './markdownTags';

export type MarkdownSerializeDocumentValue = EditorDocumentValue;

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
  const unclosed = getMarkdownTagRepair(mdastNode)?.repair === 'unclosed';

  if (!mdastNode.children?.length) {
    return unclosed ? `${openTag}>` : `${openTag} />`;
  }

  const inner = mdastNode.children
    .map(serializeUnknownMdxChild)
    .join(mdastNode.type === 'mdxJsxFlowElement' ? '\n' : '');

  if (mdastNode.type === 'mdxJsxFlowElement') {
    return unclosed
      ? `${openTag}>\n${inner}`
      : `${openTag}>\n${inner}\n</${mdastNode.name}>`;
  }

  return unclosed
    ? `${openTag}>${inner}`
    : `${openTag}>${inner}</${mdastNode.name}>`;
};

export const groupMarkdownInlineRuns = (
  children: readonly Descendant[],
  options: Readonly<{
    defaultEmpty?: boolean;
    isBlock: (node: Element) => boolean;
    paragraphType: string;
  }>
): Element[] => {
  const content: Element[] = [];
  let inline: Descendant[] = [];
  const flush = () => {
    if (inline.length === 0) return;
    content.push({
      children: inline,
      type: options.paragraphType,
    });
    inline = [];
  };

  for (const child of children) {
    if (ElementApi.isElement(child) && options.isBlock(child)) {
      flush();
      content.push(child);
    } else {
      inline.push(child);
    }
  }
  flush();

  return content.length > 0 || !options.defaultEmpty
    ? content
    : [
        {
          children: [{ text: '' }],
          type: options.paragraphType,
        },
      ];
};

export const toMarkdownBlockContent = (
  context: MarkdownConversionContext,
  children: readonly Descendant[]
): Value =>
  groupMarkdownInlineRuns(children, {
    defaultEmpty: true,
    isBlock: (child) => context.isBlock(child) && !context.isInline(child),
    paragraphType: getMarkdownParagraphType(context.registry),
  });

export const toMarkdownCaptionContent = (
  context: MarkdownConversionContext,
  children: readonly Descendant[]
): readonly Descendant[] | null => {
  const blocks = toMarkdownBlockContent(context, children);
  const paragraphType = getMarkdownParagraphType(context.registry);

  return blocks.length === 1 && blocks[0].type === paragraphType
    ? blocks[0].children
    : null;
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
