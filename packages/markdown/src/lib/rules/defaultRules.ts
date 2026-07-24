import type { BaseEditor } from '@platejs/core';
import { normalizeDateValue } from '@platejs/date';
import {
  type Descendant,
  type Element,
  ElementApi,
  type Text,
  TextApi,
} from '@platejs/plite';
import { KEYS, type TListElement, type TMentionElement } from '@platejs/utils';

import type {
  MdBlockquote,
  MdHeading,
  MdImage,
  MdLink,
  MdList,
  MdListItem,
  MdMdxJsxFlowElement,
  MdMdxJsxTextElement,
  MdParagraph,
  MdRootContent,
  MdTable,
  MdTableCell,
  MdTableRow,
} from '../mdast';
import type { MentionNode } from '../plugins/remarkMention';
import type {
  DeserializeMdContext,
  MarkdownConversionContext,
  MdRules,
} from '../types';
import {
  buildRulesWithRuntime,
  withMarkdownRuntime,
} from '../internal/markdownRuntime';
import {
  readPlainMarkdownInlineContent,
  toMarkdownCaptionContent,
} from '../internal/markdownDocument';

import {
  buildSlateNode,
  convertChildrenDeserialize,
  convertNodesDeserialize,
  convertTextsDeserialize,
} from '../deserializer';
import { convertNodesSerialize } from '../serializer';
import {
  isMdFlowContent,
  isMdPhrasingContent,
} from '../serializer/wrapWithBlockId';
import { columnRules } from './columnRules';
import { fontRules } from './fontRules';
import { mediaRules } from './mediaRules';

const BARE_AUTOLINK_PROTOCOL_REGEX = /^https?:\/\//i;
import { parseAttributes, propsToAttributes } from './utils';

const LEADING_NEWLINE_REGEX = /^\n/;

const getPluginKey = (context: MarkdownConversionContext, type: string) =>
  context.getPluginKey(type);
const getPluginType = (context: MarkdownConversionContext, key: string) =>
  context.getPluginType(key);

function isBoolean(value: unknown) {
  return (
    value === true ||
    value === false ||
    (!!value &&
      typeof value === 'object' &&
      Object.prototype.toString.call(value) === '[object Boolean]')
  );
}

const createClassicListItemContent = (
  context: MarkdownConversionContext,
  children: readonly Descendant[] = []
) => ({
  children: children.length > 0 ? children : [{ text: '' }],
  type: getPluginType(context, KEYS.lic),
});

const deserializeClassicListItemChildren = (
  mdastChildren: MdRootContent[],
  deco: import('../types').MdDecoration,
  options: DeserializeMdContext
) => {
  const licType = getPluginType(options, KEYS.lic);
  const children = mdastChildren
    .map((child) => {
      if (child.type === 'paragraph') {
        return createClassicListItemContent(
          options,
          convertChildrenDeserialize(child.children, deco, options)
        );
      }

      return convertChildrenDeserialize([child], deco, options)[0];
    })
    .filter(Boolean);

  if (!children.some((child) => child.type === licType)) {
    children.unshift(createClassicListItemContent(options));
  }

  return children;
};

const groupInlineChildrenIntoParagraphs = (
  context: MarkdownConversionContext,
  children: readonly Descendant[] = []
) => {
  const paragraphType = getPluginType(context, KEYS.p);
  const elements: Descendant[] = [];
  let inlineNodes: Descendant[] = [];

  const flushInlineNodes = () => {
    if (inlineNodes.length === 0) return;

    elements.push({
      children: inlineNodes,
      type: paragraphType,
    });
    inlineNodes = [];
  };

  children.forEach((child) => {
    const isBlock =
      ElementApi.isElement(child) &&
      !context.isInline(child) &&
      context.isBlock(child);

    if (isBlock) {
      flushInlineNodes();
      elements.push(child);
      return;
    }

    inlineNodes.push(child);
  });

  flushInlineNodes();

  if (elements.length > 0) {
    return elements;
  }

  return [
    {
      children: [{ text: '' }],
      type: paragraphType,
    },
  ];
};

const normalizeParagraphLineBreaks = (
  children: readonly Descendant[],
  options: { preserveEmptyParagraphs?: boolean }
) => {
  const isEmptyParagraph =
    children.length === 1 &&
    TextApi.isText(children[0]) &&
    children[0].text === '';

  return children.flatMap((child): Descendant[] => {
    const text = (child as { text?: unknown }).text;

    if (
      isEmptyParagraph &&
      text === '' &&
      options.preserveEmptyParagraphs !== false
    ) {
      return [{ ...child, text: '\u200B' }];
    }

    if (typeof text !== 'string' || !text.includes('\n')) {
      return [child];
    }

    return text.split('\n').flatMap((part, index, parts): Descendant[] => {
      const nodes: Descendant[] = [];

      if (part) {
        nodes.push({ ...child, text: part });
      }
      if (index < parts.length - 1) {
        nodes.push({ type: 'break' } as Descendant);
      }

      return nodes;
    });
  });
};

export const defaultRules = {
  a: {
    deserialize: (mdastNode, deco, options) => ({
      children: convertChildrenDeserialize(mdastNode.children, deco, options),
      type: getPluginType(options, KEYS.a),
      url: mdastNode.url,
    }),
    serialize: (node, options) => {
      const children = convertNodesSerialize(
        node.children,
        options
      ) as MdLink['children'];
      const isBareAutolinkLiteral =
        children.length === 1 &&
        children[0]?.type === 'text' &&
        children[0].value === node.url &&
        options.remarkStringifyOptions?.resourceLink !== true &&
        BARE_AUTOLINK_PROTOCOL_REGEX.test(node.url ?? '');

      if (isBareAutolinkLiteral) {
        return {
          type: 'html',
          value: node.url,
        };
      }

      return {
        children,
        type: 'link',
        url: node.url,
      };
    },
  },
  blockquote: {
    deserialize: (mdastNode, deco, options) => ({
      children: groupInlineChildrenIntoParagraphs(
        options,
        convertNodesDeserialize(mdastNode.children, deco, options)
      ),
      type: getPluginType(options, KEYS.blockquote),
    }),
    serialize: (node, options) => ({
      children: convertNodesSerialize(
        groupInlineChildrenIntoParagraphs(options, node.children),
        options
      ) as MdBlockquote['children'],
      type: 'blockquote',
    }),
  },
  bold: {
    mark: true,
    deserialize: (mdastNode, deco, options) =>
      convertTextsDeserialize(mdastNode, deco, options),
  },
  br: {
    deserialize() {
      return [{ text: '\n' }];
    },
  },
  break: {
    deserialize: (_mdastNode, _deco) => ({
      text: '\n',
    }),
    serialize: () => ({
      type: 'break',
    }),
  },
  callout: {
    deserialize: (mdastNode, deco, options) => {
      const props = parseAttributes(mdastNode.attributes);
      const children = convertChildrenDeserialize(
        mdastNode.children,
        deco,
        options
      );
      const paragraph = children.length === 1 ? children[0] : undefined;

      if (
        children.some(
          (child) => ElementApi.isElement(child) && !options.isInline(child)
        ) &&
        (!ElementApi.isElement(paragraph) ||
          paragraph.type !== getPluginType(options, KEYS.p))
      ) {
        throw new Error('Callout children must be inline Markdown content.');
      }

      return {
        children:
          ElementApi.isElement(paragraph) &&
          paragraph.type === getPluginType(options, KEYS.p)
            ? paragraph.children
            : children,
        type: getPluginType(options, KEYS.callout),
        ...props,
      };
    },
    serialize(slateNode, options): MdMdxJsxFlowElement {
      const { children, type, ...rest } = slateNode;
      const serializedChildren = convertNodesSerialize(children, options);

      if (!serializedChildren.every(isMdPhrasingContent)) {
        throw new Error('Callout children must be inline Markdown content.');
      }

      return {
        attributes: propsToAttributes(rest),
        children: [
          {
            children: serializedChildren,
            type: 'paragraph',
          },
        ],
        name: 'callout',
        type: 'mdxJsxFlowElement',
      };
    },
  },
  code: {
    mark: true,
    deserialize: (mdastNode, deco, options) => ({
      ...deco,
      [getPluginType(options, KEYS.code) as 'code']: true,
      text: mdastNode.value,
    }),
  },
  code_block: {
    deserialize: (mdastNode, _deco, options) => ({
      children: (mdastNode.value || '').split('\n').map((line) => ({
        children: [{ text: line } as Text],
        type: getPluginType(options, KEYS.codeLine),
      })),
      ...(mdastNode.lang ? { lang: mdastNode.lang } : {}),
      type: getPluginType(options, KEYS.codeBlock),
    }),
    serialize: (node) => ({
      lang: node.lang,
      type: 'code',
      value: node.children
        .map((child) =>
          TextApi.isText(child)
            ? child.text
            : child.children
                .map((nestedChild) =>
                  TextApi.isText(nestedChild) ? nestedChild.text : ''
                )
                .join('')
        )
        .join('\n'),
    }),
  },
  comment: {
    mark: true,
    deserialize: (mdastNode, deco, options) => {
      // const props = parseAttributes(mdastNode.attributes);
      return convertChildrenDeserialize(
        mdastNode.children,
        {
          [getPluginType(options, KEYS.comment)]: true,
          ...deco,
          // ...props,
        },
        options
      );
    },
    serialize(slateNode): MdMdxJsxTextElement {
      // const { text, comment, ...rest } = slateNode;
      return {
        // attributes: propsToAttributes(rest),
        attributes: [],
        children: [{ type: 'text', value: slateNode.text }],
        name: 'comment',
        type: 'mdxJsxTextElement',
      };
    },
  },
  date: {
    deserialize(mdastNode, _deco, options) {
      const props = parseAttributes(mdastNode.attributes);
      const firstChild = mdastNode.children[0];
      const dateValue =
        typeof props.value === 'string'
          ? props.value
          : firstChild?.type === 'text'
            ? firstChild.value
            : '';

      return {
        children: [{ text: '' }],
        ...normalizeDateValue(dateValue),
        type: getPluginType(options, KEYS.date),
      };
    },
    serialize({ date, rawDate }): MdMdxJsxTextElement {
      if (date && !rawDate) {
        return {
          attributes: propsToAttributes({ value: date }),
          children: [],
          name: 'date',
          type: 'mdxJsxTextElement',
        };
      }

      return {
        attributes: [],
        children: [{ type: 'text', value: rawDate ?? date ?? '' }],
        name: 'date',
        type: 'mdxJsxTextElement',
      };
    },
  },
  del: {
    mark: true,
    deserialize: (mdastNode, deco, options) =>
      convertChildrenDeserialize(
        mdastNode.children,
        {
          [getPluginType(options, KEYS.strikethrough)]: true,
          ...deco,
        },
        options
      ),
    // no serialize because it's mdx <del /> only
  },
  equation: {
    deserialize: (mdastNode, _deco, options) => ({
      children: [{ text: '' }],
      texExpression: mdastNode.value,
      type: getPluginType(options, KEYS.equation),
    }),
    serialize: (node) => ({
      type: 'math',
      value: node.texExpression,
    }),
  },
  footnoteDefinition: {
    deserialize: (mdastNode, deco, options) => {
      const paragraphType = getPluginType(options, KEYS.p);
      const children = convertNodesDeserialize(
        mdastNode.children,
        deco,
        options
      );
      const blocks = children.map((child) =>
        !TextApi.isText(child) && child.type === paragraphType
          ? child
          : {
              children: [child],
              type: paragraphType,
            }
      );

      const identifier = mdastNode.identifier;
      if (blocks.length === 0) {
        return {
          children: [
            {
              children: [{ text: '' }],
              type: paragraphType,
            },
          ],
          identifier,
          type: getPluginType(options, 'footnoteDefinition'),
        };
      }

      return {
        children: blocks,
        identifier,
        type: getPluginType(options, 'footnoteDefinition'),
      };
    },
    serialize: (node, options) => {
      const children = convertNodesSerialize(node.children, options);

      if (!children.every(isMdFlowContent)) {
        throw new Error(
          'Footnote definitions must contain Markdown flow content.'
        );
      }

      return {
        children,
        identifier: node.identifier,
        type: 'footnoteDefinition',
      };
    },
  },
  footnoteReference: {
    deserialize: (mdastNode, _deco, options) => {
      const identifier = mdastNode.identifier ?? '';

      return {
        children: [{ text: '' }],
        identifier,
        type: getPluginType(options, 'footnoteReference'),
      };
    },
    serialize: (node) => ({
      identifier:
        node.identifier ??
        node.children
          ?.map((child) => (TextApi.isText(child) ? child.text : ''))
          .join('') ??
        '',
      type: 'footnoteReference',
    }),
  },
  heading: {
    deserialize: (mdastNode, deco, options) => {
      const headingType = {
        1: 'h1',
        2: 'h2',
        3: 'h3',
        4: 'h4',
        5: 'h5',
        6: 'h6',
      };

      const defaultType = headingType[mdastNode.depth];

      const type = getPluginType(options, defaultType);

      return {
        children: convertChildrenDeserialize(mdastNode.children, deco, options),
        type,
      };
    },
    serialize: (node, options) => {
      const key = getPluginKey(options, node.type) ?? node.type;
      const depthMap: Partial<Record<string, MdHeading['depth']>> = {
        h1: 1,
        h2: 2,
        h3: 3,
        h4: 4,
        h5: 5,
        h6: 6,
      };

      const depth = depthMap[key];

      if (!depth) {
        throw new Error(`Unsupported heading type: ${key}`);
      }

      return {
        children: convertNodesSerialize(
          node.children,
          options
        ) as MdHeading['children'],
        depth,
        type: 'heading',
      };
    },
  },
  highlight: {
    mark: true,
    deserialize: (mdastNode, deco, options) =>
      convertChildrenDeserialize(
        mdastNode.children,
        {
          [getPluginType(options, KEYS.highlight)]: true,
          ...deco,
        },
        options
      ),
    serialize(slateNode): MdMdxJsxTextElement {
      return {
        attributes: [],
        children: [{ type: 'text', value: slateNode.text }],
        name: 'mark',
        type: 'mdxJsxTextElement',
      };
    },
  },
  hr: {
    deserialize: (_, __, options) => ({
      children: [{ text: '' } as Text],
      type: getPluginType(options, KEYS.hr),
    }),
    serialize: () => ({ type: 'thematicBreak' }),
  },
  html: {
    deserialize: (mdastNode, _deco, _options) => ({
      text: (mdastNode.value || '').replaceAll('<br />', '\n'),
    }),
  },
  img: {
    deserialize: (mdastNode, _deco, options) => {
      const { alt, attributes, children: mdxChildren, title, url } = mdastNode;
      const {
        alt: altAttr,
        src,
        ...rest
      } = attributes ? parseAttributes(attributes) : {};
      const resolvedAlt =
        typeof altAttr === 'string' ? altAttr : (alt ?? undefined);
      const caption =
        mdxChildren && mdxChildren.length > 0
          ? toMarkdownCaptionContent(
              options,
              convertChildrenDeserialize(mdxChildren, {}, options)
            )
          : [{ text: '' }];

      return {
        ...(resolvedAlt !== undefined && { alt: resolvedAlt }),
        children: caption,
        ...(title && { title }),
        type: getPluginType(options, KEYS.img),
        url: typeof src === 'string' ? src : url,
        ...rest,
      };
    },
    serialize: (node, options) => {
      const { children, type, url, ...rest } = node;
      const plainCaption = readPlainMarkdownInlineContent(children);
      const { alt: altProperty, title: titleProperty, ...mdxProperties } = rest;
      const semanticAlt =
        typeof altProperty === 'string' ? altProperty : undefined;
      const title =
        typeof titleProperty === 'string' ? titleProperty : undefined;
      const attributes = propsToAttributes({
        ...(semanticAlt !== undefined && { alt: semanticAlt }),
        ...mdxProperties,
        src: url,
        ...(title !== undefined && { title }),
      });

      if (plainCaption !== '') {
        const serializedChildren =
          plainCaption === null
            ? convertNodesSerialize(children, options)
            : [{ type: 'text' as const, value: plainCaption }];

        if (!serializedChildren.every(isMdPhrasingContent)) {
          throw new Error('Image caption must be Markdown inline content.');
        }

        return {
          attributes: [],
          children: [
            {
              attributes,
              children: [],
              name: type,
              type: 'mdxJsxFlowElement',
            },
            {
              attributes: [],
              children: [{ children: serializedChildren, type: 'paragraph' }],
              name: 'figcaption',
              type: 'mdxJsxFlowElement',
            },
          ],
          name: 'figure',
          type: 'mdxJsxFlowElement',
        };
      }

      if (Object.keys(mdxProperties).length > 0) {
        return {
          attributes,
          children: [],
          name: type,
          type: 'mdxJsxFlowElement',
        };
      }

      const image: MdImage = {
        alt: semanticAlt ?? '',
        title,
        type: 'image',
        url,
      };

      // since plate is using block image so we need to wrap it in a paragraph
      return { children: [image], type: 'paragraph' };
    },
  },
  inline_equation: {
    deserialize(mdastNode, _, options) {
      return {
        children: [{ text: '' }],
        texExpression: mdastNode.value,
        type: getPluginType(options, KEYS.inlineEquation),
      };
    },
    serialize: (node) => ({
      type: 'inlineMath',
      value: node.texExpression,
    }),
  },
  italic: {
    mark: true,
    deserialize: (mdastNode, deco, options) =>
      convertTextsDeserialize(mdastNode, deco, options),
  },
  kbd: {
    mark: true,
    deserialize: (mdastNode, deco, options) =>
      convertChildrenDeserialize(
        mdastNode.children,
        {
          [getPluginType(options, KEYS.kbd)]: true,
          ...deco,
        },
        options
      ),
    serialize(slateNode): MdMdxJsxTextElement {
      return {
        attributes: [],
        children: [{ type: 'text', value: slateNode.text }],
        name: 'kbd',
        type: 'mdxJsxTextElement',
      };
    },
  },
  list: {
    deserialize: (mdastNode: MdList, deco, options) => {
      // Handle standard list
      const isIndentList = options.hasPlugin(KEYS.list);

      if (!isIndentList) {
        // For standard lists, we need to ensure each list item is properly structured
        const children = mdastNode.children.map((child) => {
          if (child.type === 'listItem') {
            return {
              children: deserializeClassicListItemChildren(
                child.children,
                deco,
                options
              ),
              type: getPluginType(options, KEYS.li),
            };
          }
          return convertChildrenDeserialize([child], deco, options)[0];
        });

        return {
          children,
          type: getPluginType(
            options,
            mdastNode.ordered ? KEYS.olClassic : KEYS.ulClassic
          ),
        };
      }

      const parseListItems = (listNode: MdList, indent = 1, startIndex = 1) => {
        const items: Element[] = [];
        const isOrdered = !!listNode.ordered;
        let listStyleType = isOrdered
          ? getPluginType(options, KEYS.ol)
          : getPluginType(options, KEYS.ul);

        listNode.children?.forEach((listItem, index) => {
          if (listItem.type !== 'listItem') return;

          const isTodoList = isBoolean(listItem.checked);

          if (isTodoList) listStyleType = getPluginType(options, KEYS.listTodo);

          // Handle the main content of the list item
          const [paragraph, ...subLists] = listItem.children || [];

          // Create list item from paragraph content
          const itemNodes: Descendant[] = paragraph
            ? buildSlateNode(paragraph, deco, options)
            : [
                {
                  children: [{ text: '' }],
                  type: getPluginType(options, KEYS.p),
                },
              ];

          // Add list properties to each node
          itemNodes.forEach((node, nodeIndex) => {
            const element = TextApi.isText(node)
              ? {
                  children: [node],
                  type: getPluginType(options, KEYS.p),
                }
              : node;
            const itemContent: TListElement = {
              ...element,
              indent,
              listStyleType,
              type:
                element.type === getPluginType(options, KEYS.img)
                  ? element.type
                  : getPluginType(options, KEYS.p),
            };

            if (isTodoList) {
              itemContent.checked = listItem.checked!;
            }
            if (isOrdered) {
              itemContent.listStart = startIndex + index;
              if (index === 0 && nodeIndex === 0 && itemContent.listStart > 1) {
                itemContent.listRestartPolite = itemContent.listStart;
              }
            }

            items.push(itemContent);
          });

          // Process sub-lists and other content
          subLists.forEach((subNode) => {
            if (subNode.type === 'list') {
              // Recursively process nested lists
              const subListStart = subNode.start || 1;
              const nestedItems = parseListItems(
                subNode,
                indent + 1,
                subListStart
              );
              items.push(...nestedItems);
            } else {
              // Transform any other node type using buildSlateNode
              const result = buildSlateNode(subNode, deco, options);

              items.push(
                ...result
                  .filter((item): item is Element => !TextApi.isText(item))
                  .map((item) => ({
                    ...item,
                    indent: indent + 1,
                  }))
              );
            }
          });
        });

        return items;
      };

      const startIndex = mdastNode.start || 1;
      return parseListItems(mdastNode, 1, startIndex);
    },
    serialize: (node, options): MdList => {
      const context = options;
      const isOrdered = getPluginKey(context, node.type) === KEYS.olClassic;

      const serializeListItems = (
        children: readonly Descendant[]
      ): MdListItem[] => {
        const items: MdListItem[] = [];
        let currentItem: MdListItem | null = null;

        for (const child of children) {
          if (TextApi.isText(child)) continue;

          if (getPluginKey(context, child.type) === 'li') {
            if (currentItem) {
              items.push(currentItem);
            }
            currentItem = {
              children: [],
              spread: false,
              type: 'listItem',
            };

            for (const liChild of child.children) {
              if (TextApi.isText(liChild)) continue;

              if (getPluginKey(context, liChild.type) === 'lic') {
                currentItem.children.push({
                  children: convertNodesSerialize(
                    liChild.children,
                    options
                  ).filter(isMdPhrasingContent),
                  type: 'paragraph',
                });
              } else if (
                getPluginKey(context, liChild.type) === 'ol' ||
                getPluginKey(context, liChild.type) === 'ul'
              ) {
                currentItem.children.push({
                  children: serializeListItems(liChild.children),
                  ordered: getPluginKey(context, liChild.type) === 'ol',
                  spread: false,
                  type: 'list',
                });
              }
            }
          }
        }

        if (currentItem) {
          items.push(currentItem);
        }

        return items;
      };

      return {
        children: serializeListItems(node.children),
        ordered: isOrdered,
        spread: false,
        type: 'list',
      };
    },
  },
  listItem: {
    deserialize: (mdastNode, deco, options) => ({
      children: deserializeClassicListItemChildren(
        mdastNode.children,
        deco,
        options
      ),
      type: getPluginType(options, KEYS.li),
    }),
    serialize: (node, options) => ({
      children: convertNodesSerialize(node.children, options).filter(
        (child): child is import('../mdast').MdListItem['children'][number] =>
          child.type !== 'definition' && child.type !== 'footnoteDefinition'
      ),
      type: 'listItem',
    }),
  },
  mention: {
    deserialize: (node: MentionNode, _deco, options): TMentionElement => ({
      children: [{ text: '' }],
      type: getPluginType(options, KEYS.mention),
      value: node.displayText || node.username,
      ...(node.displayText && { key: node.username }),
    }),
    serialize: (node: TMentionElement) => {
      const mentionId = node.key || node.value;
      const displayText = node.value;

      // Always use link format for all mentions
      // Encode the mention ID to create a valid URL, manually encoding parentheses
      const encodedId = encodeURIComponent(String(mentionId))
        .replace(/\(/g, '%28')
        .replace(/\)/g, '%29');
      return {
        children: [{ type: 'text', value: displayText }],
        type: 'link',
        url: `mention:${encodedId}`,
      };
    },
  },
  p: {
    deserialize: (node, deco, options) => {
      const isKeepLineBreak = options.splitLineBreaks;
      const children = convertChildrenDeserialize(
        node.children,
        deco,
        options
      ).map((child) =>
        TextApi.isText(child) && child.text === '\u200B'
          ? { ...child, text: '' }
          : child
      );
      const splitBlockTypes = new Set(['img']);

      const elements: Descendant[] = [];
      let inlineNodes: Descendant[] = [];

      const flushInlineNodes = () => {
        if (inlineNodes.length > 0) {
          elements.push({
            children: inlineNodes,
            type: getPluginType(options, KEYS.p),
          });
          inlineNodes = [];
        }
      };

      children.forEach((child, index, children) => {
        const { type } = child as { type?: string };

        if (type && splitBlockTypes.has(type)) {
          flushInlineNodes();
          elements.push(child);
        } else if (
          isKeepLineBreak &&
          'text' in child &&
          typeof child.text === 'string'
        ) {
          const textParts = child.text.split('\n');

          // Handle line break generated by <br>
          const isSingleLineBreak =
            child.text === '\n' && inlineNodes.length === 0;

          if (isSingleLineBreak) {
            inlineNodes.push({ ...child, text: '' });
            flushInlineNodes();

            return;
          }

          textParts.forEach((part, index, array) => {
            const isNotFirstPart = index > 0;
            const isNotLastPart = index < array.length - 1;

            // Create new paragraph for non-first parts
            if (isNotFirstPart) {
              flushInlineNodes();
            }
            // Only add non-empty text
            if (part) {
              inlineNodes.push({ ...child, text: part });
            }
            // Create paragraph break for non-last parts
            if (isNotLastPart) {
              flushInlineNodes();
            }
          });
        } else if (
          child.text === '\n' &&
          children.length > 1 &&
          index === children.length - 1
        ) {
          // remove the last br of the paragraph if the previos element is not a br
          // no op
        } else {
          inlineNodes.push(child);
        }
      });

      flushInlineNodes();

      return elements.length === 1 ? elements[0] : elements;
    },
    serialize: (node, options) => {
      const enrichedChildren = normalizeParagraphLineBreaks(
        node.children,
        options
      );

      const convertedNodes = convertNodesSerialize(
        enrichedChildren,
        options
      ) as MdParagraph['children'];

      if (
        convertedNodes.length > 0 &&
        enrichedChildren.at(-1)!.type === 'break'
      ) {
        // if the last child of the paragraph is a line break add an additional one
        convertedNodes.at(-1)!.type = 'html';
        // @ts-expect-error -- value is the right property here
        convertedNodes.at(-1)!.value = '\n<br />';
      }

      return {
        children: convertedNodes,
        type: 'paragraph',
      };
    },
  },
  strikethrough: {
    mark: true,
    deserialize: (mdastNode, deco, options) =>
      convertTextsDeserialize(mdastNode, deco, options),
  },
  subscript: {
    mark: true,
    deserialize: (mdastNode, deco, options) =>
      convertChildrenDeserialize(
        mdastNode.children,
        {
          [getPluginType(options, KEYS.sub)]: true,
          ...deco,
        },
        options
      ),
    serialize(slateNode, _options): MdMdxJsxTextElement {
      return {
        attributes: [],
        children: [{ type: 'text', value: slateNode.text }],
        name: 'sub',
        type: 'mdxJsxTextElement',
      };
    },
  },
  suggestion: {
    mark: true,
    deserialize: (mdastNode, deco, options) => {
      // const props = parseAttributes(mdastNode.attributes);

      return convertChildrenDeserialize(
        mdastNode.children,
        {
          [getPluginType(options, KEYS.suggestion)]: true,
          ...deco,
          // ...props,
        },
        options
      );
    },
    serialize(slateNode): MdMdxJsxTextElement {
      // const { text, suggestion, ...rest } = slateNode;

      return {
        // attributes: propsToAttributes(rest),
        attributes: [],
        children: [{ type: 'text', value: slateNode.text }],
        name: 'suggestion',
        type: 'mdxJsxTextElement',
      };
    },
  },
  superscript: {
    mark: true,
    deserialize: (mdastNode, deco, options) =>
      convertChildrenDeserialize(
        mdastNode.children,
        {
          [getPluginType(options, KEYS.sup)]: true,
          ...deco,
        },
        options
      ),
    serialize(slateNode, _options): MdMdxJsxTextElement {
      return {
        attributes: [],
        children: [{ type: 'text', value: slateNode.text }],
        name: 'sup',
        type: 'mdxJsxTextElement',
      };
    },
  },
  table: {
    deserialize: (node, deco, options) => {
      const rows =
        node.children?.map((row, rowIndex) => ({
          children:
            row.children?.map((cell) => {
              const cellType = rowIndex === 0 ? 'th' : 'td';

              return {
                children: groupInlineChildrenIntoParagraphs(
                  options,
                  convertChildrenDeserialize(cell.children, deco, options)
                ),
                type: getPluginType(options, cellType),
              };
            }) || [],
          type: getPluginType(options, KEYS.tr),
        })) || [];

      return {
        children: rows,
        type: getPluginType(options, KEYS.table),
      };
    },
    serialize: (node, options) => ({
      children: convertNodesSerialize(
        node.children,
        options
      ) as MdTable['children'],
      type: 'table',
    }),
  },
  td: {
    serialize: (node, options) => {
      const children = convertNodesSerialize(
        node.children,
        options
      ) as MdTableCell['children'];

      // Insert <br/> between multiple blocks in table cells
      // since markdown tables don't support multiple blocks natively
      if (children.length > 1) {
        const result: MdTableCell['children'] = [];

        for (let i = 0; i < children.length; i++) {
          result.push(children[i]);

          if (i < children.length - 1) {
            result.push({ type: 'html', value: '<br/>' });
          }
        }

        return { children: result, type: 'tableCell' };
      }

      return { children, type: 'tableCell' };
    },
  },
  text: {
    deserialize: (mdastNode, deco) => ({
      ...deco,
      text: mdastNode.value.replace(LEADING_NEWLINE_REGEX, ''),
    }),
  },
  th: {
    serialize: (node, options) => {
      const children = convertNodesSerialize(
        node.children,
        options
      ) as MdTableCell['children'];

      // Insert <br/> between multiple blocks in table cells
      // since markdown tables don't support multiple blocks natively
      if (children.length > 1) {
        const result: MdTableCell['children'] = [];

        for (let i = 0; i < children.length; i++) {
          result.push(children[i]);

          if (i < children.length - 1) {
            result.push({ type: 'html', value: '<br/>' });
          }
        }

        return { children: result, type: 'tableCell' };
      }

      return { children, type: 'tableCell' };
    },
  },
  toc: {
    deserialize: (mdastNode, deco, options) => ({
      children: convertChildrenDeserialize(mdastNode.children, deco, options),
      type: getPluginType(options, KEYS.toc),
    }),
    serialize: (node, options): MdMdxJsxFlowElement => {
      const children = convertNodesSerialize(node.children, options);

      if (!children.every(isMdFlowContent)) {
        throw new Error(
          'Table of contents must contain Markdown flow content.'
        );
      }

      return {
        attributes: [],
        children,
        name: 'toc',
        type: 'mdxJsxFlowElement',
      };
    },
  },
  tr: {
    serialize: (node, options) => ({
      children: convertNodesSerialize(
        node.children,
        options
      ) as MdTableRow['children'],
      type: 'tableRow',
    }),
  },
  underline: {
    mark: true,
    deserialize: (mdastNode, deco, options) =>
      convertChildrenDeserialize(
        mdastNode.children,
        {
          [getPluginType(options, KEYS.underline)]: true,
          ...deco,
        },
        options
      ),
    serialize(slateNode, _options): MdMdxJsxTextElement {
      return {
        attributes: [],
        children: [{ type: 'text', value: slateNode.text }],
        name: 'u',
        type: 'mdxJsxTextElement',
      };
    },
  },
  ...fontRules,
  ...mediaRules,
  ...columnRules,
} satisfies MdRules;

export const buildRules = (editor: BaseEditor) =>
  withMarkdownRuntime(editor, buildRulesWithRuntime);
