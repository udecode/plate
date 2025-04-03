import type { Descendant, SlateEditor } from '@udecode/plate';

import remarkStringify from 'remark-stringify';
import { type Plugin, unified } from 'unified';

import type { AllowNodeConfig, NodesConfig } from '../MarkdownPlugin';
import type { MdRoot } from '../mdast';
import type { TNodes } from '../nodesRule';

import { convertNodesSerialize } from './convertNodesSerialize';
import { getMergedOptionsSerialize } from './utils/getMergedOptions';

export type SerializeMdOptions = {
  allowedNodes?: NodesConfig;
  allowNode?: AllowNodeConfig;
  disallowedNodes?: NodesConfig;
  editor?: SlateEditor;
  nodes?: TNodes | null;
  remarkPlugins?: Plugin[];
  value?: Descendant[];
};

/** Serialize the editor value to Markdown. */
export const serializeMd = (
  editor: SlateEditor,
  options?: Omit<SerializeMdOptions, 'editor'>
) => {
  const mergedOptions = getMergedOptionsSerialize(editor, options);

  const { remarkPlugins, value } = mergedOptions;

  const toRemarkProcessor = unified()
    .use(remarkPlugins ?? [])
    .use(remarkStringify, {
      // Configure remark-stringify to handle MDX JSX elements
      handlers: {
        mdxJsxTextElement: (node, _, state, info) => {
          
          const attrs = node.attributes
            .map((attr: any) => `${attr.name}="${attr.value}"`)
            .join(' ');
          const attrStr = attrs ? ` ${attrs}` : '';

          // Handle underline elements specifically
          const content = node.children[0]?.value || '';
          return `<${node.name}${attrStr}>${content}</${node.name}>`;
        },
      },
    });

  return toRemarkProcessor.stringify(
    slateToMdast({
      children: value!,
      options: mergedOptions,
    })
  );
};

const slateToMdast = ({
  children,
  options,
}: {
  children: Descendant[];
  options: SerializeMdOptions;
}): MdRoot => {
  const ast = {
    children: convertNodesSerialize(children, options) as MdRoot['children'],
    type: 'root',
  } as MdRoot;
  return ast;
};
