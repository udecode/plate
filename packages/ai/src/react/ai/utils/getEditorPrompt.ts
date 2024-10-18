import type { PlateEditor } from '@udecode/plate-common/react';

import { isSelecting } from '@udecode/plate-selection';
import { BlockSelectionPlugin } from '@udecode/plate-selection/react';

import { getMarkdown } from './getMarkdown';

export type MarkdownType = 'block' | 'editor' | 'selection';

export interface EditorPromptParams {
  editor: PlateEditor;
  isBlockSelecting: boolean;
  isSelecting: boolean;
}

export interface PromptConfig {
  default: string;
  blockSelecting?: string;
  selecting?: string;
}

export type EditorPrompt =
  | ((params: EditorPromptParams) => string)
  | PromptConfig
  | string;

const replacePlaceholders = (
  editor: PlateEditor,
  text: string,
  {
    prompt,
  }: {
    prompt?: string;
  }
): string => {
  let result = text;

  const placeholders: Record<string, MarkdownType> = {
    '{block}': 'block',
    '{editor}': 'editor',
    '{selection}': 'selection',
  };

  Object.entries(placeholders).forEach(([placeholder, type]) => {
    if (text.includes(placeholder)) {
      result = result.replace(placeholder, getMarkdown(editor, type));
    }
  });

  result = result.replace('{prompt}', prompt || '');

  return result;
};

const createPromptFromConfig = (
  config: PromptConfig,
  params: EditorPromptParams
): string => {
  const { isBlockSelecting, isSelecting } = params;

  if (isBlockSelecting && config.blockSelecting) {
    return config.blockSelecting;
  } else if (isSelecting && config.selecting) {
    return config.selecting;
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
