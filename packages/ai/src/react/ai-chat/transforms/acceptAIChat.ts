import cloneDeep from 'lodash/cloneDeep.js';
import { ElementApi, KEYS, TextApi, getPluginType } from 'platejs';
import { type PlateEditor, getEditorPlugin } from 'platejs/react';

import { commitAIStreamValue, withAIBatch } from '../../../lib';
import { AIPlugin } from '../../ai/AIPlugin';
import { type AIChatPluginConfig, AIChatPlugin } from '../AIChatPlugin';
import { acceptAISuggestions } from '../utils/acceptAISuggestions';

const getAcceptedInsertValue = (editor: PlateEditor) => {
  const aiChatType = getPluginType(editor, KEYS.aiChat);
  const aiType = getPluginType(editor, KEYS.ai);

  const stripTracking = (node: any): any | null => {
    if (ElementApi.isElement(node) && node.type === aiChatType) {
      return null;
    }

    if (TextApi.isText(node)) {
      const { [aiType]: _ai, ...rest } = node;

      return rest;
    }

    if (!node.children) return node;

    return {
      ...node,
      children: node.children
        .map((child: any) => stripTracking(child))
        .filter(Boolean),
    };
  };

  return cloneDeep(editor.children)
    .map((node) => stripTracking(node))
    .filter(Boolean);
};

export const acceptAIChat = (editor: PlateEditor) => {
  const mode = editor.getOption(AIChatPlugin, 'mode');

  if (mode === 'insert') {
    const { tf } = getEditorPlugin(editor, AIPlugin);
    const api = editor.getApi<AIChatPluginConfig>({ key: KEYS.ai });

    const lastAINodePath = api.aiChat.node({ at: [], reverse: true })![1];

    if (!commitAIStreamValue(editor, getAcceptedInsertValue(editor))) {
      withAIBatch(editor, () => {
        tf.ai.removeMarks();
        editor.getTransforms(AIChatPlugin).aiChat.removeAnchor();
      });
    }

    api.aiChat.hide();
    editor.tf.focus();

    const focusPoint = editor.api.end(lastAINodePath)!;

    editor.tf.setSelection({
      anchor: focusPoint,
      focus: focusPoint,
    });
  }

  if (mode === 'chat') {
    withAIBatch(editor, () => {
      acceptAISuggestions(editor);
    });

    editor.getApi(AIChatPlugin).aiChat.hide();
  }
};
