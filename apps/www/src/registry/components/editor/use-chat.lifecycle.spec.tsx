import { afterAll, afterEach, expect, spyOn, test } from 'bun:test';

import { act, render } from '@testing-library/react';
import { AIChatPlugin } from 'platejs/ai/react';
import type { CommentTarget } from 'platejs/comments';
import { CommentsPlugin } from 'platejs/comments/react';
import { MarkdownPlugin } from 'platejs/markdown';
import { createEditor, ParagraphPlugin, Plate } from 'platejs/react';
import React from 'react';

import { AIKit } from '@/registry/components/editor/ai';

import {
  Body,
  controlledFetch,
  deferred,
  flush,
  value,
} from './ai.lifecycle-test-support';

const errors: string[] = [];
const windowError = (event: ErrorEvent) =>
  errors.push(event.error?.message ?? event.message);
window.addEventListener('error', windowError);
afterAll(() => window.removeEventListener('error', windowError));
afterEach(async () => {
  await flush();
  expect(errors).toEqual([]);
});

for (const [result, retirement] of [
  ['id', 'live'],
  ['null', 'live'],
  ['reject', 'live'],
  ['id', 'readonly'],
  ['null', 'readonly'],
  ['reject', 'readonly'],
  ['id', 'unmount'],
  ['id', 'replacement'],
] as const) {
  test(`async comment ${result}/${retirement} keeps mapped drafts package-owned and fences post-await activation`, async () => {
    const http = controlledFetch();
    const settle = deferred<void>();
    const started = deferred<void>();
    let target: CommentTarget | undefined;
    const commentsPlugin = CommentsPlugin.extend({
      api: ({ api }) => ({
        createThread: async (input: Parameters<typeof api.createThread>[0]) => {
          ({ target } = input);
          const id = await api.createThread(input);
          started.resolve();
          await settle.promise;
          if (result !== 'id') {
            if (id) api.discardDraft(id);
            if (result === 'reject') throw new Error('Save rejected');
            return null;
          }
          return id;
        },
      }),
    }).configure({ initialState: { currentUserId: 'alice' } });
    const editor = createEditor({
      plugins: [ParagraphPlugin, MarkdownPlugin, ...AIKit, commentsPlugin],
      initialValue: [{ type: 'paragraph', children: [{ text: 'original' }] }],
    });
    const comments = editor.plugin(commentsPlugin).api;
    const renderAssembly = (readOnly = false, sessionKey = 0) => (
      <Plate editor={editor} readOnly={readOnly}>
        <Body editor={editor} readOnly={[readOnly]} sessionKey={sessionKey} />
      </Plate>
    );
    const view = render(renderAssembly());
    const warn = spyOn(console, 'warn').mockImplementation(() => {});
    let pending: Promise<void> | undefined;
    let replacementPending: Promise<void> | undefined;
    try {
      await flush();
      await act(async () =>
        editor.plugin(AIChatPlugin).store.set({
          _blockRefs: { b0: { key: editor.key(editor.read.children()[0]) } },
        })
      );
      await act(async () => {
        pending = editor
          .plugin(AIChatPlugin)
          .store.get('chat')!
          .sendMessage('comment');
      });
      await act(async () => {
        http.requests[0].send({
          type: 'data-comment',
          transient: true,
          data: {
            status: 'streaming',
            comment: {
              blockRef: 'b0',
              comment: 'comment body',
              content: 'original',
            },
          },
        });
        await started.promise;
      });
      expect(target?.type).toBe('range');
      act(() =>
        editor.update.text.insert('X ', { at: { path: [0, 0], offset: 0 } })
      );
      const before = value(editor);
      if (retirement === 'live') {
        await act(async () => {
          http.requests[0].close();
          await pending;
        });
        await flush();
      }
      if (retirement === 'readonly') {
        view.rerender(renderAssembly(true));
        await flush();
        // Recovered DOM/model permission must not revive the request suspended at await.
        view.rerender(renderAssembly(false));
        await flush();
      } else if (retirement === 'unmount') view.unmount();
      else if (retirement === 'replacement') {
        view.rerender(renderAssembly(false, 1));
        await flush();
      }
      const replacement = editor.plugin(AIChatPlugin).store.get('chat');
      if (retirement === 'replacement') {
        await act(async () => {
          replacementPending = replacement!.sendMessage('replacement');
        });
      }
      await act(async () => {
        settle.resolve();
        http.requests[0].close();
        await pending;
      });
      await flush();
      const liveSuccess = result === 'id' && retirement === 'live';
      expect(editor.plugin(commentsPlugin).store.get('activeIds')).toHaveLength(
        liveSuccess ? 1 : 0
      );
      expect(comments.getSnapshot().draftThreadIds).toHaveLength(
        liveSuccess ? 1 : 0
      );
      expect(
        warn.mock.calls.filter(
          (call) => call[0] === 'Could not create AI comment'
        )
      ).toHaveLength(result === 'reject' && retirement === 'live' ? 1 : 0);
      expect(value(editor)).toBe(before);
      if (liveSuccess) {
        const id = comments.getSnapshot().draftThreadIds[0];
        expect(editor.read.text.string(comments.range(id)!)).toBe('original');
        expect(comments.range(id)!.anchor.offset).toBe(2);
      }
      if (retirement === 'replacement') {
        expect(editor.plugin(AIChatPlugin).store.get('chat')?.stop).toBe(
          replacement?.stop
        );
        expect(http.requests[1].signal.aborted).toBe(false);
      }
    } finally {
      await act(async () => {
        view.unmount();
        settle.resolve();
        http.requests.forEach((request) => request.close());
        await pending;
        await replacementPending;
        comments.setThreads([]);
      });
      warn.mockRestore();
      http.restore();
    }
    expect(comments.getThreads()).toEqual([]);
  });
}
