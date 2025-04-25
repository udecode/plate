import type { TText } from '@udecode/plate';

import type {
  TIndentListElement,
  TMentionElement,
  TStandardListElement,
} from '../internal/types';
import type {
  MdHeading,
  MdImage,
  MdLink,
  MdList,
  MdMdxJsxFlowElement,
  MdMdxJsxTextElement,
  MdParagraph,
  MdRootContent,
  MdTable,
  MdTableCell,
  MdTableRow,
} from '../mdast';
import type { MentionNode } from '../plugins/remarkMention';
import type { TRules } from './types';

import {
  buildSlateNode,
  convertChildrenDeserialize,
  convertTextsDeserialize,
} from '../deserializer';
import { convertNodesSerialize } from '../serializer';
import { getPlateNodeType } from '../utils';

function isBoolean(value: any) {
  return (
    value === true ||
    value === false ||
    (!!value &&
      typeof value == 'object' &&
      Object.prototype.toString.call(value) == '[object Boolean]')
  );
}

export const defaultRules: TRules = {
  a: {
    deserialize: (mdastNode, deco, options) => {
      return {
        children: convertChildrenDeserialize(mdastNode.children, deco, options),
        type: 'a',
        url: mdastNode.url,
      };
    },
    serialize: (node, options) => {
      return {
        children: convertNodesSerialize(
          node.children,
          options
        ) as MdLink['children'],
        type: 'link',
        url: node.url,
      };
    },
  },
  blockquote: {
    deserialize: (mdastNode, deco, options) => {
      const children =
        mdastNode.children.length > 0
          ? mdastNode.children.flatMap((paragraph, index, children) => {
              if (paragraph.type === 'paragraph') {
                if (children.length > 1 && children.length - 1 !== index) {
                  // add a line break between the paragraphs
                  const paragraphChildren = convertChildrenDeserialize(
                    paragraph.children,
                    deco,
                    options
                  );
                  paragraphChildren.push({ text: '\n' }, { text: '\n' });
                  return paragraphChildren;
                }
                return convertChildrenDeserialize(
                  paragraph.children,
                  deco,
                  options
                );
              }

              if ('children' in paragraph) {
                return convertChildrenDeserialize(
                  paragraph.children,
                  deco,
                  options
                );
              }

              return [{ text: '' }];
            })
          : [{ text: '' }];

      const flattenedChildren = children.flatMap((child: any) =>
        child.type === 'blockquote' ? child.children : [child]
      );

      return {
        children: flattenedChildren,
        type: 'blockquote',
      };
    },
    serialize: (node, options) => {
      const nodes = [] as any;

      for (const child of node.children) {
        if (child.text === '\n') {
          nodes.push({
            type: 'break',
          });
        } else {
          nodes.push(child);
        }
      }

      const paragraphChildren = convertNodesSerialize(
        nodes,
        options
      ) as MdParagraph['children'];

      if (
        paragraphChildren.length > 0 &&
        paragraphChildren.at(-1)!.type === 'break'
      ) {
        // if the last child of the paragraph is a line break add an additional one

        paragraphChildren.at(-1)!.type = 'html';
        // @ts-expect-error -- value is ok
        paragraphChildren.at(-1)!.value = '\n<br />';
      }

      return {
        children: [
          {
            children: paragraphChildren,
            type: 'paragraph',
          },
        ],
        type: 'blockquote',
      };
    },
  },
  bold: {
    mark: true,
    deserialize: (mdastNode, deco, options) => {
      return convertTextsDeserialize(mdastNode, deco, options);
    },
  },
  break: {
    deserialize: (mdastNode, deco) => {
      return {
        text: '\n',
      };
    },
    serialize: () => {
      return {
        type: 'break',
      };
    },
  },
  code: {
    mark: true,
    deserialize: (mdastNode, deco, options) => {
      return {
        ...deco,
        code: true,
        text: mdastNode.value,
      };
    },
  },
  code_block: {
    deserialize: (mdastNode, deco, options) => {
      return {
        children: (mdastNode.value || '').split('\n').map((line) => ({
          children: [{ text: line } as TText],
          type: 'code_line',
        })),
        lang: mdastNode.lang ?? undefined,
        type: 'code_block',
      };
    },
    serialize: (node) => {
      return {
        lang: node.lang,
        type: 'code',
        value: node.children
          .map((child: any) =>
            child?.children === undefined
              ? child.text
              : child.children.map((c: any) => c.text).join('')
          )
          .join('\n'),
      };
    },
  },
  date: {
    serialize: ({ date }) => {
      return {
        type: 'text',
        value: date ?? '',
      };
    },
  },
  del: {
    mark: true,
    deserialize: (mdastNode, deco, options) => {
      return convertChildrenDeserialize(
        mdastNode.children,
        { strikethrough: true, ...deco },
        options
      ) as any;
    },
    // no serialize because it's mdx <del /> only
  },
  equation: {
    deserialize: (mdastNode, deco, options) => {
      return {
        children: [{ text: '' }],
        texExpression: mdastNode.value,
        type: 'equation',
      };
    },
    serialize: (node) => {
      return {
        type: 'math',
        value: node.texExpression,
      };
    },
  },
  // plate doesn't support footnoteDefinition and footnoteReference
  // so we need to convert them to p for now
  footnoteDefinition: {
    deserialize: (mdastNode, deco, options) => {
      const children = convertChildrenDeserialize(
        mdastNode.children,
        deco,
        options
      );

      // Flatten nested paragraphs similar to blockquote implementation
      const flattenedChildren = children.flatMap((child: any) =>
        child.type === 'p' ? child.children : [child]
      );

      return {
        children: flattenedChildren,
        type: 'p',
      };
    },
  },
  footnoteReference: {},
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

      return {
        children: convertChildrenDeserialize(mdastNode.children, deco, options),
        type: headingType[mdastNode.depth],
      };
    },
    serialize: (node, options) => {
      const depthMap = {
        h1: 1,
        h2: 2,
        h3: 3,
        h4: 4,
        h5: 5,
        h6: 6,
      };

      return {
        children: convertNodesSerialize(
          node.children,
          options
        ) as MdHeading['children'],
        depth: depthMap[node.type as keyof typeof depthMap] as any,
        type: 'heading',
      };
    },
  },
  highlight: {
    mark: true,
    deserialize: (mdastNode, deco, options) => {
      return convertChildrenDeserialize(
        mdastNode.children,
        { highlight: true, ...deco },
        options
      ) as any;
    },
    serialize(slateNode, options): MdMdxJsxTextElement {
      return {
        attributes: [
          {
            name: 'style',
            type: 'mdxJsxAttribute',
            value: 'background-color: yellow;',
          },
        ],
        children: [{ type: 'text', value: slateNode.text }],
        name: 'highlight',
        type: 'mdxJsxTextElement',
      };
    },
  },
  hr: {
    deserialize: () => {
      return {
        children: [{ text: '' } as TText],
        type: 'hr',
      };
    },
    serialize: () => {
      return { type: 'thematicBreak' };
    },
  },
  html: {
    deserialize: (mdastNode, deco, options) => {
      return {
        text: (mdastNode.value || '').replaceAll('<br />', '\n'),
      };
    },
  },
  img: {
    deserialize: (mdastNode, deco, options) => {
      return {
        caption: [{ text: mdastNode.alt } as TText],
        children: [{ text: '' } as TText],
        type: 'img',
        url: mdastNode.url,
      };
    },
    serialize: ({ caption, url }) => {
      const image: MdImage = {
        alt: caption ? caption.map((c) => (c as any).text).join('') : undefined,
        title: caption
          ? caption.map((c) => (c as any).text).join('')
          : undefined,
        type: 'image',
        url,
      };

      // since plate is using block image so we need to wrap it in a paragraph
      return { children: [image], type: 'paragraph' } as any;
    },
  },
  inline_equation: {
    deserialize(mdastNode) {
      return {
        children: [{ text: '' }],
        texExpression: mdastNode.value,
        type: 'inline_equation',
      };
    },
    serialize: (node) => {
      return {
        type: 'inlineMath',
        value: node.texExpression,
      };
    },
  },
  italic: {
    mark: true,
    deserialize: (mdastNode, deco, options) => {
      return convertTextsDeserialize(mdastNode, deco, options);
    },
  },
  kbd: {
    mark: true,
    deserialize: (mdastNode, deco, options) => {
      return convertChildrenDeserialize(
        mdastNode.children,
        { kbd: true, ...deco },
        options
      ) as any;
    },
  },
  list: {
    deserialize: (
      mdastNode: MdList,
      deco,
      options
    ): TIndentListElement[] | TStandardListElement => {
      // Handle standard list
      const isStandardList = !options.editor?.pluginList.some(
        (p) => p.key === 'listStyleType'
      );

      if (isStandardList) {
        // For standard lists, we need to ensure each list item is properly structured
        const children = mdastNode.children.map((child) => {
          if (child.type === 'listItem') {
            // Process each list item
            return {
              children: child.children.map((itemChild) => {
                if (itemChild.type === 'paragraph') {
                  return {
                    children: convertChildrenDeserialize(
                      itemChild.children,
                      deco,
                      options
                    ),
                    type: 'lic',
                  };
                }
                return convertChildrenDeserialize(
                  [itemChild],
                  deco,
                  options
                )[0];
              }),
              type: 'li',
            };
          }
          return convertChildrenDeserialize([child], deco, options)[0];
        });

        return {
          children,
          type: mdastNode.ordered ? 'ol' : 'ul',
        };
      }

      const parseListItems = (listNode: MdList, indent = 1, startIndex = 1) => {
        const items: any[] = [];
        const isOrdered = !!listNode.ordered;
        let listStyleType = isOrdered ? 'decimal' : 'disc';

        listNode.children?.forEach((listItem, index) => {
          if (listItem.type !== 'listItem') return;

          const isTodoList = isBoolean(listItem.checked);

          if (isTodoList) listStyleType = 'todo';

          // Handle the main content of the list item
          const [paragraph, ...subLists] = listItem.children || [];

          // Create list item from paragraph content
          const result = paragraph
            ? buildSlateNode(paragraph, deco, options)
            : { children: [{ text: '' }], type: 'p' };

          // Convert result to array if it's not already
          const itemNodes = Array.isArray(result) ? result : [result];

          // Add list properties to each node
          itemNodes.forEach((node: any) => {
            const itemContent: TIndentListElement = {
              ...node,
              indent,
              type: (node.type || 'p') as string,
            };

            // Only add listStyleType and listStart for appropriate cases
            itemContent.listStyleType = listStyleType;
            if (isTodoList) {
              itemContent.checked = listItem.checked!;
            }
            if (isOrdered) {
              itemContent.listStart = startIndex + index;
            }

            items.push(itemContent);
          });

          // Process sub-lists and other content
          subLists.forEach((subNode) => {
            if (subNode.type === 'list') {
              // Recursively process nested lists
              const subListStart = (subNode as any).start || 1;
              const nestedItems = parseListItems(
                subNode,
                indent + 1,
                subListStart
              );
              items.push(...nestedItems);
            } else {
              // Transform any other node type using buildSlateNode
              const result = buildSlateNode(subNode, deco, options);

              // Handle both array and single node results
              if (Array.isArray(result)) {
                items.push(
                  ...result.map((item) => ({
                    ...item,
                    indent: indent + 1,
                  }))
                );
              } else {
                items.push({
                  ...(result as any),
                  indent: indent + 1,
                });
              }
            }
          });
        });

        return items;
      };

      const startIndex = (mdastNode as any).start || 1;
      return parseListItems(mdastNode, 1, startIndex);
    },
    serialize: (node: TStandardListElement, options): MdList => {
      const isOrdered = node.type === 'ol';

      const serializeListItems = (children: any[]): any[] => {
        const items = [];
        let currentItem: any = null;

        for (const child of children) {
          if (child.type === 'li') {
            if (currentItem) {
              items.push(currentItem);
            }
            currentItem = {
              children: [],
              spread: false,
              type: 'listItem',
            };

            for (const liChild of child.children) {
              if (liChild.type === 'lic') {
                currentItem.children.push({
                  children: convertNodesSerialize(liChild.children, options),
                  type: 'paragraph',
                });
              } else if (liChild.type === 'ol' || liChild.type === 'ul') {
                currentItem.children.push({
                  children: serializeListItems(liChild.children),
                  ordered: liChild.type === 'ol',
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
    deserialize: (mdastNode, deco, options) => {
      // Transform each paragraph in the list item into a 'lic' type
      const children = mdastNode.children.map((child: MdRootContent) => {
        if (child.type === 'paragraph') {
          return {
            children: convertChildrenDeserialize(child.children, deco, options),
            type: 'lic',
          };
        }
        return convertChildrenDeserialize([child], deco, options)[0];
      });

      return {
        children,
        type: 'li',
      };
    },
    serialize: (node, options) => {
      return {
        children: convertNodesSerialize(node.children, options),
        type: 'listItem',
      };
    },
  },
  mention: {
    deserialize: (node: MentionNode): TMentionElement => ({
      children: [{ text: '' }],
      type: 'mention',
      value: node.username,
    }),
    serialize: (node: TMentionElement) => ({
      type: 'text',
      value: `@${node.value.replaceAll(' ', '_')}`,
    }),
  },
  p: {
    deserialize: (node, deco, options) => {
      const isKeepLineBreak = options.splitLineBreaks;
      const children = convertChildrenDeserialize(node.children, deco, options);
      const paragraphType = getPlateNodeType('paragraph');
      const splitBlockTypes = new Set(['img']);

      const elements: any[] = [];
      let inlineNodes: any[] = [];

      const flushInlineNodes = () => {
        if (inlineNodes.length > 0) {
          elements.push({
            children: inlineNodes,
            type: paragraphType,
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
        } else {
          if (
            child.text === '\n' &&
            children.length > 1 &&
            index === children.length - 1
          ) {
            // remove the last br of the paragraph if the previos element is not a br
            // no op
          } else {
            inlineNodes.push(child);
          }
        }
      });

      flushInlineNodes();

      return elements.length === 1 ? elements[0] : elements;
    },
    serialize: (node, options) => {
      let enrichedChildren = node.children;

      enrichedChildren = enrichedChildren.map((child) => {
        if (child.text === '\n') {
          return {
            type: 'break',
          } as any;
        }
        return child;
      });

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
    deserialize: (mdastNode, deco, options) => {
      return convertTextsDeserialize(mdastNode, deco, options);
    },
  },
  table: {
    deserialize: (node, deco, options) => {
      const rows =
        node.children?.map((row, rowIndex) => {
          return {
            children:
              row.children?.map((cell) => {
                const cellType = rowIndex === 0 ? 'th' : 'td';

                return {
                  children: convertChildrenDeserialize(
                    cell.children,
                    deco,
                    options
                  ).map((child) => {
                    if (!child.type) {
                      return {
                        children: [child],
                        type: 'p',
                      };
                    }

                    return child;
                  }),
                  type: cellType,
                };
              }) || [],
            type: 'tr',
          };
        }) || [];

      return {
        children: rows,
        type: 'table',
      };
    },
    serialize: (node, options) => {
      return {
        children: convertNodesSerialize(
          node.children,
          options
        ) as MdTable['children'],
        type: 'table',
      };
    },
  },
  td: {
    serialize: (node, options) => {
      return {
        children: convertNodesSerialize(
          node.children,
          options
        ) as MdTableCell['children'],
        type: 'tableCell',
      };
    },
  },
  text: {
    deserialize: (mdastNode, deco) => {
      return {
        ...deco,
        text: mdastNode.value.replace(/^\n/, ''),
      };
    },
  },
  th: {
    serialize: (node, options) => {
      return {
        children: convertNodesSerialize(
          node.children,
          options
        ) as MdTableCell['children'],
        type: 'tableCell',
      };
    },
  },
  toc: {
    deserialize: (mdastNode, deco, options) => {
      return {
        children: convertChildrenDeserialize(mdastNode.children, deco, options),
        type: 'toc',
      };
    },
    serialize: (node, options): MdMdxJsxFlowElement => {
      return {
        attributes: [],
        children: convertNodesSerialize(node.children, options) as any,
        name: 'toc',
        type: 'mdxJsxFlowElement',
      };
    },
  },
  tr: {
    serialize: (node, options) => {
      return {
        children: convertNodesSerialize(
          node.children,
          options
        ) as MdTableRow['children'],
        type: 'tableRow',
      };
    },
  },
  underline: {
    mark: true,
    deserialize: (mdastNode, deco, options) => {
      return convertChildrenDeserialize(
        mdastNode.children,
        { underline: true, ...deco },
        options
      ) as any;
    },
    serialize(slateNode, options): MdMdxJsxTextElement {
      return {
        attributes: [],
        children: [{ type: 'text', value: slateNode.text }],
        name: 'u',
        type: 'mdxJsxTextElement',
      };
    },
  },
};
