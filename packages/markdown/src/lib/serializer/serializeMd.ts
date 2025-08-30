import type { Descendant, SlateEditor } from 'platejs';

import remarkStringify from 'remark-stringify';
import { type Plugin, unified } from 'unified';

import type { AllowNodeConfig } from '../MarkdownPlugin';
import type { MdRoot } from '../mdast';
import type { MdRules, PlateType } from '../types';

import { convertNodesSerialize } from './convertNodesSerialize';
import { getMergedOptionsSerialize } from './utils/getMergedOptionsSerialize';
export type SerializeMdOptions = {
  allowedNodes?: PlateType[] | null;
  allowNode?: AllowNodeConfig;
  disallowedNodes?: PlateType[] | null;
  editor?: SlateEditor;
  preserveEmptyParagraphs?: boolean;
  remarkPlugins?: Plugin[];
  rules?: MdRules;
  spread?: boolean;
  value?: Descendant[];
  withBlockId?: boolean;
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
  const processedChildren = convertNodesSerialize(
    children,
    options,
    true // isBlock = true for top-level elements
  ) as MdRoot['children'];

  const ast = {
    children: processedChildren,
    type: 'root',
  } as MdRoot;
  return ast;
};
