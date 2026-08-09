import { ElementApi, PathApi } from 'platejs';
import { BaseAIPlugin } from '@platejs/ai';
import { AIChatPlugin } from '@platejs/ai/react';

import { createTestEditor } from './__tests__/createTestEditor';

const streamPreview = (chunks: string[]) => {
  const { editor } = createTestEditor();
  const initialSelection = JSON.parse(JSON.stringify(editor.read.selection()));
  const initialValue = JSON.parse(JSON.stringify(editor.read.children()));

  editor.plugin(AIChatPlugin).store.set({ mode: 'insert', open: true });

  const aiChat = editor.plugin(AIChatPlugin);
  const { startBlock, startInEmptyParagraph } = aiChat.read.insertStart();

  editor.plugin(BaseAIPlugin).update.beginPreview({
    originalBlocks:
      startInEmptyParagraph && startBlock && ElementApi.isElement(startBlock)
        ? [structuredClone(startBlock)]
        : [],
  });

  const insertAt = PathApi.next(
    editor.read.selection()!.focus.path.slice(0, 1)
  );

  editor.update({ history: 'skip' }).nodes.insert(
    {
      children: [{ text: '' }],
      type: editor.plugin(AIChatPlugin).schema.type,
    },
    {
      at: insertAt,
    }
  );

  editor.plugin(AIChatPlugin).store.set({ streaming: true });

  for (const chunk of chunks) {
    aiChat.update.insertChunk(chunk, {
      textProps: {
        [editor.plugin(BaseAIPlugin).schema.key]: true,
      },
    });
  }

  editor.plugin(AIChatPlugin).store.set({
    _blockChunks: '',
    _blockPath: null,
    _mdxName: null,
    streaming: false,
  });

  return { editor, initialSelection, initialValue };
};

describe('ai chat streaming history', () => {
  it('keeps insert-mode preview out of history and restores the snapshot on ai undo', () => {
    const { editor, initialValue } = streamPreview(['hello', ' world']);

    expect(editor.read.history.undos()).toHaveLength(0);

    editor.plugin(BaseAIPlugin).update.undo();

    expect(editor.read.children()).toEqual(initialValue);
    expect(editor.read.history.undos()).toHaveLength(0);
  });

  it('accepts streamed preview as a compact undoable batch', () => {
    const chunks = Array.from({ length: 40 }, () => 'chunk ');
    const { editor, initialSelection, initialValue } = streamPreview(chunks);

    editor.plugin(AIChatPlugin).update.accept();

    expect(editor.read.history.undos()).toHaveLength(1);
    const [batch] = editor.read.history.undos();
    const mainChange = batch!.change.toJSON().primary;

    expect(mainChange).toBeDefined();
    expect(mainChange!.length).toBeLessThan(chunks.length);
    expect(
      editor.read.nodes.some({
        at: [],
        match: (n: any) =>
          ElementApi.isElement(n) &&
          n.type === editor.plugin(AIChatPlugin).schema.type,
      })
    ).toBe(false);
    expect(
      editor.read.nodes.some({
        at: [],
        match: (n: any) => !!n[editor.plugin(BaseAIPlugin).schema.key],
      })
    ).toBe(false);
    expect(
      editor.read.nodes.some({
        at: [],
        match: (n: any) => ElementApi.isElement(n) && !!n.aiPreview,
      })
    ).toBe(false);

    editor.update.history.undo();

    expect(editor.read.children()).toEqual(initialValue);
    expect(editor.read.selection()).toEqual(initialSelection);
  });

  it('places the cursor at the end of the accepted preview', () => {
    const { editor } = streamPreview(['hello', ' world']);

    editor.plugin(AIChatPlugin).update.accept();

    expect(editor.read.selection()).toEqual({
      kind: 'text',
      anchor: { offset: 11, path: [0, 0] },
      focus: { offset: 11, path: [0, 0] },
    });
  });

  it('restores the accepted cursor on redo after undo', () => {
    const { editor } = streamPreview(['hello', ' world']);

    editor.plugin(AIChatPlugin).update.accept();
    editor.update.history.undo();
    editor.update.history.redo();

    expect(editor.read.selection()).toEqual({
      kind: 'text',
      anchor: { offset: 11, path: [0, 0] },
      focus: { offset: 11, path: [0, 0] },
    });
  });
});
