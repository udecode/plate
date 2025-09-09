import type { ChatRequestOptions } from 'ai';

import { isSelecting } from '@platejs/selection';
import { KEYS } from 'platejs';
import { type PlateEditor, getEditorPlugin } from 'platejs/react';

import type { AIChatPluginConfig } from '../AIChatPlugin';

import { AIPlugin } from '../../ai/AIPlugin';
import { BlockSelectionPlugin } from '@platejs/selection/react';
import {
  EditorPrompt,
  getEditorPrompt,
} from '../../../lib/utils/getEditorPrompt';
import { AIMode, AIToolName } from '../../../lib/types';

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
        system: systemText,
        prompt: promptText,
        ctx: {
          toolName,
          selection: editor.selection,
          children: editor.children,
          blockIds,
          isBlockSelecting: editor.getOption(
            BlockSelectionPlugin,
            'isSelectingSome'
          ),
          isSelecting: isSelecting(editor),
        },
      },
      ...options,
    }
  );
};
