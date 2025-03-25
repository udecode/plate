import {
  type Descendant,
  type TElement,
  type TText,
  TextApi,
} from '@udecode/plate';

import type { SerializeMdOptions } from './serializeMd';
import type { unistLib } from './types';

import { MarkdownPlugin } from '../MarkdownPlugin';
import { convertTexts } from './convertTexts';
import { defaultSerializeRules } from './defaultSerializeRules';
import { indentListToMdastTree } from './indentListToMdastTree';
import { unreachable } from './utils/unreachable';

export const convertNodes = (
  nodes: Descendant[],
  options: SerializeMdOptions
): unistLib.Node[] => {
  const mdastNodes: unistLib.Node[] = [];
  let textQueue: TText[] = [];

  const listBlock: TElement[] = [];

  for (let i = 0; i <= nodes.length; i++) {
    const n = nodes[i] as any;

    if (n && TextApi.isText(n)) {
      textQueue.push(n);
    } else {
      mdastNodes.push(...(convertTexts(textQueue) as any as unistLib.Node[]));
      textQueue = [];
      if (!n) continue;

      if (n?.type === 'p' && 'listStyleType' in n) {
        listBlock.push(n);

        const next = nodes[i + 1] as TElement;
        const isNextIndent =
          next && next.type === 'p' && 'listStyleType' in next;

        if (!isNextIndent) {
          mdastNodes.push(indentListToMdastTree(listBlock as any, options));
          listBlock.length = 0;
        }
      } else {
        const node = buildMdastNode(n, options);

        if (node) {
          mdastNodes.push(node as unistLib.Node);
        }
      }
    }
  }

  return mdastNodes;
};

export const buildMdastNode = (node: any, options: SerializeMdOptions) => {
  let key = node.type;

  if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(node.type)) {
    key = 'heading';
  }

  // if (node.type === 'p') {
  //   key = 'paragraph';
  // }

  // if (node.type === 'hr') {
  //   key = 'thematicBreak';
  // }

  // if (node.type === 'a') {
  //   key = 'link';
  // }

  // if (node.type === 'equation') {
  //   key = 'math';
  // }

  // if (node.type === 'inline_equation') {
  //   key = 'inlineMath';
  // }

  // if (node.type === 'img') {
  //   key = 'image';
  // }

  // if (node.type === 'code_block') {
  //   key = 'code';
  // }

  // if (node.type === 'tr') {
  //   key = 'tableRow';
  // }

  // if (node.type === 'td') {
  //   key = 'tableCell';
  // }

  const component =
    options.editor.getOptions(MarkdownPlugin).components?.[key] ??
    defaultSerializeRules[key];

  if (component?.serialize) {
    return component.serialize(node, options);
  }

  unreachable(node);
};
