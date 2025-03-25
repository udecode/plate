import type { Descendant, SlateEditor } from '@udecode/plate';

import remarkStringify from 'remark-stringify';
import { type Plugin, unified } from 'unified';

import type { SerializeMdOptions } from './serializeMd';

import { MarkdownPlugin } from '../MarkdownPlugin';
import { convertTexts } from './convertTexts';

export const serializeInlineMd = (
  editor: SlateEditor,
  options?: Omit<SerializeMdOptions, 'editor'> & {
    value?: Descendant[];
  }
) => {
  const remarkPlugins: Plugin[] =
    editor.getOptions(MarkdownPlugin).remarkPlugins;

  const toRemarkProcessor = unified().use(remarkPlugins).use(remarkStringify);

  if (options?.value?.length === 0) return '';

  // Serialize the content
  const serializedContent = toRemarkProcessor.stringify({
    children: convertTexts(options?.value as any, {
      editor,
      ignoreSuggestionType: options?.ignoreSuggestionType,
    }),
    type: 'root',
  });

  return serializedContent;
};
