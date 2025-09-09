import type { ChatRequestOptions } from 'ai';

import { isSelecting } from '@platejs/selection';
import { BlockSelectionPlugin } from '@platejs/selection/react';
import { KEYS } from 'platejs';
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
    system,
    toolName,
  }: {
    mode?: AIMode;
    options?: ChatRequestOptions;
    prompt?: EditorPrompt;
    system?: EditorPrompt;
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

  const blockSelectionIds = Array.from(
    editor.getOption(BlockSelectionPlugin, 'selectedIds') ?? []
  );
  const selectionBlockIds = editor.api
    .blocks({ mode: 'highest' })
    .map(([n]) => n.id as string);

  const blockIds =
    blockSelectionIds.length > 0 ? blockSelectionIds : selectionBlockIds;

  const promptText = getEditorPrompt(editor, {
    prompt,
  });

  const systemText = getEditorPrompt(editor, {
    prompt: system,
  });

  void chat.sendMessage?.(
    {
      text: promptText,
    },
    {
      body: {
        ctx: {
          blockIds,
          children: editor.children,
          isBlockSelecting: editor.getOption(
            BlockSelectionPlugin,
            'isSelectingSome'
          ),
          isSelecting: isSelecting(editor),
          selection: editor.selection,
          toolName,
        },
        prompt: promptText,
        system: systemText,
      },
      ...options,
    }
  );
};
