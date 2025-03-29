import type { Descendant, SlateEditor } from '@udecode/plate';

import remarkMdx from 'remark-mdx';
import remarkStringify from 'remark-stringify';
import { type Plugin, unified } from 'unified';

import type { MdRoot } from '../mdast';

import { MarkdownPlugin } from '../MarkdownPlugin';
import { convertNodesSerialize } from './convertNodes';

export type SerializeMdOptions = {
  editor: SlateEditor;
};

/** Serialize the editor value to Markdown. */
export const serializeMd = (
  editor: SlateEditor,

  // TODO:
  options?: Omit<SerializeMdOptions, 'editor'> & {
    value?: Descendant[];
  }
) => {
  const remarkPlugins: Plugin[] =
    editor.getOptions(MarkdownPlugin).remarkPlugins;

  const toRemarkProcessor = unified()
    .use(remarkPlugins)
    .use(remarkMdx)
    .use(remarkStringify, {
      // Configure remark-stringify to handle MDX JSX elements
      handlers: {
        mdxJsxTextElement: (node, _, state, info) => {
          if (node.name === 'u') {
            // Handle underline elements specifically
            const content = node.children[0]?.value || '';
            return `<${node.name}>${content}</${node.name}>`;
          }
          // Default handling for other MDX JSX elements
          const attrs = node.attributes
            .map((attr: any) => `${attr.name}="${attr.value}"`)
            .join(' ');
          const attrStr = attrs ? ` ${attrs}` : '';
          const content = (state as any).all(node).join('');
          return `<${node.name}${attrStr}>${content}</${node.name}>`;
        },
      },
    });

  const nodesToSerialize = options?.value ?? editor.children;

  const v = toRemarkProcessor.stringify(
    slateToMdast({
      nodes: nodesToSerialize,
      options: {
        editor,
      },
    })
  );

  return v;
};

const slateToMdast = ({
  nodes,
  options,
}: {
  nodes: Descendant[];
  options: SerializeMdOptions;
}): MdRoot => {
  const ast = {
    children: convertNodesSerialize(nodes, options) as MdRoot['children'],
    type: 'root',
  } as MdRoot;
  return ast;
};
