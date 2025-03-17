import type { MdElementType, MdLeafType } from './types';

import { type SerializeMdOptions, serializeMdNode } from './serializeMdNode';

const isLeafNode = (node: MdElementType | MdLeafType): node is MdLeafType => {
  return typeof (node as MdLeafType).text === 'string';
};

export const defaultSerializeMdNodesOptions: SerializeMdOptions['nodes'] = {
  a: {
    type: 'a',
    serialize: (children, node) => {
      return `[${children}](${node.url || ''})`;
    },
  },
  blockquote: {
    type: 'blockquote',
    serialize: (children) => `\n> ${children}\n`,
  },
  bold: {
    isLeaf: true,
    type: 'bold',
  },
  code: { isLeaf: true, type: 'code' },
  code_block: {
    type: 'code_block',
    serialize: (children, node) =>
      // eslint-disable-next-line @typescript-eslint/no-base-to-string
      `\n\`\`\`${node.lang || ''}\n${children}\`\`\`\n`,
  },
  code_line: {
    type: 'code_line',
    serialize: (children) => `${children}\n`,
  },
  equation: {
    type: 'equation',
    serialize: (children, node) => `$$\n${node.texExpression}\n$$`,
  },
  h1: { type: 'h1', serialize: (children) => `\n# ${children}\n` },
  h2: { type: 'h2', serialize: (children) => `\n## ${children}\n` },
  h3: { type: 'h3', serialize: (children) => `\n### ${children}\n` },
  h4: { type: 'h4', serialize: (children) => `\n#### ${children}\n` },
  h5: {
    type: 'h5',
    serialize: (children) => `\n##### ${children}\n`,
  },
  h6: {
    type: 'h6',
    serialize: (children) => `\n###### ${children}\n`,
  },
  hr: { isVoid: true, type: 'hr', serialize: () => '\n---\n' },
  img: {
    isVoid: true,
    type: 'img',
    serialize: (_, node, opts) => {
      const caption =
        node.caption
          ?.map((c: MdElementType | MdLeafType) => serializeMdNode(c, opts))
          .join('') ?? '';

      return `\n![${caption}](${node.url || ''})\n`;
    },
  },
  inline_equation: {
    type: 'inline_equation',
    serialize: (children, node) => `$${node.texExpression}$`,
  },
  italic: { isLeaf: true, type: 'italic' },
  li: {
    type: 'li',
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
  },
  ol: {
    type: 'ol',
    serialize: (children, _, { listDepth }) => {
      const newLineAfter = listDepth === 0 ? '\n' : '';

      return `${children}${newLineAfter}`;
    },
  },
  p: {
    type: 'p',
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
  },
  strikethrough: { isLeaf: true, type: 'strikethrough' },
  table: {
    type: 'table',
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
  },
  td: {
    type: 'td',
    serialize: (children) => {
      return `| ${children}`;
    },
  },
  th: {
    type: 'th',
    serialize: (children) => {
      return `| ${children}`;
    },
  },
  tr: {
    type: 'tr',
    serialize: (children) => {
      return `${children} |\n`;
    },
  },
  ul: {
    type: 'ul',
    serialize: (children, _, { listDepth }) => {
      const newLineAfter = listDepth === 0 ? '\n' : '';

      return `${children}${newLineAfter}`;
    },
  },
  underline: { isLeaf: true, type: 'underline' },
};
