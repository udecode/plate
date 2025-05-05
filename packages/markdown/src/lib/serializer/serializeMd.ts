import type { Descendant, SlateEditor } from '@udecode/plate';

import remarkStringify from 'remark-stringify';
import { type Plugin, unified } from 'unified';
import { xml } from 'zeed-dom';

import type { AllowNodeConfig, NodesConfig } from '../MarkdownPlugin';
import type { MdRoot } from '../mdast';
import type { TRules } from '../rules';

import { convertNodesSerialize } from './convertNodesSerialize';
import { getMergedOptionsSerialize } from './utils/getMergedOptionsSerialize';

export type SerializeMdOptions = {
  allowedNodes?: NodesConfig;
  allowNode?: AllowNodeConfig;
  disallowedNodes?: NodesConfig;
  editor?: SlateEditor;
  remarkPlugins?: Plugin[];
  rules?: TRules;
  value?: Descendant[];
};

const serializeMdxJsxElement = (
  editor: SlateEditor,
  node: any,
  options: SerializeMdOptions
): string => {
  // Handle MDX JSX elements
  if (node.type === 'mdxJsxTextElement' || node.type === 'mdxJsxFlowElement') {
    const attributes = node.attributes.reduce(
      (acc: Record<string, string>, attr: any) => {
        acc[attr.name] = attr.value;
        return acc;
      },
      {}
    );

    // Process all children and join their results
    const content = node.children
      .map((child: any) => serializeMdxJsxElement(editor, child, options))
      .join('');

    return xml(node.name, attributes, content);
  }

  const toRemarkProcessor = unified()
    .use(options.remarkPlugins ?? [])
    .use(remarkStringify);

  return toRemarkProcessor.stringify(node).trimEnd();
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
      emphasis: '_',
      // Configure remark-stringify to handle MDX JSX elements
      handlers: {
        mdxJsxFlowElement: (node) => {
          return serializeMdxJsxElement(editor, node, mergedOptions);
        },
        mdxJsxTextElement: (node) => {
          return serializeMdxJsxElement(editor, node, mergedOptions);
        },
      },
    });

  const mdast = slateToMdast({
    children: value!,
    options: mergedOptions,
  });

  return toRemarkProcessor.stringify(mdast);
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
