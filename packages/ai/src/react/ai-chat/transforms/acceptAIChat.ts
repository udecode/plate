import {
  acceptSuggestion,
  getSuggestionKey,
  getTransientSuggestionKey,
} from '@platejs/suggestion';
import { SuggestionPlugin } from '@platejs/suggestion/react';
import { KEYS } from 'platejs';
import { type PlateEditor, getEditorPlugin } from 'platejs/react';

import { withAIBatch } from '../../../lib';
import { AIPlugin } from '../../ai/AIPlugin';
import { type AIChatPluginConfig, AIChatPlugin } from '../AIChatPlugin';

export const acceptAIChat = (editor: PlateEditor) => {
  const mode = editor.getOption(AIChatPlugin, 'mode');

  if (mode === 'insert') {
    const { tf } = getEditorPlugin(editor, AIPlugin);
    const api = editor.getApi<AIChatPluginConfig>({ key: KEYS.ai });

    const lastAINodePath = api.aiChat.node({ at: [], reverse: true })![1];

    withAIBatch(editor, () => {
      tf.ai.removeMarks();
      editor.getTransforms(AIChatPlugin).aiChat.removeAnchor();
    });

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
      acceptSuggestions(editor);
    });

    editor.getApi(AIChatPlugin).aiChat.hide();
  }
};

const acceptSuggestions = (editor: PlateEditor) => {
  const suggestions = editor.getApi(SuggestionPlugin).suggestion.nodes({
    transient: true,
  });

  suggestions.forEach(([suggestionNode]) => {
    const suggestionData = editor
      .getApi(SuggestionPlugin)
      .suggestion.suggestionData(suggestionNode);

    if (!suggestionData) return;

    const description = {
      createdAt: new Date(suggestionData.createdAt),
      keyId: getSuggestionKey(suggestionData.id),
      suggestionId: suggestionData.id,
      type: suggestionData.type,
      userId: suggestionData.userId,
    };

    acceptSuggestion(editor, description);

    // if (type === 'reject') {
    //   rejectSuggestion(editor, description);
    // }
  });

  editor.tf.unsetNodes([getTransientSuggestionKey()], {
    at: [],
    mode: 'all',
    match: (n) => !!n[getTransientSuggestionKey()],
  });
};
