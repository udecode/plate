import { describe, expect, it } from 'bun:test';

import { type EditorDocumentValue, NodeApi } from 'platejs';
import { AuthoredPlugin, projectAuthoredDocument } from 'platejs/authored';
import { CommentsPlugin } from 'platejs/comments/react';
import { createEditor } from 'platejs/react';
import { SuggestionPlugin } from 'platejs/suggestion/react';

import {
  richTextEditorComments,
  richTextEditorValue,
} from '@/registry/blocks/editor-ai/components/editor/rich-text-editor-value';
import { BaseEditorKit } from '@/registry/components/editor/plugins-static';

const project = (
  document: EditorDocumentValue,
  projection: 'accepted' | 'proposed'
) => projectAuthoredDocument(document, { projection }).document;

const loadExample = (
  document = richTextEditorValue,
  comments = richTextEditorComments
) =>
  createEditor({
    plugins: [
      ...BaseEditorKit,
      SuggestionPlugin,
      CommentsPlugin.configure({
        initialState: { initialComments: comments },
      }),
    ],
    initialValue: structuredClone(document),
    userId: 'alice',
  });

describe('saved rich-text playground', () => {
  it('restores the three authors and exact review content with linked discussion records', () => {
    const editor = loadExample();
    const authored = editor.plugin(AuthoredPlugin);
    const changes = authored.read.changes().items;
    const accepted = project(editor.read.value(), 'accepted');
    const proposed = project(editor.read.value(), 'proposed');

    expect(
      changes
        .map(({ authorId, kind }) => ({ authorId, kind }))
        .sort((a, b) => a.authorId.localeCompare(b.authorId))
    ).toEqual([
      { authorId: 'alice', kind: 'insert' },
      { authorId: 'bob', kind: 'delete' },
      { authorId: 'charlie', kind: 'insert' },
    ]);
    expect(NodeApi.string(accepted.children[3])).toBe(
      'Review and refine content seamlessly. Use  or to mark text for removal. Discuss changes using comments on many text segments. You can even have annotations!'
    );
    expect(NodeApi.string(proposed.children[3])).toBe(
      'Review and refine content seamlessly. Use suggestions like this added text or to . Discuss changes using comments on many text segments. You can even have overlapping annotations!'
    );
    expect(NodeApi.get(proposed.children[3], [1])).toEqual({
      children: [{ text: 'suggestions' }],
      type: 'link',
      url: '/docs/suggestion',
    });
    expect(NodeApi.get(accepted.children[9], [9])).toEqual({
      bold: true,
      text: 'bold',
    });

    const threads = editor.plugin(CommentsPlugin).api.getThreads();
    expect(threads).toEqual(richTextEditorComments.threads);
    const attachment = editor
      .plugin(CommentsPlugin)
      .api.attachment('discussion1');
    expect(attachment).toEqual({
      type: 'range',
      status: 'attached',
      range: {
        anchor: { path: [3, 6, 0], offset: 0 },
        focus: { path: [3, 7], offset: 22 },
      },
    });
    expect(threads.find(({ id }) => id === 'discussion2')?.target).toEqual({
      type: 'change',
      id: changes.find(({ authorId }) => authorId === 'charlie')!.id,
    });

    const restored = loadExample(
      JSON.parse(JSON.stringify(editor.read.value())),
      JSON.parse(JSON.stringify(editor.plugin(CommentsPlugin).api.toJSON()))
    );
    expect(restored.plugin(AuthoredPlugin).read.changes().items).toEqual(
      changes
    );
    expect(restored.plugin(CommentsPlugin).api.getThreads()).toEqual(threads);
    expect(
      restored.plugin(CommentsPlugin).api.attachment('discussion1')
    ).toEqual(attachment);
  });

  it('loads independent conversations and attachments from one saved revision', async () => {
    const primary = loadExample();
    const reviewer = loadExample();
    const snapshot = loadExample();
    const comments = primary.plugin(CommentsPlugin).api;
    const originalAttachment = comments.attachment('discussion1');

    const reply = await comments.reply('discussion1', [
      { type: 'paragraph', children: [{ text: 'Primary editor reply' }] },
    ]);
    expect(reply.status).toBe('applied');
    const resolution = await comments.resolve('discussion1');
    expect(resolution.status).toBe('applied');
    primary.update((tx) => {
      tx.text.insert('Updated ', { at: { path: [3, 7], offset: 0 } });
    });

    for (const independent of [reviewer, snapshot]) {
      expect(independent.plugin(CommentsPlugin).api.getThreads()).toEqual(
        richTextEditorComments.threads
      );
      expect(
        independent.plugin(CommentsPlugin).api.attachment('discussion1')
      ).toEqual(originalAttachment);
      expect(independent.read.value()).toEqual(richTextEditorValue);
    }

    const saved = JSON.parse(
      JSON.stringify({
        document: primary.read.value(),
        comments: comments.toJSON(),
      })
    );
    const restored = loadExample(saved.document, saved.comments);
    const restoredComments = restored.plugin(CommentsPlugin).api;
    expect(restoredComments.getThreads()).toEqual(comments.getThreads());
    expect(restoredComments.attachment('discussion1')).toEqual(
      comments.attachment('discussion1')
    );
    expect(restoredComments.attachment('discussion1')).not.toEqual(
      originalAttachment
    );
    restored.api.history.undo();
    expect(restored.read.value()).toEqual(saved.document);
    expect(restoredComments.getThreads()).toEqual(saved.comments.threads);
  });

  it.each(['alice', 'bob', 'charlie'])(
    'starts without replay history and can accept then undo %s’s loaded suggestion',
    (authorId) => {
      const editor = loadExample();
      const authored = editor.plugin(AuthoredPlugin);
      const changes = authored.read.changes().items;
      const change = changes.find((item) => item.authorId === authorId)!;

      editor.api.history.undo();
      expect(authored.read.changes().items).toEqual(changes);
      expect(
        authored.update.decide({ action: 'accept', changes: [change] }).status
      ).toBe('applied');
      expect(authored.read.change(change.id)).toBeNull();

      editor.api.history.undo();
      expect(authored.read.changes().items).toEqual(changes);
      expect(editor.read.value().children).toEqual(
        richTextEditorValue.children
      );
    }
  );

  it('rejects the suggested link and text while preserving the other authors and comment anchor', () => {
    const editor = loadExample();
    const authored = editor.plugin(AuthoredPlugin);
    const alice = authored.read
      .changes()
      .items.find(({ authorId }) => authorId === 'alice')!;

    expect(
      authored.update.decide({ action: 'reject', changes: [alice] }).status
    ).toBe('applied');

    const proposed = project(editor.read.value(), 'proposed');
    expect(NodeApi.get(proposed.children[3], [1])).toEqual({
      children: [{ text: 'comments' }],
      type: 'link',
      url: '/docs/comment',
    });
    expect(NodeApi.string(proposed.children[3])).toBe(
      'Review and refine content seamlessly. Use  or to . Discuss changes using comments on many text segments. You can even have overlapping annotations!'
    );
    expect(
      authored.read
        .changes()
        .items.map(({ authorId }) => authorId)
        .sort()
    ).toEqual(['bob', 'charlie']);
    expect(
      editor.plugin(CommentsPlugin).api.getThread('discussion1')?.target
    ).toEqual(richTextEditorComments.threads[0].target);
  });
});
