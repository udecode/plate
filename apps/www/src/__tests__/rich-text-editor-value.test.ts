import { describe, expect, it } from 'bun:test';

import { NodeApi } from 'platejs';
import {
  DefaultAuthoredPlugin,
  readAuthoredFormatSnapshot,
} from 'platejs/authored';
import { CommentsPlugin } from 'platejs/comments/react';
import { createEditor } from 'platejs/react';
import { SuggestionPlugin } from 'platejs/suggestion/react';

import {
  richTextEditorThreads,
  richTextEditorValue,
} from '@/registry/blocks/editor-ai/components/editor/rich-text-editor-value';
import { BaseEditorKit } from '@/registry/components/editor/plugins-static';

const loadExample = (
  document = richTextEditorValue,
  threads = richTextEditorThreads
) =>
  createEditor({
    plugins: [
      ...BaseEditorKit,
      SuggestionPlugin,
      CommentsPlugin.configure({
        initialState: { currentUserId: 'alice', initialThreads: threads },
      }),
    ],
    initialValue: structuredClone(document),
    userId: 'alice',
  });

describe('saved rich-text playground', () => {
  it('restores the three authors and exact review content with linked discussion records', () => {
    const editor = loadExample();
    const snapshot = readAuthoredFormatSnapshot(editor);

    expect(
      snapshot.changes
        .map(({ authorId, kind, status }) => ({ authorId, kind, status }))
        .sort((a, b) => a.authorId.localeCompare(b.authorId))
    ).toEqual([
      { authorId: 'alice', kind: 'mixed', status: 'pending' },
      { authorId: 'bob', kind: 'delete', status: 'pending' },
      { authorId: 'charlie', kind: 'insert', status: 'pending' },
    ]);
    expect(NodeApi.string(snapshot.accepted.children[3])).toBe(
      'Review and refine content seamlessly. Use  or to mark text for removal. Discuss changes using comments on many text segments. You can even have annotations!'
    );
    expect(NodeApi.string(snapshot.proposed.children[3])).toBe(
      'Review and refine content seamlessly. Use suggestions like this added text or to . Discuss changes using comments on many text segments. You can even have overlapping annotations!'
    );
    expect(NodeApi.get(snapshot.proposed.children[3], [1])).toEqual({
      children: [{ text: 'suggestions' }],
      type: 'link',
      url: '/docs/suggestion',
    });
    expect(NodeApi.get(snapshot.accepted.children[9], [9])).toEqual({
      bold: true,
      text: 'bold',
    });

    for (const [authorId, before, after] of [
      ['alice', '', 'suggestions like this added text'],
      ['bob', 'mark text for removal', ''],
      ['charlie', '', 'overlapping '],
    ]) {
      const change = snapshot.changes.find(
        (item) => item.authorId === authorId
      )!;
      const parts = editor
        .plugin(DefaultAuthoredPlugin)
        .read.details(change.id)?.parts;

      expect(parts?.status).toBe('available');
      if (parts?.status !== 'available') {
        throw new Error('Missing review content.');
      }
      const content = parts.items.filter((part) => part.kind === 'content');

      expect(
        content
          .flatMap((part) => part.before?.content.content ?? [])
          .map((node) => NodeApi.string(node))
          .join('')
      ).toBe(before);
      expect(
        content
          .flatMap((part) => part.after?.content.content ?? [])
          .map((node) => NodeApi.string(node))
          .join('')
      ).toBe(after);
    }

    const threads = editor.plugin(CommentsPlugin).api.getThreads();
    expect(threads).toEqual(richTextEditorThreads);
    expect(threads.find(({ id }) => id === 'discussion2')?.target).toEqual({
      type: 'change',
      id: snapshot.changes.find(({ authorId }) => authorId === 'charlie')!.id,
    });

    const restored = loadExample(
      JSON.parse(JSON.stringify(editor.read.value())),
      JSON.parse(JSON.stringify(threads))
    );
    expect(readAuthoredFormatSnapshot(restored)).toEqual(snapshot);
    expect(restored.plugin(CommentsPlugin).api.getThreads()).toEqual(threads);
  });

  it.each(['alice', 'bob', 'charlie'])(
    'starts without replay history and can accept then undo %s’s loaded suggestion',
    (authorId) => {
      const original = JSON.stringify(richTextEditorValue);
      const editor = loadExample();
      const authored = editor.plugin(DefaultAuthoredPlugin);
      const changes = authored.read.changes({ status: 'pending' }).items;
      const change = changes.find((item) => item.authorId === authorId)!;

      editor.update.history.undo();
      expect(authored.read.changes({ status: 'pending' }).items).toEqual(
        changes
      );
      expect(
        authored.update.decide({
          action: 'accept',
          selection: authored.read.select({ ids: [change.id] }),
        }).status
      ).toBe('applied');
      expect(authored.read.change(change.id)?.status).toBe('accepted');

      editor.update.history.undo();
      expect(authored.read.change(change.id)?.status).toBe('pending');
      expect(authored.read.changes({ status: 'pending' }).items).toHaveLength(
        3
      );
      expect(editor.read.value().children).toEqual(
        richTextEditorValue.children
      );
      expect(JSON.stringify(richTextEditorValue)).toBe(original);
      expect(
        loadExample()
          .plugin(DefaultAuthoredPlugin)
          .read.changes({ status: 'pending' }).items
      ).toEqual(changes);
    }
  );

  it('rejects the suggested link and text while preserving the other authors and comment anchor', () => {
    const editor = loadExample();
    const authored = editor.plugin(DefaultAuthoredPlugin);
    const alice = authored.read
      .changes({ status: 'pending' })
      .items.find(({ authorId }) => authorId === 'alice')!;

    expect(
      authored.update.decide({
        action: 'reject',
        selection: authored.read.select({ ids: [alice.id] }),
      }).status
    ).toBe('applied');

    const { proposed } = readAuthoredFormatSnapshot(editor);
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
        .changes({ status: 'pending' })
        .items.map(({ authorId }) => authorId)
        .sort()
    ).toEqual(['bob', 'charlie']);
    expect(
      editor.plugin(CommentsPlugin).api.getThread('discussion1')?.target
    ).toEqual(richTextEditorThreads[0].target);
  });

  it.each(['bob', 'charlie'])(
    'rejects %s independently of the other suggestions',
    (authorId) => {
      const editor = loadExample();
      const authored = editor.plugin(DefaultAuthoredPlugin);
      const change = authored.read
        .changes({ status: 'pending' })
        .items.find((item) => item.authorId === authorId)!;

      expect(
        authored.update.decide({
          action: 'reject',
          selection: authored.read.select({ ids: [change.id] }),
        }).status
      ).toBe('applied');
      expect(
        authored.read
          .changes({ status: 'pending' })
          .items.map((item) => item.authorId)
          .sort()
      ).toEqual(['alice', 'bob', 'charlie'].filter((id) => id !== authorId));
      editor.update.history.undo();
      expect(authored.read.changes({ status: 'pending' }).items).toHaveLength(
        3
      );
    }
  );
});
