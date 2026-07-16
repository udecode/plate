import type { ChatRequestOptions } from 'ai';

import { isSelecting } from '@platejs/selection';
import { BlockSelectionPlugin } from '@platejs/selection/react';
import { ElementApi } from '@platejs/plite';
import { KEYS, type TIdElement } from '@platejs/utils';
import { type PlateEditor, getEditorPlugin } from '@platejs/core/react';

import type { AIMode, AIToolName } from '../../../lib/types';
import type { AIChatPluginConfig } from '../AIChatPlugin';

import { BaseAIPlugin } from '../../../lib/BaseAIPlugin';
import {
  type EditorPrompt,
  getEditorPrompt,
} from '../../../lib/utils/getEditorPrompt';

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
    editor.plugin(BaseAIPlugin).api.undo();
  }

  setOption('mode', mode);

  setOption('toolName', toolName);

  const blocks = editor.plugin(BlockSelectionPlugin).api.getNodes({});

  const promptText = getEditorPrompt(editor, {
    prompt,
  });

  const chatSelection = blocks.length > 0 ? null : editor.read.selection();
  const selection =
    blocks.length > 0 ? editor.read.ranges.fromEntries(blocks) : chatSelection;

  let chatNodes: TIdElement[];

  if (blocks.length > 0) {
    chatNodes = blocks.map(([block]) => block);
  } else {
    const selectionBlocks = editor.read.nodes.toArray<TIdElement>({
      match: (node) =>
        ElementApi.isElement(node) && editor.read.schema.isBlock(node),
      mode: 'highest',
    });

    if (selectionBlocks.length > 1) {
      chatNodes = selectionBlocks.map(([block]) => block);
    } else {
      chatNodes = editor.read
        .fragment()
        .filter(
          (node): node is TIdElement =>
            ElementApi.isElement(node) && typeof node.id === 'string'
        );
    }
  }

  setOption('chatNodes', chatNodes);
  setOption('chatSelection', chatSelection);

  const ctx = {
    children: [...editor.read.children()],
    selection: selection ?? null,
    toolName,
  };

  void chat?.sendMessage(promptText, {
    body: {
      ctx,
    },
    ...options,
  });
};
