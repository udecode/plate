import type { PlateEditor } from '@udecode/plate/react';

import { isSelecting } from '@udecode/plate-selection';
import { BlockSelectionPlugin } from '@udecode/plate-selection/react';

import { getMarkdown } from './getMarkdown';

export type EditorPrompt =
  | ((params: EditorPromptParams) => string)
  | PromptConfig
  | string;

export interface EditorPromptParams {
  editor: PlateEditor;
  isBlockSelecting: boolean;
  isSelecting: boolean;
}

export type MarkdownType = 'block' | 'editor' | 'selection';

export interface PromptConfig {
  default: string;
  blockSelecting?: string;
  selecting?: string;
}

const replacePlaceholders = (
  editor: PlateEditor,
  text: string,
  {
    prompt,
  }: {
    prompt?: string;
  }
): string => {
  let result = text.replace('{prompt}', prompt || '');

  const placeholders: Record<string, MarkdownType> = {
    '{block}': 'block',
    '{editor}': 'editor',
    '{selection}': 'selection',
  };

  Object.entries(placeholders).forEach(([placeholder, type]) => {
    if (result.includes(placeholder)) {
      result = result.replace(placeholder, getMarkdown(editor, type));
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
  editor: PlateEditor,
  {
    prompt = '',
    promptTemplate = () => '{prompt}',
  }: {
    prompt?: EditorPrompt;
    promptTemplate?: (params: EditorPromptParams) => string | void;
  } = {}
): string | undefined => {
  const params: EditorPromptParams = {
    editor,
    isBlockSelecting: editor.getOption(BlockSelectionPlugin, 'isSelectingSome'),
    isSelecting: isSelecting(editor),
  };

  const template = promptTemplate(params);

  if (!template) return;

  let promptText = '';

  if (typeof prompt === 'function') {
    promptText = prompt(params);
  } else if (typeof prompt === 'object') {
    promptText = createPromptFromConfig(prompt, params);
  } else {
    promptText = prompt;
  }

  return replacePlaceholders(editor, template, {
    prompt: promptText,
  });
};
