import type { ChatRequestOptions } from 'ai';

import { isSelecting } from '@platejs/selection';
import { BlockSelectionPlugin } from '@platejs/selection/react';
import { type Descendant, type Range, KEYS } from 'platejs';
import { type PlateEditor, getEditorPlugin } from 'platejs/react';

import type { AIMode, AIToolName } from '../../../lib/types';
import type { AIChatPluginConfig } from '../AIChatPlugin';

import {
  type EditorPrompt,
  getEditorPrompt,
} from '../../../lib/utils/getEditorPrompt';
import { AIPlugin } from '../../ai/AIPlugin';

export const submitAIChat = (
  editor: PlateEditor,
  input: string,
  {
    mode,
    options,
    prompt,
    toolName,
  }: {
    mode?: AIMode;
    options?: ChatRequestOptions;
    prompt?: EditorPrompt;
    toolName?: AIToolName;
  } = {}
) => {
  const { getOptions, setOption } = getEditorPlugin<AIChatPluginConfig>(
    editor,
    {
      key: KEYS.aiChat,
    }
  );

  const { chat } = getOptions();

  if (!prompt && input?.length === 0) {
    return;
  }
  if (!prompt) {
    prompt = input;
  }
  if (!mode) {
    mode = isSelecting(editor) ? 'chat' : 'insert';
  }
  if (mode === 'insert') {
    editor.getTransforms(AIPlugin).ai.undo();
  }

  setOption('mode', mode);

  setOption('toolName', toolName ?? null);

  const blocks = editor.getApi(BlockSelectionPlugin).blockSelection.getNodes();

  const promptText = getEditorPrompt(editor, {
    prompt,
  });

  const selection =
    blocks.length > 0 ? editor.api.nodesRange(blocks) : editor.selection;

  const ctx: {
    children: Descendant[];
    selection: Range | null;
    toolName: string | null;
  } = {
    children: editor.children,
    selection: selection ?? null,
    toolName: toolName ?? null,
  };

  void chat.sendMessage?.(
    {
      text: promptText,
    },
    {
      body: {
        ctx,
      },
      ...options,
    }
  );
};
