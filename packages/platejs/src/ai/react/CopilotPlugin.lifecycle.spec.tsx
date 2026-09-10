import { expect, test } from 'bun:test';

import { act, render } from '@testing-library/react';
import React from 'react';

import {
  createEditor,
  ParagraphPlugin,
  Plate,
  PlateContent,
} from '../../react/core';
import { CopilotPlugin } from './CopilotPlugin';

test('a completion callback can reject a sentinel without leaving loading active', async () => {
  const { plugin, responses } = setup();
  plugin.store.set({
    completeOptions: {
      ...plugin.store.get('completeOptions')!,
      onFinish: (_, text) => {
        if (text === '0') plugin.update.reject();
      },
    },
  });
  const pending = plugin.api.triggerSuggestion();
  responses[0].resolve(Response.json({ text: '0' }));
  await pending;
  expect(plugin.store.get('suggestionText')).toBeNull();
  expect(plugin.store.get('isLoading')).toBe(false);
  expect(plugin.store.get('abortController')).toBeNull();
});

test('reject cancels an in-flight request before any suggestion has arrived', async () => {
  const { plugin, responses, signals } = setup();
  const pending = plugin.api.triggerSuggestion();
  plugin.update.reject();
  responses[0].resolve(Response.json({ text: 'stale' }));
  await pending;
  expect(signals[0].aborted).toBe(true);
  expect(plugin.store.get('suggestionText')).toBeNull();
  expect(plugin.store.get('isLoading')).toBe(false);
});

function setup() {
  const responses: Array<ReturnType<typeof Promise.withResolvers<Response>>> =
    [];
  const signals: AbortSignal[] = [];
  const editor = createEditor({
    plugins: [ParagraphPlugin, CopilotPlugin],
    initialValue: [{ type: 'paragraph', children: [{ text: 'one ' }] }],
    selection: {
      kind: 'text',
      anchor: { path: [0, 0], offset: 4 },
      focus: { path: [0, 0], offset: 4 },
    },
  });
  const fetcher: typeof fetch = Object.assign(
    async (_input: RequestInfo | URL, init?: RequestInit) => {
      signals.push(init!.signal!);
      const response = Promise.withResolvers<Response>();
      responses.push(response);
      return response.promise;
    },
    globalThis.fetch
  );
  const plugin = editor.plugin(CopilotPlugin);
  plugin.store.set({
    completeOptions: { api: '/completion', fetch: fetcher },
    getPrompt: () => 'Prompt',
    triggerQuery: () => true,
  });
  return { editor, plugin, responses, signals };
}

test('a late response after stop cannot publish or invoke completion callbacks', async () => {
  const { plugin, responses, signals } = setup();
  const finished: string[] = [];
  let responseCalls = 0;
  plugin.store.set({
    completeOptions: {
      ...plugin.store.get('completeOptions')!,
      onResponse: () => {
        responseCalls += 1;
      },
      onFinish: (_, text) => {
        finished.push(text);
      },
    },
  });
  const pending = plugin.api.triggerSuggestion();
  plugin.api.stop();
  responses[0].resolve(Response.json({ text: 'stale' }));
  await pending;
  expect(signals[0].aborted).toBe(true);
  expect(plugin.store.get('suggestionText')).toBeNull();
  expect(plugin.store.get('completion')).not.toBe('stale');
  expect(finished).toEqual([]);
  expect(responseCalls).toBe(0);
});

test('stop during the asynchronous response callback fences its continuation', async () => {
  const { plugin, responses } = setup();
  const entered = Promise.withResolvers<void>();
  const resume = Promise.withResolvers<void>();
  let finished = false;
  plugin.store.set({
    completeOptions: {
      ...plugin.store.get('completeOptions')!,
      onResponse: async () => {
        entered.resolve();
        await resume.promise;
      },
      onFinish: () => {
        finished = true;
      },
    },
  });
  const pending = plugin.api.triggerSuggestion();
  responses[0].resolve(Response.json({ text: 'stale' }));
  await entered.promise;
  plugin.api.stop();
  resume.resolve();
  await pending;
  expect(plugin.store.get('suggestionText')).toBeNull();
  expect(finished).toBe(false);
});

test('a stopped request cannot clear its immediately started replacement', async () => {
  const { plugin, responses, signals } = setup();
  const first = plugin.api.triggerSuggestion();
  plugin.api.stop();
  const second = plugin.api.triggerSuggestion();
  try {
    expect(responses).toHaveLength(2);
    responses[0].resolve(Response.json({ text: 'stale' }));
    await first;
    expect(plugin.store.get('abortController')?.signal).toBe(signals[1]);
    expect(plugin.store.get('isLoading')).toBe(true);
    responses[1].resolve(Response.json({ text: 'current' }));
    await second;
    expect(plugin.store.get('suggestionText')).toBe('current');
    expect(plugin.store.get('isLoading')).toBe(false);
  } finally {
    responses.forEach((response) =>
      response.resolve(Response.json({ text: 'cleanup' }))
    );
    await first;
    await second;
  }
});

test('editing while a completion is pending retires the request before a late response', async () => {
  const { editor, plugin, responses, signals } = setup();
  const pending = plugin.api.triggerSuggestion();
  editor.update.text.insert('typed');
  responses[0].resolve(Response.json({ text: 'stale' }));
  await pending;
  expect(signals[0].aborted).toBe(true);
  expect(plugin.store.get('suggestionText')).toBeNull();
  expect(editor.read.text.string([])).toBe('one typed');
});

for (const retirement of ['readonly', 'unmount'] as const) {
  test(`${retirement} retires the mounted Copilot request`, async () => {
    const { editor, plugin, responses, signals } = setup();
    const tree = (readOnly = false) => (
      <Plate editor={editor} readOnly={readOnly}>
        <PlateContent />
      </Plate>
    );
    const view = render(tree());
    let pending: ReturnType<typeof plugin.api.triggerSuggestion> | undefined;
    try {
      await act(async () => {
        pending = plugin.api.triggerSuggestion();
      });
      if (retirement === 'unmount') view.unmount();
      else {
        view.rerender(tree(true));
        view.rerender(tree(false));
      }
      await act(async () => {
        responses[0].resolve(Response.json({ text: 'stale' }));
        await pending;
      });
      expect(signals[0].aborted).toBe(true);
      expect(plugin.store.get('suggestionText')).toBeNull();
    } finally {
      view.unmount();
      responses.forEach((response) =>
        response.resolve(Response.json({ text: 'cleanup' }))
      );
      await pending;
    }
  });
}
