import { ELEMENT_BLOCKQUOTE } from '@udecode/plate-block-quote';
import {
  ELEMENT_CODE_BLOCK,
  ELEMENT_CODE_LINE,
} from '@udecode/plate-code-block/server';
import {
  type TDescendant,
  type TElement,
  type TText,
  type Value,
  getPluginType,
} from '@udecode/plate-common/server';
import {
  ELEMENT_H1,
  ELEMENT_H2,
  ELEMENT_H3,
  ELEMENT_H4,
  ELEMENT_H5,
  ELEMENT_H6,
} from '@udecode/plate-heading';
import { ELEMENT_HR } from '@udecode/plate-horizontal-rule';
import { ELEMENT_LINK } from '@udecode/plate-link';
import {
  ELEMENT_LI,
  ELEMENT_LIC,
  ELEMENT_OL,
  ELEMENT_UL,
} from '@udecode/plate-list';
import { ELEMENT_IMAGE } from '@udecode/plate-media';
import { ELEMENT_PARAGRAPH } from '@udecode/plate-paragraph';

import type { MdastNode, RemarkElementRules } from './types';

import { remarkTransformElementChildren } from './remarkTransformElementChildren';

// FIXME: underline, subscript superscript not yet supported by remark-slate
export const remarkDefaultElementRules: RemarkElementRules<Value> = {
  blockquote: {
    transform: (node, options) => {
      return {
        children: node.children!.flatMap((paragraph) =>
          remarkTransformElementChildren(paragraph, options)
        ),
        type: getPluginType(options.editor, ELEMENT_BLOCKQUOTE),
      };
    },
  },
  code: {
    transform: (node, options) => ({
      children: (node.value || '').split('\n').map((line) => ({
        children: [{ text: line } as TText],
        type: getPluginType(options.editor, ELEMENT_CODE_LINE),
      })),
      lang: node.lang ?? undefined,
      type: getPluginType(options.editor, ELEMENT_CODE_BLOCK),
    }),
  },
  heading: {
    transform: (node, options) => {
      const headingType = {
        1: ELEMENT_H1,
        2: ELEMENT_H2,
        3: ELEMENT_H3,
        4: ELEMENT_H4,
        5: ELEMENT_H5,
        6: ELEMENT_H6,
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
      type: getPluginType(options.editor, ELEMENT_IMAGE),
      url: node.url,
    }),
  },
  link: {
    transform: (node, options) => ({
      children: remarkTransformElementChildren(node, options),
      type: getPluginType(options.editor, ELEMENT_LINK),
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
              type: getPluginType(options.editor, ELEMENT_PARAGRAPH),
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
          type: getPluginType(
            options.editor,
            node.ordered ? ELEMENT_OL : ELEMENT_UL
          ),
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
              child.type === getPluginType(options.editor, ELEMENT_PARAGRAPH)
                ? getPluginType(options.editor, ELEMENT_LIC)
                : child.type,
          }) as TDescendant
      ),
      type: getPluginType(options.editor, ELEMENT_LI),
    }),
  },
  paragraph: {
    transform: (node, options) => {
      const children = remarkTransformElementChildren(node, options);

      const paragraphType = getPluginType(options.editor, ELEMENT_PARAGRAPH);
      const splitBlockTypes = new Set([
        getPluginType(options.editor, ELEMENT_IMAGE),
      ]);

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
      type: getPluginType(options.editor, ELEMENT_HR),
    }),
  },
};
