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
      `\n\`\`\`${node.lang || ''}\n${children}\`\`\`\n`,
    type: 'code_block',
  },
  code_line: {
    serialize: (children) => `${children}\n`,
    type: 'code_line',
  },
  equation: {
    serialize: (children, node) => `$$\n${node.texExpression}\n$$`,
    type: 'equation',
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
  inline_equation: {
    serialize: (children, node) => `$${node.texExpression}$`,
    type: 'inline_equation',
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
    serialize: (children, node, { nodes, ulListStyleTypes = [] }) => {
      const listStyleType = node.listStyleType;

      const isInTableCell =
        node.parent?.type === nodes.td.type ||
        node.parent?.type === nodes.th.type;

      const breakTag = isInTableCell ? `<br />` : `\n`;

      if (listStyleType) {
        let pre = '';

        // Decrement indent for indent lists
        const listDepth = node.indent ? node.indent - 1 : 0;

        pre += '   '.repeat(listDepth);

        const listStart = node.listStart ?? 1;

        const isOL = !ulListStyleTypes.includes(listStyleType);

        // https://github.com/remarkjs/remark-react/issues/65
        if (isOL && listDepth > 0) {
          pre += ' ';
        }

        // TODO: support all styles
        return `${pre}${isOL ? listStart + '.' : '-'} ${children}${breakTag}`;
      }

      const pre = isInTableCell ? '' : '\n';

      return `${pre}${children}${breakTag}`;
    },
    type: 'p',
  },
  strikethrough: { isLeaf: true, type: 'strikethrough' },
  table: {
    serialize: (children) => {
      const lines = children.split('\n').filter(Boolean);

      // Line 0 is the header row
      const headerLine = lines[0].trim();

      // Remove extra "|" from both sides
      let lineTrimmed = headerLine;

      if (lineTrimmed.startsWith('|')) {
        lineTrimmed = lineTrimmed.slice(1);
      }
      if (lineTrimmed.endsWith('|')) {
        lineTrimmed = lineTrimmed.slice(0, -1);
      }

      // Generate "---" separators based on number of columns
      const cols = lineTrimmed.split('|').length;
      const separator = `| ${Array(cols).fill('---').join(' | ')} |`;

      // Insert separator line into array
      lines.splice(1, 0, separator);

      // Join back into string
      return lines.join('\n');
    },
    type: 'table',
  },
  td: {
    serialize: (children) => {
      return `| ${children}`;
    },
    type: 'td',
  },
  th: {
    serialize: (children) => {
      return `| ${children}`;
    },
    type: 'th',
  },
  tr: {
    serialize: (children) => {
      return `${children} |\n`;
    },
    type: 'tr',
  },
  ul: {
    serialize: (children, _, { listDepth }) => {
      const newLineAfter = listDepth === 0 ? '\n' : '';

      return `${children}${newLineAfter}`;
    },
    type: 'ul',
  },
  underline: { isLeaf: true, type: 'underline' },
};
