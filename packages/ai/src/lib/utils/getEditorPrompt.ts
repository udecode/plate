import { isSelecting } from '@platejs/selection';
import { type SlateEditor, KEYS } from 'platejs';

export type EditorPrompt =
  | ((params: EditorPromptParams) => string)
  | PromptConfig
  | string;

export type EditorPromptParams = {
  editor: SlateEditor;
  isBlockSelecting: boolean;
  isSelecting: boolean;
};

export type PromptConfig = {
  default: string;
  blockSelecting?: string;
  selecting?: string;
};

const createPromptFromConfig = (
  config: PromptConfig,
  params: EditorPromptParams
): string => {
  const { isBlockSelecting, isSelecting } = params;

  if (isBlockSelecting && config.blockSelecting) {
    return config.blockSelecting ?? config.default;
  }
  if (isSelecting && config.selecting) {
    return config.selecting ?? config.default;
  }
  return config.default;
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
