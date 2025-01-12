import {
  type Descendant,
  type TElement,
  type TText,
  BaseParagraphPlugin,
} from '@udecode/plate';

import type { MdastNode, RemarkElementRules } from './types';

import { MarkdownPlugin } from '../MarkdownPlugin';
import { remarkTransformElementChildren } from './remarkTransformElementChildren';
import { remarkTransformNode } from './remarkTransformNode';

// FIXME: underline, subscript superscript not yet supported by remark-slate
export const remarkDefaultElementRules: RemarkElementRules = {
  blockquote: {
    transform: (node, options) => {
      const children = node.children?.length
        ? node.children.flatMap((paragraph) =>
            remarkTransformElementChildren(paragraph, options)
          )
        : [{ text: '' }];

      // Flatten nested blockquotes (e.g. >>>)
      const flattenedChildren = children.flatMap((child: any) =>
        child.type ? child.children : [child]
      );

      return {
        children: flattenedChildren,
        type: options.editor.getType({ key: 'blockquote' }),
      };
    },
  },
  code: {
    transform: (node, options) => {
      const codeblock: TElement = {
        children: (node.value || '').split('\n').map((line) => ({
          children: [{ text: line } as TText],
          type: options.editor.getType({ key: 'code_line' }),
        })),
        type: options.editor.getType({ key: 'code_block' }),
      };

      if (node.lang) {
        codeblock.lang = node.lang;
      }

      return codeblock;
    },
  },
  heading: {
    transform: (node, options) => {
      const headingType = {
        1: 'h1',
        2: 'h2',
        3: 'h3',
        4: 'h4',
        5: 'h5',
        6: 'h6',
      }[node.depth ?? 1];

      return {
        children: remarkTransformElementChildren(node, options),
        type: options.editor.getType({ key: headingType }),
      };
    },
  },
  image: {
    transform: (node, options) => ({
      caption: [{ text: node.alt } as TText],
      children: [{ text: '' } as TText],
      type: options.editor.getType({ key: 'img' }),
      url: node.url,
    }),
  },
  link: {
    transform: (node, options) => ({
      children: remarkTransformElementChildren(node, options),
      type: options.editor.getType({ key: 'a' }),
      url: node.url,
    }),
  },
  list: {
    transform: (node, options) => {
      if (!options.indentList) {
        return {
          children: remarkTransformElementChildren(node, options),
          type: options.editor.getType({ key: node.ordered ? 'ol' : 'ul' }),
        };
      }

      const parseListItems = (
        listNode: MdastNode,
        listItems: TElement[] = [],
        indent = 1,
        startIndex = 1
      ) => {
        // Is this list bullet or ordered?
        const isOrdered = !!listNode.ordered;
        const listStyleType = isOrdered ? 'decimal' : 'disc';

        listNode.children?.forEach((listItem, index) => {
          if (listItem.type !== 'listItem') return;
          if (!listItem.children) {
            listItems.push({
              children: remarkTransformElementChildren(listItem, options),
              type: options.editor.getType(BaseParagraphPlugin),
            });

            return listItems;
          }

          // Each list item can have a "paragraph" + sub-lists
          const [paragraph, ...subLists] = listItem.children;

          const transformedListItem: TElement = {
            children: remarkTransformElementChildren(paragraph || '', options),
            indent,
            listStyleType,
            type: options.editor.getType(BaseParagraphPlugin),
          };

          // Only set listStart if *this* list is ordered
          if (isOrdered) {
            transformedListItem.listStart = startIndex + index;
          }

          listItems.push(transformedListItem);

          // Process sub-lists (which may differ: bullet vs. ordered)
          subLists.forEach((subList) => {
            if (subList.type === 'list') {
              // For a sub-list, we read its .ordered (could differ from parent)
              const subListStart = (subList as any).start || 1;
              parseListItems(subList, listItems, indent + 1, subListStart);
            } else {
              // If this child is not "list", transform normally
              const result = remarkTransformNode(subList, options) as
                | TElement
                | TElement[];

              if (Array.isArray(result)) {
                listItems.push(
                  ...result.map((v) => ({ ...v, indent: indent + 1 }))
                );
              } else {
                listItems.push({ ...result, indent: indent + 1 });
              }
            }
          });
        });

        return listItems;
      };

      // Use start attribute if present on the top-level list
      const startIndex = (node as any).start || 1;

      return parseListItems(node, [], 1, startIndex);
    },
  },
  listItem: {
    transform: (node, options) => ({
      children: remarkTransformElementChildren(node, options).map(
        (child) =>
          ({
            ...child,
            type:
              child.type === options.editor.getType(BaseParagraphPlugin)
                ? options.editor.getType({ key: 'lic' })
                : child.type,
          }) as Descendant
      ),
      type: options.editor.getType({ key: 'li' }),
    }),
  },
  paragraph: {
    transform: (node, options) => {
      const isKeepLineBreak =
        options.editor.getOptions(MarkdownPlugin).splitLineBreaks;

      const children = remarkTransformElementChildren(node, options);

      const paragraphType = options.editor.getType(BaseParagraphPlugin);
      const splitBlockTypes = new Set([options.editor.getType({ key: 'img' })]);

      const elements: TElement[] = [];
      let inlineNodes: Descendant[] = [];

      const flushInlineNodes = () => {
        if (inlineNodes.length > 0) {
          elements.push({
            children: inlineNodes,
            type: paragraphType,
          });

          inlineNodes = [];
        }
      };

      children.forEach((child) => {
        const { type } = child;

        if (type && splitBlockTypes.has(type as string)) {
          flushInlineNodes();
          elements.push(child as TElement);
        } else if (
          isKeepLineBreak &&
          'text' in child &&
          typeof child.text === 'string'
        ) {
          // Handle line break generated by <br>
          const isSingleLineBreak =
            child.text === '\n' && inlineNodes.length === 0;

          if (isSingleLineBreak) {
            inlineNodes.push({ ...child, text: '' });
            flushInlineNodes();

            return;
          }

          // Handle text containing line breaks
          const textParts = child.text.split('\n');

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
          inlineNodes.push(child);
        }
      });

      flushInlineNodes();

      return elements;
    },
  },
  table: {
    transform: (node, options) => {
      const rows =
        node.children?.map((row, rowIndex) => {
          return {
            children:
              row.children?.map((cell) => {
                const cellType = rowIndex === 0 ? 'th' : 'td';

                return {
                  children: remarkTransformElementChildren(cell, options).map(
                    (child) => {
                      if (!child.type) {
                        return {
                          children: [child],
                          type: options.editor.getType(BaseParagraphPlugin),
                        };
                      }

                      return child;
                    }
                  ),
                  type: options.editor.getType({ key: cellType }),
                };
              }) || [],
            type: options.editor.getType({ key: 'tr' }),
          };
        }) || [];

      return {
        children: rows,
        type: options.editor.getType({ key: 'table' }),
      };
    },
  },
  thematicBreak: {
    transform: (node, options) => ({
      children: [{ text: '' } as TText],
      type: options.editor.getType({ key: 'hr' }),
    }),
  },
};
