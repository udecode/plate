import { isSelecting } from '@platejs/selection';
import { type SlateEditor, KEYS } from 'platejs';

import { getMarkdown } from './getMarkdown';

export type EditorPrompt =
  | ((params: EditorPromptParams) => string)
  | PromptConfig
  | string;

export interface EditorPromptParams {
  editor: SlateEditor;
  isBlockSelecting: boolean;
  isSelecting: boolean;
}

export type MarkdownType =
  | 'block'
  | 'blockSelection'
  | 'blockSelectionWithBlockId'
  | 'blockWithBlockId'
  | 'editor'
  | 'editorWithBlockId';

export interface PromptConfig {
  default: string;
  blockSelecting?: string;
  selecting?: string;
}

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
  };

  Object.entries(placeholders).forEach(([placeholder, type]) => {
    if (result.includes(placeholder)) {
      result = result.replace(placeholder, getMarkdown(editor, { type }));
    }
  });

  return result;
};

const createPromptFromConfig = (
  config: PromptConfig,
  params: EditorPromptParams
): string => {
  const { isBlockSelecting, isSelecting } = params;

  if (isBlockSelecting && config.blockSelecting) {
    return config.blockSelecting ?? config.default;
  } else if (isSelecting && config.selecting) {
    return config.selecting ?? config.default;
  } else {
    return config.default;
  }
};

export const getEditorPrompt = (
  editor: SlateEditor,
  {
    prompt = '',
  }: {
    prompt?: EditorPrompt;
  }
): string => {
  const params: EditorPromptParams = {
    editor,
    isBlockSelecting: editor.getOption(
      { key: KEYS.blockSelection },
      'isSelectingSome'
    ),
    isSelecting: isSelecting(editor),
  };

  let promptText = '';

  if (typeof prompt === 'function') {
    promptText = prompt(params);
  } else if (typeof prompt === 'object') {
    promptText = createPromptFromConfig(prompt, params);
  } else {
    promptText = prompt;
  }

  return promptText;
};
