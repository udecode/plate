import {
  type TDescendant,
  type TElement,
  type TText,
  getPluginType,
} from '@udecode/plate-common';

import type { MdastNode, RemarkElementRules } from './types';

import { remarkTransformElementChildren } from './remarkTransformElementChildren';

// FIXME: underline, subscript superscript not yet supported by remark-slate
export const remarkDefaultElementRules: RemarkElementRules = {
  blockquote: {
    transform: (node, options) => {
      return {
        children: node.children!.flatMap((paragraph) =>
          remarkTransformElementChildren(paragraph, options)
        ),
        type: getPluginType(options.editor, 'blockquote'),
      };
    },
  },
  code: {
    transform: (node, options) => ({
      children: (node.value || '').split('\n').map((line) => ({
        children: [{ text: line } as TText],
        type: getPluginType(options.editor, 'code_line'),
      })),
      lang: node.lang ?? undefined,
      type: getPluginType(options.editor, 'code_block'),
    }),
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
        type: getPluginType(options.editor, headingType),
      };
    },
  },
  image: {
    transform: (node, options) => ({
      caption: [{ text: node.alt } as TText],
      children: [{ text: '' } as TText],
      type: getPluginType(options.editor, 'img'),
      url: node.url,
    }),
  },
  link: {
    transform: (node, options) => ({
      children: remarkTransformElementChildren(node, options),
      type: getPluginType(options.editor, 'a'),
      url: node.url,
    }),
  },
  list: {
    transform: (node, options) => {
      if (options.indentList) {
        const listStyleType = node.ordered ? 'decimal' : 'disc';

        const parseListItems = (
          _node: MdastNode,
          listItems: TElement[] = [],
          indent = 1
        ) => {
          _node.children!.forEach((listItem) => {
            const [paragraph, ...subLists] = listItem.children!;

            listItems.push({
              children: remarkTransformElementChildren(
                paragraph || '',
                options
              ),
              indent,
              listStyleType,
              type: getPluginType(options.editor, 'p'),
            });

            subLists.forEach((subList) => {
              parseListItems(subList, listItems, indent + 1);
            });
          });

          return listItems;
        };

        return parseListItems(node);
      } else {
        return {
          children: remarkTransformElementChildren(node, options),
          type: getPluginType(options.editor, node.ordered ? 'ol' : 'ul'),
        };
      }
    },
  },
  listItem: {
    transform: (node, options) => ({
      children: remarkTransformElementChildren(node, options).map(
        (child) =>
          ({
            ...child,
            type:
              child.type === getPluginType(options.editor, 'p')
                ? getPluginType(options.editor, 'lic')
                : child.type,
          }) as TDescendant
      ),
      type: getPluginType(options.editor, 'li'),
    }),
  },
  paragraph: {
    transform: (node, options) => {
      const children = remarkTransformElementChildren(node, options);

      const paragraphType = getPluginType(options.editor, 'p');
      const splitBlockTypes = new Set([getPluginType(options.editor, 'img')]);

      const elements: TElement[] = [];
      let inlineNodes: TDescendant[] = [];

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
        } else {
          inlineNodes.push(child);
        }
      });

      flushInlineNodes();

      return elements;
    },
  },
  thematicBreak: {
    transform: (node, options) => ({
      children: [{ text: '' } as TText],
      type: getPluginType(options.editor, 'hr'),
    }),
  },
};
