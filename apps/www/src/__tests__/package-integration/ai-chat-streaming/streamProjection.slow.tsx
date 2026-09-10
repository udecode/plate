import { describe, expect, it, mock } from 'bun:test';

import {
  createEditor,
  createEditorView,
  defineBasePlugin,
  NodeApi,
  schema,
} from 'platejs';
import type { AIChatRequestContext } from 'platejs/ai';
import { AIChatPlugin } from 'platejs/ai/react';
import { BaseCommentPlugin, getCommentKey } from 'platejs/comment';
import { BaseSuggestionPlugin } from 'platejs/suggestion';

import { createAIChatOperation } from '../../../../../../packages/platejs/src/ai/react/internal/createAIChatOperation';
import { defaultPlugins, createTestEditor } from './__tests__/createTestEditor';

const paragraph = (text: string) => ({
  type: 'paragraph',
  children: [{ text }],
});

describe('AI draft projection', () => {
  it('keeps unselected prefix and suffix around a partial-text edit at its target', () => {
    const prefix = { text: 'Before ', bold: true };
    const suffix = { text: ' after.', underline: true };
    const { editor } = createTestEditor({
      children: [
        paragraph('earlier'),
        {
          type: 'paragraph',
          children: [prefix, { text: 'selected', italic: true }, suffix],
        },
        paragraph('later'),
      ],
    });
    editor.update.selection.set({
      anchor: { path: [1, 1], offset: 0 },
      focus: { path: [1, 1], offset: 8 },
    });
    const before = editor.read.value();
    const selection = editor.read.selection();
    const ai = editor.plugin(AIChatPlugin);
    const id = ai.api.start({ mode: 'chat', toolName: 'edit' });
    ai.api.receive(id, 'replacement');
    const operation = ai.store.get('operation');
    expect(operation?.targets).toEqual([editor.key([1])!]);
    expect(operation?.value).toEqual([paragraph('replacement')]);
    expect(editor.read.value()).toEqual(before);
    expect(editor.read.selection()).toEqual(selection);
    expect(editor.read.history.undos()).toHaveLength(0);
    expect(operation?.preview).toHaveLength(1);
    const block = operation!.preview[0];
    expect(editor.plugin(BaseSuggestionPlugin).api.skipDeletes(block)).toBe(
      'Before replacement after.'
    );
    expect(block.children[0]).toEqual(prefix);
    expect(block.children.at(-1)).toEqual(suffix);
  });

  it('fits a partial range across marked leaves while retaining an unselected inline link', () => {
    const link = {
      type: 'link',
      url: 'https://example.com',
      children: [{ text: 'linked' }],
    };
    const { editor } = createTestEditor({
      children: [
        {
          type: 'paragraph',
          children: [
            { text: 'prefix selected', bold: true },
            { text: ' text suffix', italic: true },
            link,
            { text: '' },
          ],
        },
      ],
    });
    editor.update.selection.set({
      anchor: { path: [0, 0], offset: 7 },
      focus: { path: [0, 1], offset: 5 },
    });
    const before = editor.read.value();
    const selection = editor.read.selection();
    let commits = 0;
    const unsubscribe = editor.subscribeCommit(() => {
      commits += 1;
    });
    const ai = editor.plugin(AIChatPlugin);
    const id = ai.api.start({ mode: 'chat', toolName: 'edit' });
    ai.api.receive(id, 'replacement');
    const draft = ai.store.get('operation');
    expect(draft?.error).toBeUndefined();
    expect(
      editor.plugin(BaseSuggestionPlugin).api.skipDeletes(draft!.preview[0])
    ).toBe('prefix replacement suffixlinked');
    expect(draft?.preview[0].children).toContainEqual(link);
    expect(editor.read.value().children).toBe(before.children);
    expect(editor.read.selection()).toEqual(selection);
    expect(editor.read.history.undos()).toHaveLength(0);
    expect(commits).toBe(0);
    ai.api.finish(id);
    ai.api.accept();
    expect(editor.read.children()).toEqual([
      {
        type: 'paragraph',
        children: [
          { text: 'prefix ', bold: true },
          { text: 'replacement' },
          { text: ' suffix', italic: true },
          link,
          { text: '' },
        ],
      },
    ]);
    expect(commits).toBe(1);
    unsubscribe();
  });

  it('projects comment marks onto only the quoted range before any formal commit', () => {
    const { editor } = createTestEditor({
      children: [
        {
          type: 'paragraph',
          children: [{ text: 'Before quoted after.', bold: true }],
        },
      ],
    });
    editor.update.selection.set({
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 20 },
    });
    const before = editor.read.value();
    const selection = editor.read.selection();
    let commits = 0;
    const unsubscribe = editor.subscribeCommit(() => {
      commits += 1;
    });
    const anchor = editor.anchor(
      { path: [0, 0], offset: 10 },
      { deletion: 'drop' }
    );
    const ai = editor.plugin(AIChatPlugin);
    let context: AIChatRequestContext | undefined;
    const onCommentsAccepted = mock();
    ai.store.set({
      onCommentsAccepted,
      chat: {
        messages: [],
        status: 'ready',
        clear() {},
        stop() {},
        regenerate: async () => {},
        sendMessage: async (_text, options) => {
          if (options?.body) {
            context = Reflect.get(options.body, 'ctx') as AIChatRequestContext;
          }
        },
      },
    });
    const id = ai.api.submit('Review the quote', {
      mode: 'chat',
      toolName: 'comment',
    });
    if (id === undefined || !context) {
      throw new Error('Expected the request reference context.');
    }
    ai.api.receiveComment(id, {
      id: 'comment-one',
      blockRef: context.refs.blocks[0].ref,
      content: 'quoted',
      comment: 'Clarify this.',
    });
    const operation = ai.store.get('operation');
    expect(operation?.status).toBe('streaming');
    expect(operation?.comments).toEqual([
      { id: 'comment-one', content: 'quoted', comment: 'Clarify this.' },
    ]);
    expect(editor.read.value()).toEqual(before);
    expect(editor.read.selection()).toEqual(selection);
    expect(editor.read.history.undos()).toHaveLength(0);
    expect(onCommentsAccepted).not.toHaveBeenCalled();
    expect(commits).toBe(0);
    expect(anchor.resolve()).toEqual({ path: [0, 0], offset: 10 });
    const texts = [
      ...NodeApi.texts({
        type: 'document',
        children: operation?.preview ?? [],
      }),
    ].map(([text]) => text);
    expect(texts.map((text) => text.text)).toEqual([
      'Before ',
      'quoted',
      ' after.',
    ]);
    expect(texts[0]).toEqual({ text: 'Before ', bold: true });
    expect(texts[1]).toMatchObject({
      text: 'quoted',
      bold: true,
      [editor.plugin(BaseCommentPlugin).schema.key]: true,
      [getCommentKey('comment-one')]: true,
    });
    expect(texts[2]).toEqual({ text: ' after.', bold: true });
    anchor.release();
    unsubscribe();
  });
  for (const namedRoot of [false, true]) {
    it(`fits a backward multi-block partial edit${namedRoot ? ' in a named root' : ''} without publishing or moving anchors`, () => {
      const children = [
        paragraph('earlier'),
        {
          type: 'paragraph',
          children: [
            { text: 'prefix ', bold: true },
            { text: 'selected start' },
          ],
        },
        paragraph('selected middle'),
        {
          type: 'paragraph',
          children: [
            { text: 'selected end' },
            { text: ' suffix', italic: true },
          ],
        },
        paragraph('later'),
      ];
      const holder = defineBasePlugin('holder', {
        schema: {
          element: {
            void: 'block',
            blockContent: true,
            contentRoots: {
              body: {
                content: schema.content.type('paragraph', {
                  default: { type: 'paragraph' },
                  min: 1,
                }),
                ownership: 'exclusive',
              },
            },
          },
        },
      });
      const editor = createEditor({
        plugins: [...defaultPlugins, holder],
        initialValue: namedRoot
          ? {
              children: [
                {
                  type: 'holder',
                  childRoots: { body: 'header' },
                  children: [{ text: '' }],
                },
                paragraph('outside root'),
              ],
              roots: { header: children },
            }
          : { children },
      });
      const view = namedRoot
        ? createEditorView(editor, { root: 'header' })
        : editor;
      const range = {
        anchor: { path: [3, 0], offset: 12 },
        focus: { path: [1, 1], offset: 0 },
      };
      view.update.selection.set(range);
      const before = editor.read.value();
      const beforeSelection = editor.read.selection();
      const anchor = view.anchor([4], { deletion: 'drop' });
      const selectionAnchor = view.anchor(range, { deletion: 'drop' });
      let commits = 0;
      const unsubscribe = editor.subscribeCommit(() => {
        commits += 1;
      });
      const ai = editor.plugin(AIChatPlugin);
      const id = ai.api.start({ mode: 'chat', toolName: 'edit' });
      ai.api.receive(id, 'First\n\nSecond');
      const draft = ai.store.get('operation');
      const suggestion = editor.plugin(BaseSuggestionPlugin).api;
      expect(draft?.error).toBeUndefined();
      expect(draft?.status).toBe('streaming');
      expect(draft?.root).toBe(namedRoot ? 'header' : undefined);
      expect(
        draft?.preview
          .filter((node) => suggestion.suggestionData(node)?.type !== 'remove')
          .map((node) => suggestion.skipDeletes(node))
          .filter(Boolean)
      ).toEqual(['prefix First', 'Second suffix']);
      expect(editor.read.value()).toEqual(before);
      expect(editor.read.value().children).toBe(before.children);
      expect(editor.read.value().roots?.header).toBe(before.roots?.header);
      expect(editor.read.selection()).toEqual(beforeSelection);
      expect(editor.read.history.undos()).toHaveLength(0);
      expect(anchor.resolve()).toEqual([4]);
      expect(selectionAnchor.resolve()).toEqual(range);
      expect(commits).toBe(0);
      ai.api.finish(id);
      ai.api.accept();
      expect(commits).toBe(1);
      expect(view.read.children()).toEqual([
        paragraph('earlier'),
        {
          type: 'paragraph',
          children: [{ text: 'prefix ', bold: true }, { text: 'First' }],
        },
        {
          type: 'paragraph',
          children: [{ text: 'Second' }, { text: ' suffix', italic: true }],
        },
        paragraph('later'),
      ]);
      if (namedRoot) expect(editor.read.value().children).toBe(before.children);
      const accepted = editor.read.value();
      const acceptedSelection = editor.read.selection();
      expect(editor.read.history.undos()).toHaveLength(1);
      view.update.history.undo();
      expect(editor.read.value()).toEqual(before);
      expect(editor.read.selection()).toEqual(beforeSelection);
      view.update.history.redo();
      expect(editor.read.value()).toEqual(accepted);
      expect(editor.read.selection()).toEqual(acceptedSelection);
      anchor.release();
      selectionAnchor.release();
      unsubscribe();
    });
  }

  it('preserves settled identities through the public operation store', () => {
    const { editor } = createTestEditor({
      children: [paragraph('old first'), paragraph('old last')],
    });
    editor.update.selection.setNodes([[0], [1]]);
    const ai = editor.plugin(AIChatPlugin);
    const id = ai.api.start({ mode: 'chat', toolName: 'edit' });
    ai.api.receive(id, 'First\n\nSec');
    const first = ai.store.get('operation')!;
    ai.api.receive(id, 'First\n\nSecond');
    const next = ai.store.get('operation')!;
    expect(next.preview[0]).toBe(first.preview[0]);
    expect(next.value[0]).toBe(first.value[0]);
    expect(Object.isFrozen(next)).toBe(true);
    expect(Object.isFrozen(next.preview[0].children)).toBe(true);
  });

  it('retains settled preview nodes and one suggestion identity across cumulative updates', () => {
    const { editor } = createTestEditor({
      children: [paragraph('old first'), paragraph('old last')],
    });
    editor.update.selection.setNodes([[0], [1]]);
    const operation = createAIChatOperation(editor, () => {});
    const id = operation.start({ mode: 'chat', edit: true });
    operation.receive(id, 'First\n\nSec');
    const first = operation.current!.preview;
    const suggestion = editor.plugin(BaseSuggestionPlugin).api;
    const identities = (value: typeof first) =>
      [...NodeApi.texts({ type: 'document', children: value })].flatMap(
        ([node]) => {
          const data = suggestion.suggestionData(node);
          return data ? [data.id] : [];
        }
      );
    const originalIds = identities(first);
    expect(originalIds.length).toBeGreaterThan(0);
    expect(new Set(originalIds).size).toBe(1);
    operation.receive(id, 'First\n\nSecond');
    const next = operation.current!.preview;
    expect(next[0]).toBe(first[0]);
    expect(new Set(identities(next))).toEqual(new Set(originalIds));
    expect(editor.read.children()).toEqual([
      paragraph('old first'),
      paragraph('old last'),
    ]);
    expect(editor.read.history.undos()).toHaveLength(0);
  });
});
