import { BaseParagraphPlugin } from '@platejs/core';
import { createPlateEditor } from '@platejs/core/react';

import { BaseAIPlugin } from '../../../lib/BaseAIPlugin';
import {
  type AIChatPluginConfig,
  AIChatPlugin,
} from '../../ai-chat/AIChatPlugin';
import { CopilotPlugin } from '../CopilotPlugin';
import { triggerCopilotSuggestion } from './triggerCopilotSuggestion';

const createEditor = () =>
  createPlateEditor({
    plugins: [BaseParagraphPlugin, BaseAIPlugin, AIChatPlugin, CopilotPlugin],
    selection: {
      anchor: { offset: 4, path: [0, 0] },
      focus: { offset: 4, path: [0, 0] },
    },
    value: [{ children: [{ text: 'one ' }], id: 'b1', type: 'p' }],
  });

describe('triggerCopilotSuggestion', () => {
  it('returns false while copilot loading is active', async () => {
    const editor = createEditor();
    editor.plugin(CopilotPlugin).setOption('isLoading', true);

    await expect(triggerCopilotSuggestion(editor)).resolves.toBe(false);
  });

  it('returns false while AI chat is streaming', async () => {
    const editor = createEditor();
    const chat = {
      status: 'streaming',
    } as unknown as NonNullable<AIChatPluginConfig['options']['chat']>;
    editor.plugin(AIChatPlugin).setOption('chat', chat);

    await expect(triggerCopilotSuggestion(editor)).resolves.toBe(false);
  });

  it('stores a finished completion as the current block suggestion', async () => {
    const editor = createEditor();
    const fetchCompletion = mock(
      async (_input: RequestInfo | URL, _init?: RequestInit) =>
        new Response(JSON.stringify({ text: 'Completed' }), {
          headers: { 'Content-Type': 'application/json' },
          status: 200,
        })
    ) as unknown as typeof fetch;
    editor.plugin(CopilotPlugin).setOptions({
      completeOptions: { fetch: fetchCompletion },
      getPrompt: () => 'Prompt',
      triggerQuery: () => true,
    });

    await triggerCopilotSuggestion(editor);

    expect(editor.plugin(CopilotPlugin).getOption('suggestionNodeId')).toBe(
      'b1'
    );
    expect(editor.plugin(CopilotPlugin).getOption('suggestionText')).toBe(
      'Completed'
    );
    expect(editor.plugin(CopilotPlugin).getOption('completion')).toBe(
      'Completed'
    );
    expect(editor.plugin(CopilotPlugin).getOption('isLoading')).toBe(false);
  });
});
