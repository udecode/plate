import { afterAll, afterEach, expect, spyOn, test } from 'bun:test';

import { act, fireEvent, render } from '@testing-library/react';
import { AIChatPlugin } from 'platejs/ai/react';
import type { CommentMutationRequest } from 'platejs/comments';
import { CommentsPlugin } from 'platejs/comments/react';
import { MarkdownPlugin } from 'platejs/markdown';
import { createEditor, ParagraphPlugin, EditorRoot } from 'platejs/react';
import React from 'react';

import { AIKit } from '@/registry/components/editor/ai';

import { AILoadingBar } from './ai-menu';
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

for (const retirement of ['finish', 'hide', 'replace', 'stop'] as const) {
  test(`published AI comments survive ${retirement} without adopting manual drafts`, async () => {
    const http = controlledFetch();
    const editor = createEditor({
      plugins: [
        ParagraphPlugin,
        MarkdownPlugin,
        ...AIKit,
        CommentsPlugin.configure({ initialState: { currentUserId: 'alice' } }),
      ],
      initialValue: [{ type: 'paragraph', children: [{ text: 'original' }] }],
      userId: 'alice',
    });
    const comments = editor.plugin(CommentsPlugin).api;
    const range = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 8 },
    };
    const unrelated = comments.createDraft({
      target: { type: 'range', range },
      body: [{ type: 'paragraph', children: [{ text: 'manual draft' }] }],
    });
    if (!unrelated) throw new Error('Expected the manual draft to be created');
    const view = render(
      <EditorRoot editor={editor}>
        <Body editor={editor} />
        <AILoadingBar />
      </EditorRoot>
    );
    let pending: Promise<void> | undefined;
    let replacementPending: Promise<void> | undefined;
    try {
      await act(async () => {
        editor.plugin(AIChatPlugin).store.set({
          _requestId: 'comment-request',
          _blockRefs: { b0: { key: editor.key(editor.read.children()[0]) } },
        });
        pending = editor
          .plugin(AIChatPlugin)
          .store.get('chat')!
          .sendMessage('comment');
      });
      await act(async () => {
        http.requests[0].send({
          type: 'data-toolName',
          transient: true,
          data: 'comment',
        });
        http.requests[0].send({
          type: 'data-comment',
          transient: true,
          data: {
            status: 'streaming',
            comment: {
              blockRef: 'b0',
              comment: 'AI draft',
              content: 'original',
            },
          },
        });
      });
      await flush();
      const generated = comments
        .getThreads()
        .find((thread) => thread.id !== unrelated);
      if (!generated) throw new Error('Expected the AI comment to be created');
      expect(generated.status).toBe('published');
      expect(comments.getSnapshot().draftThreadIds).toEqual([unrelated]);

      if (retirement === 'finish') {
        await act(async () => {
          http.requests[0].close();
          await pending;
        });
      } else if (retirement === 'hide') {
        act(() => editor.plugin(AIChatPlugin).api.hide({ focus: false }));
      } else if (retirement === 'replace') {
        await act(async () => {
          replacementPending = editor
            .plugin(AIChatPlugin)
            .store.get('chat')!
            .sendMessage('replacement');
        });
      } else if (retirement === 'stop') {
        act(() => editor.plugin(AIChatPlugin).api.stop());
      }
      await flush();
      expect(comments.getThread(unrelated)?.status).toBe('draft');
      expect(comments.getThread(generated.id)?.status).toBe('published');
      expect(comments.getSnapshot().draftThreadIds).toEqual([unrelated]);
      if (retirement === 'finish') {
        expect(editor.plugin(AIChatPlugin).store.get('open')).toBe(false);
      }
    } finally {
      view.unmount();
      http.requests.forEach((request) => request.close());
      await pending;
      await replacementPending;
      http.restore();
    }
  });
}

test('failed Comment requests expose retry without rolling back completed comments', async () => {
  const http = controlledFetch(true);
  const editor = createEditor({
    plugins: [
      ParagraphPlugin,
      MarkdownPlugin,
      ...AIKit,
      CommentsPlugin.configure({ initialState: { currentUserId: 'alice' } }),
    ],
    initialValue: [{ type: 'paragraph', children: [{ text: 'original' }] }],
    userId: 'alice',
    selection: {
      kind: 'text',
      anchor: { path: [0, 0], offset: 8 },
      focus: { path: [0, 0], offset: 8 },
    },
  });
  const view = render(
    <EditorRoot editor={editor}>
      <Body editor={editor} />
      <AILoadingBar />
    </EditorRoot>
  );
  const before = value(editor);
  try {
    act(() =>
      editor.plugin(AIChatPlugin).api.submit('Comment', { toolName: 'comment' })
    );
    await flush();
    await act(async () => http.requests[0].reject());
    await flush();
    expect(view.getByRole('alert').textContent).toContain(
      'Could not generate comments'
    );
    fireEvent.click(view.getByRole('button', { name: 'Try again' }));
    await flush();
    expect(http.requests).toHaveLength(2);
    const body = JSON.parse(String(http.requests[1].body));
    await act(async () => {
      http.requests[1].open();
      http.requests[1].send({
        type: 'data-comment',
        data: {
          status: 'streaming',
          comment: {
            blockRef: body.ctx.refs.blocks[0].ref,
            content: 'original',
            comment: 'Keep this feedback.',
          },
        },
      });
    });
    await flush();
    await act(async () => {
      http.requests[1].send({
        type: 'error',
        errorText: 'Comment stream failed',
      });
      http.requests[1].close();
    });
    await flush();
    expect(view.getByRole('alert').textContent).toContain(
      'Could not generate comments'
    );
    const [comment] = editor.plugin(CommentsPlugin).api.getThreads();
    expect(comment.status).toBe('published');
    fireEvent.click(view.getByRole('button', { name: 'Dismiss' }));
    await flush();
    expect(
      editor.plugin(CommentsPlugin).api.getThread(comment.id)?.status
    ).toBe('published');
    expect(view.queryByRole('alert')).toBeNull();
    expect(value(editor)).toBe(before);
  } finally {
    view.unmount();
    http.requests.forEach((request) => request.close());
    http.restore();
  }
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
  ['id', 'stop'],
  ['id', 'hide'],
  ['id', 'reset'],
  ['id', 'finished-hide'],
] as const) {
  test(`async comment ${result}/${retirement} publishes only after a live request resolves`, async () => {
    const http = controlledFetch();
    const settle = deferred<void>();
    const started = deferred<void>();
    let mutation: CommentMutationRequest | undefined;
    const commentsPlugin = CommentsPlugin.configure({
      initialState: {
        currentUserId: 'alice',
        mutate: async (input) => {
          mutation = input;
          started.resolve();
          await settle.promise;
          if (result !== 'id') {
            if (result === 'reject') throw new Error('Save rejected');
            return { status: 'reject' };
          }
          return { status: 'commit', thread: input.proposed };
        },
      },
    });
    const editor = createEditor({
      plugins: [ParagraphPlugin, MarkdownPlugin, ...AIKit, commentsPlugin],
      initialValue: [{ type: 'paragraph', children: [{ text: 'original' }] }],
      userId: 'alice',
    });
    const comments = editor.plugin(commentsPlugin).api;
    const renderAssembly = (readOnly = false, sessionKey = 0) => (
      <EditorRoot editor={editor} readOnly={readOnly}>
        <Body editor={editor} readOnly={[readOnly]} sessionKey={sessionKey} />
      </EditorRoot>
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
          open: true,
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
          type: 'data-toolName',
          transient: true,
          data: 'comment',
        });
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
      expect(mutation?.proposed?.target.type).toBe('range');
      expect(mutation?.operation).toBe('publishDraft');
      act(() =>
        editor.update.text.insert('X ', { at: { path: [0, 0], offset: 0 } })
      );
      const before = value(editor);
      if (retirement === 'live' || retirement === 'finished-hide') {
        await act(async () => {
          http.requests[0].close();
          await pending;
        });
        await flush();
        expect(editor.plugin(AIChatPlugin).store.get('open')).toBe(false);
        expect(comments.getSnapshot().draftThreadIds).toHaveLength(1);
      }
      if (retirement === 'readonly') {
        view.rerender(renderAssembly(true));
        await flush();
        // Recovered DOM/model permission must not revive the request suspended at await.
        view.rerender(renderAssembly(false));
        await flush();
      } else if (retirement === 'stop') {
        act(() => editor.plugin(AIChatPlugin).api.stop());
      } else if (retirement === 'hide' || retirement === 'finished-hide') {
        act(() => editor.plugin(AIChatPlugin).api.hide({ focus: false }));
      } else if (retirement === 'reset') {
        act(() => editor.plugin(AIChatPlugin).api.reset());
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
      expect(comments.getSnapshot().draftThreadIds).toHaveLength(0);
      expect(comments.getThreads()).toHaveLength(liveSuccess ? 1 : 0);
      if (liveSuccess) {
        expect(comments.getThreads()[0].status).toBe('published');
        expect(comments.toJSON().threads).toHaveLength(1);
      }
      expect(
        warn.mock.calls.filter(
          (call) => call[0] === 'Could not publish AI comment'
        )
      ).toHaveLength(result !== 'id' && retirement === 'live' ? 1 : 0);
      expect(value(editor)).toBe(before);
      if (liveSuccess) {
        const [{ id }] = comments.getThreads();
        const attachment = comments.attachment(id);
        if (attachment?.type !== 'range' || attachment.status !== 'attached') {
          throw new Error('Expected the published comment to remain attached');
        }
        expect(editor.read.text.string(attachment.range)).toBe('original');
        expect(attachment.range.anchor.offset).toBe(2);
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
        await Promise.all(
          comments
            .getThreads()
            .map((thread) => comments.removeThread(thread.id))
        );
      });
      warn.mockRestore();
      http.restore();
    }
    expect(comments.getThreads()).toEqual([]);
  });
}
