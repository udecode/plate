import type { MdElementType, MdLeafType } from './types';

import { type SerializeMdOptions, serializeMdNode } from './serializeMdNode';

const isLeafNode = (node: MdElementType | MdLeafType): node is MdLeafType => {
  return typeof (node as MdLeafType).text === 'string';
};

export const defaultSerializeMdNodesOptions: SerializeMdOptions['nodes'] = {
  a: {
    serialize: (children, node) => {
      return `[${children}](${node.url || ''})`;
    },
    type: 'a',
  },
  blockquote: {
    serialize: (children) => `\n> ${children}\n`,
    type: 'blockquote',
  },
  bold: {
    isLeaf: true,
    type: 'bold',
  },
  code: { isLeaf: true, type: 'code' },
  code_block: {
    serialize: (children, node) =>
      `\n\`\`\`${node.language || ''}\n${children}\n\`\`\`\n`,
    type: 'code_block',
  },
  h1: { serialize: (children) => `\n# ${children}\n`, type: 'h1' },
  h2: { serialize: (children) => `\n## ${children}\n`, type: 'h2' },
  h3: { serialize: (children) => `\n### ${children}\n`, type: 'h3' },
  h4: { serialize: (children) => `\n#### ${children}\n`, type: 'h4' },
  h5: {
    serialize: (children) => `\n##### ${children}\n`,
    type: 'h5',
  },
  h6: {
    serialize: (children) => `\n###### ${children}\n`,
    type: 'h6',
  },
  hr: { isVoid: true, serialize: () => '\n---\n', type: 'hr' },
  img: {
    isVoid: true,
    serialize: (_, node, opts) => {
      const caption =
        node.caption
          ?.map((c: MdElementType | MdLeafType) => serializeMdNode(c, opts))
          .join('') ?? '';

      return `\n![${caption}](${node.url || ''})\n`;
    },
    type: 'img',
  },
  italic: { isLeaf: true, type: 'italic' },
  li: {
    serialize: (children, node, { listDepth = 0, nodes }) => {
      const isOL = node && node.parent?.type === nodes.ol.type;

      let spacer = '';

      for (let k = 0; listDepth > k; k++) {
        // https://github.com/remarkjs/remark-react/issues/65
        spacer += isOL ? '   ' : '  ';
      }

      const isNewLine =
        node &&
        (node.parent?.type === nodes.ol.type ||
          node.parent?.type === nodes.ul.type);
      const emptyBefore = isNewLine ? '\n' : '';

      //   const isLastItem =
      //     node.parent &&
      //     node.parent.length! - 1 === node.parent.index &&
      //     node.children.length === 1;
      //   const emptyAfter = isLastItem && listDepth === 0 ? '\n' : '';

      return `${emptyBefore}${spacer}${isOL ? '1.' : '-'} ${children}`;
    },
    type: 'li',
  },
  ol: {
    serialize: (children, _, { listDepth }) => {
      const newLineAfter = listDepth === 0 ? '\n' : '';

      return `${children}${newLineAfter}`;
    },
    type: 'ol',
  },
  p: {
    serialize: (children, node, { ulListStyleTypes = [] }) => {
      const listStyleType = node.listStyleType;

      if (listStyleType) {
        let pre = '';

        // Decrement indent for indent lists
        const listDepth = node.indent ? node.indent - 1 : 0;

        pre += '  '.repeat(listDepth);

        const listStart = node.listStart ?? 1;

        const isOL = !ulListStyleTypes.includes(listStyleType);
        const treatAsLeaf =
          node.children.length === 1 && isLeafNode(node.children[0]);

        // https://github.com/remarkjs/remark-react/issues/65
        if (isOL && listDepth > 0) {
          pre += ' ';
        }

        // TODO: support all styles
        return `${pre}${isOL ? listStart + '.' : '-'} ${children}${treatAsLeaf ? '\n' : ''}`;
      }

      return `\n${children}\n`;
    },
    type: 'p',
  },
  strikethrough: { isLeaf: true, type: 'strikethrough' },
  ul: {
    serialize: (children, _, { listDepth }) => {
      const newLineAfter = listDepth === 0 ? '\n' : '';

      return `${children}${newLineAfter}`;
    },
    type: 'ul',
  },
  underline: { isLeaf: true, type: 'underline' },
};
