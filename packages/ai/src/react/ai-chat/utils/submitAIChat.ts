import type { ChatRequestOptions } from 'ai';

import { isSelecting } from '@platejs/selection';
import { BlockSelectionPlugin } from '@platejs/selection/react';
import { type Descendant, type Range, type TIdElement, KEYS } from 'platejs';
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
    toolName: toolNameProps,
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

  const { chat, toolName: toolNameOption } = getOptions();

  const toolName = toolNameProps ?? toolNameOption ?? null;

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

  setOption('toolName', toolName);

  const blocks = editor.getApi(BlockSelectionPlugin).blockSelection.getNodes();
  const blocksRange = editor.api.nodesRange(blocks);

  const promptText = getEditorPrompt(editor, {
    prompt,
  });

  const selection = blocks.length > 0 ? blocksRange : editor.selection;

  let chatNodes: TIdElement[];

  if (blocks.length > 0) {
    chatNodes = blocks.map((block) => block[0]) as TIdElement[];
  } else {
    const selectionBlocks = editor.api.blocks({ mode: 'highest' });

    if (selectionBlocks.length > 1) {
      chatNodes = selectionBlocks.map((block) => block[0]) as TIdElement[];
    } else {
      chatNodes = editor.api.fragment<TIdElement>();
    }
  }

  setOption('chatNodes', chatNodes);
  setOption('chatSelection', blocks.length > 0 ? null : editor.selection);

  const ctx: {
    children: Descendant[];
    selection: Range | null;
    toolName: string | null;
  } = {
    children: editor.children,
    selection: selection ?? null,
    toolName,
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
