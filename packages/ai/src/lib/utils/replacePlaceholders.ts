import type { SlateEditor } from 'platejs';

import { getMarkdown } from './getMarkdown';

export type MarkdownType =
  | 'block'
  | 'blockSelection'
  | 'blockSelectionWithBlockId'
  | 'blockWithBlockId'
  | 'editor'
  | 'editorWithBlockId'
  | 'tableCellWithId';

export const replacePlaceholders = (
  editor: SlateEditor,
  text: string,
  {
    prompt,
  }: {
    prompt?: string;
  } = {}
): string => {
  let result = text.replace('{prompt}', prompt || '');

  const placeholders: Record<string, MarkdownType> = {
    '{blockSelectionWithBlockId}': 'blockSelectionWithBlockId',
    '{blockSelection}': 'blockSelection',
    '{blockWithBlockId}': 'blockWithBlockId',
    '{block}': 'block',
    '{editorWithBlockId}': 'editorWithBlockId',
    '{editor}': 'editor',
    '{tableCellWithId}': 'tableCellWithId',
  };

  Object.entries(placeholders).forEach(([placeholder, type]) => {
    if (result.includes(placeholder)) {
      result = result.replace(placeholder, getMarkdown(editor, { type }));
    }
  });

  return result;
};
