import { ELEMENT_BLOCKQUOTE } from '@udecode/plate-block-quote';
import {
  ELEMENT_CODE_BLOCK,
  ELEMENT_CODE_LINE,
} from '@udecode/plate-code-block';
import {
  getPluginType,
  TDescendant,
  TElement,
  TText,
  Value,
} from '@udecode/plate-core';
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
import { remarkTransformElementChildren } from './remarkTransformElementChildren';
import { RemarkElementRules } from './types';

// FIXME: underline, subscript superscript not yet supported by remark-slate
export const remarkDefaultElementRules: RemarkElementRules<Value> = {
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
        type: getPluginType(options.editor, headingType),
        children: remarkTransformElementChildren(node, options),
      };
    },
  },
  list: {
    transform: (node, options) => ({
      type: getPluginType(
        options.editor,
        node.ordered ? ELEMENT_OL : ELEMENT_UL
      ),
      children: remarkTransformElementChildren(node, options),
    }),
  },
  listItem: {
    transform: (node, options) => ({
      type: getPluginType(options.editor, ELEMENT_LI),
      children: remarkTransformElementChildren(node, options).map(
        (child) =>
          ({
            ...child,
            type:
              child.type === getPluginType(options.editor, ELEMENT_PARAGRAPH)
                ? getPluginType(options.editor, ELEMENT_LIC)
                : child.type,
          } as TDescendant)
      ),
    }),
  },
  paragraph: {
    transform: (node, options) => {
      const children = remarkTransformElementChildren(node, options);

      const paragraphType = getPluginType(options.editor, ELEMENT_PARAGRAPH);
      const splitBlockTypes = [getPluginType(options.editor, ELEMENT_IMAGE)];

      const elements: TElement[] = [];
      let inlineNodes: TDescendant[] = [];

      const flushInlineNodes = () => {
        if (inlineNodes.length > 0) {
          elements.push({
            type: paragraphType,
            children: inlineNodes,
          });

          inlineNodes = [];
        }
      };

      children.forEach((child) => {
        const { type } = child;

        if (type && splitBlockTypes.includes(type as string)) {
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
  link: {
    transform: (node, options) => ({
      type: getPluginType(options.editor, ELEMENT_LINK),
      url: node.url,
      children: remarkTransformElementChildren(node, options),
    }),
  },
  image: {
    transform: (node, options) => ({
      type: getPluginType(options.editor, ELEMENT_IMAGE),
      children: [{ text: '' } as TText],
      url: node.url,
      caption: [{ text: node.alt } as TText],
    }),
  },
  blockquote: {
    transform: (node, options) => {
      return {
        type: getPluginType(options.editor, ELEMENT_BLOCKQUOTE),
        children: node.children!.flatMap((paragraph) =>
          remarkTransformElementChildren(paragraph, options)
        ),
      };
    },
  },
  code: {
    transform: (node, options) => ({
      type: getPluginType(options.editor, ELEMENT_CODE_BLOCK),
      lang: node.lang ?? undefined,
      children: (node.value || '').split('\n').map((line) => ({
        type: getPluginType(options.editor, ELEMENT_CODE_LINE),
        children: [{ text: line } as TText],
      })),
    }),
  },
  thematicBreak: {
    transform: (node, options) => ({
      type: getPluginType(options.editor, ELEMENT_HR),
      children: [{ text: '' } as TText],
    }),
  },
};
