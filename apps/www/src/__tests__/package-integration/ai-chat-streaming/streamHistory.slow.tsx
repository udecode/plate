import { ElementApi, KEYS, PathApi, getPluginType } from 'platejs';
import { BaseAIPlugin } from '@platejs/ai';

import { AIChatPlugin } from '../../../../../../packages/ai/src/react/ai-chat/AIChatPlugin';
import {
  getInsertPreviewStart,
  streamInsertChunk,
} from '../../../../../../packages/ai/src/react/ai-chat/streaming/streamInsertChunk';
import { acceptAIChat } from '../../../../../../packages/ai/src/react/ai-chat/transforms/acceptAIChat';
import { createTestEditor } from './__tests__/createTestEditor';

const streamPreview = (chunks: string[]) => {
  const { editor } = createTestEditor();
  const initialSelection = JSON.parse(JSON.stringify(editor.read.selection()));
  const initialValue = JSON.parse(JSON.stringify(editor.read.children()));

  editor.plugin(AIChatPlugin).setOption('mode', 'insert');
  editor.plugin(AIChatPlugin).setOption('open', true);

  const { startBlock, startInEmptyParagraph } = getInsertPreviewStart(editor);

  editor.plugin(BaseAIPlugin).api.beginPreview({
    originalBlocks:
      startInEmptyParagraph && startBlock && ElementApi.isElement(startBlock)
        ? [structuredClone(startBlock)]
        : [],
  });

  editor.update({ history: 'skip' }, (tx) => {
    tx.nodes.insert(
      {
        children: [{ text: '' }],
        type: getPluginType(editor, KEYS.aiChat),
      },
      {
        at: PathApi.next(editor.read.selection()!.focus.path.slice(0, 1)),
      }
    );
  });

  editor.plugin(AIChatPlugin).setOption('streaming', true);

  for (const chunk of chunks) {
    streamInsertChunk(editor, chunk, {
      textProps: {
        [getPluginType(editor, KEYS.ai)]: true,
      },
    });
  }

  editor.plugin(AIChatPlugin).setOption('streaming', false);
  editor.plugin(AIChatPlugin).setOption('_blockChunks', '');
  editor.plugin(AIChatPlugin).setOption('_blockPath', null);
  editor.plugin(AIChatPlugin).setOption('_mdxName', null);

  return { editor, initialSelection, initialValue };
};

describe('ai chat streaming history', () => {
  it('keeps insert-mode preview out of history and restores the snapshot on ai undo', () => {
    const { editor, initialValue } = streamPreview(['hello', ' world']);

    expect(editor.read.history.undos()).toHaveLength(0);

    editor.plugin(BaseAIPlugin).api.undo();

    expect(editor.read.children()).toEqual(initialValue);
    expect(editor.read.history.undos()).toHaveLength(0);
  });

  it('accepts streamed preview as a compact undoable batch', () => {
    const chunks = Array.from({ length: 40 }, () => 'chunk ');
    const { editor, initialSelection, initialValue } = streamPreview(chunks);

    acceptAIChat(editor);

    expect(editor.read.history.undos()).toHaveLength(1);
    expect(editor.read.history.undos()[0]!.operations.length).toBeLessThan(
      chunks.length
    );
    expect(
      editor.read.nodes.some({
        at: [],
        match: (n: any) =>
          ElementApi.isElement(n) &&
          n.type === getPluginType(editor, KEYS.aiChat),
      })
    ).toBe(false);
    expect(
      editor.read.nodes.some({
        at: [],
        match: (n: any) => !!n[getPluginType(editor, KEYS.ai)],
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

    acceptAIChat(editor);

    expect(editor.read.selection()).toEqual({
      anchor: { offset: 11, path: [0, 0] },
      focus: { offset: 11, path: [0, 0] },
    });
  });

  it('restores the accepted cursor on redo after undo', () => {
    const { editor } = streamPreview(['hello', ' world']);

    acceptAIChat(editor);
    editor.update.history.undo();
    editor.update.history.redo();

    expect(editor.read.selection()).toEqual({
      anchor: { offset: 11, path: [0, 0] },
      focus: { offset: 11, path: [0, 0] },
    });
  });
});
