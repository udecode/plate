import { BaseParagraphPlugin } from '@platejs/core';
import { createPlateEditor } from '@platejs/core/react';

import { BaseAIPlugin } from '../lib/BaseAIPlugin';
import { type AIChatDefinition, AIChatPlugin } from './AIChatPlugin';
import { CopilotPlugin } from './CopilotPlugin';

const createEditor = () =>
  createPlateEditor({
    plugins: [BaseParagraphPlugin, BaseAIPlugin, AIChatPlugin, CopilotPlugin],
    selection: {
      kind: 'text',
      anchor: { offset: 4, path: [0, 0] },
      focus: { offset: 4, path: [0, 0] },
    },
    initialValue: [{ children: [{ text: 'one ' }], id: 'b1', type: 'p' }],
  });

describe('CopilotPlugin triggerSuggestion', () => {
  it('clears the suggested node after accepting the final word', () => {
    const editor = createEditor();

    editor.plugin(CopilotPlugin).store.set({
      suggestionNodeId: 'b1',
      suggestionText: 'word',
    });
    editor.plugin(CopilotPlugin).update.acceptNextWord();

    expect(editor.read.text.string([])).toBe('one word');
    expect(
      editor.plugin(CopilotPlugin).store.get('suggestionNodeId')
    ).toBeNull();
    expect(editor.plugin(CopilotPlugin).store.get('suggestionText')).toBe('');
  });

  it('works without AI Chat installed', async () => {
    const editor = createPlateEditor({
      plugins: [BaseParagraphPlugin, CopilotPlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 4, path: [0, 0] },
        focus: { offset: 4, path: [0, 0] },
      },
      initialValue: [{ children: [{ text: 'one ' }], id: 'b1', type: 'p' }],
    });

    editor.plugin(CopilotPlugin).store.set({ isLoading: true });

    await expect(
      editor.plugin(CopilotPlugin).api.triggerSuggestion()
    ).resolves.toBe(false);
  });

  it('returns false while copilot loading is active', async () => {
    const editor = createEditor();
    editor.plugin(CopilotPlugin).store.set({ isLoading: true });

    await expect(
      editor.plugin(CopilotPlugin).api.triggerSuggestion()
    ).resolves.toBe(false);
  });

  it('returns false while AI chat is streaming', async () => {
    const editor = createEditor();
    const chat = {
      status: 'streaming',
    } as unknown as NonNullable<AIChatDefinition['initialState']['chat']>;
    editor.plugin(AIChatPlugin).store.set({ chat });

    await expect(
      editor.plugin(CopilotPlugin).api.triggerSuggestion()
    ).resolves.toBe(false);
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
    editor.plugin(CopilotPlugin).store.set({
      completeOptions: { fetch: fetchCompletion },
      getPrompt: () => 'Prompt',
      triggerQuery: () => true,
    });

    await editor.plugin(CopilotPlugin).api.triggerSuggestion();

    expect(editor.plugin(CopilotPlugin).store.get('suggestionNodeId')).toBe(
      'b1'
    );
    expect(editor.plugin(CopilotPlugin).store.get('suggestionText')).toBe(
      'Completed'
    );
    expect(editor.plugin(CopilotPlugin).store.get('completion')).toBe(
      'Completed'
    );
    expect(editor.plugin(CopilotPlugin).store.get('isLoading')).toBe(false);
  });

  it('materializes frozen header tuples for the completion request', async () => {
    const editor = createEditor();
    let requestHeaders: HeadersInit | undefined;
    const fetchCompletion = mock(
      async (_input: RequestInfo | URL, init?: RequestInit) => {
        requestHeaders = init?.headers;

        return new Response(JSON.stringify({ text: 'Completed' }), {
          headers: { 'Content-Type': 'application/json' },
          status: 200,
        });
      }
    ) as unknown as typeof fetch;

    editor.plugin(CopilotPlugin).store.set({
      completeOptions: {
        fetch: fetchCompletion,
        headers: [['X-Test', 'value']],
      },
      getPrompt: () => 'Prompt',
      triggerQuery: () => true,
    });

    const publishedHeaders = editor
      .plugin(CopilotPlugin)
      .store.get('completeOptions')?.headers;

    expect(Object.isFrozen(publishedHeaders)).toBe(true);

    await editor.plugin(CopilotPlugin).api.triggerSuggestion();

    expect(requestHeaders).toEqual({
      'Content-Type': 'application/json',
      'X-Test': 'value',
    });
    expect(publishedHeaders).toEqual([['X-Test', 'value']]);
  });
});
