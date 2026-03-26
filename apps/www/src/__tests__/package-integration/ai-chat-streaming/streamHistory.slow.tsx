import { ElementApi, KEYS, PathApi, getPluginType } from 'platejs';

import { AIChatPlugin } from '../../../../../../packages/ai/src/react/ai-chat/AIChatPlugin';
import {
  getInsertPreviewStart,
  streamInsertChunk,
} from '../../../../../../packages/ai/src/react/ai-chat/streaming/streamInsertChunk';
import { acceptAIChat } from '../../../../../../packages/ai/src/react/ai-chat/transforms/acceptAIChat';
import { createTestEditor } from './__tests__/createTestEditor';

const streamPreview = (chunks: string[]) => {
  const { editor } = createTestEditor();
  const initialSelection = JSON.parse(JSON.stringify(editor.selection));
  const initialValue = JSON.parse(JSON.stringify(editor.children));

  editor.setOption(AIChatPlugin, 'mode', 'insert');
  editor.setOption(AIChatPlugin, 'open', true);

  const { startBlock, startInEmptyParagraph } = getInsertPreviewStart(editor);

  editor.tf.ai.beginPreview({
    originalBlocks:
      startInEmptyParagraph && startBlock && ElementApi.isElement(startBlock)
        ? [structuredClone(startBlock)]
        : [],
  });

  editor.tf.withoutSaving(() => {
    editor.tf.insertNodes(
      {
        children: [{ text: '' }],
        type: getPluginType(editor, KEYS.aiChat),
      },
      {
        at: PathApi.next(editor.selection!.focus.path.slice(0, 1)),
      }
    );
  });

  editor.setOption(AIChatPlugin, 'streaming', true);

  for (const chunk of chunks) {
    editor.tf.withoutSaving(() => {
      streamInsertChunk(editor, chunk, {
        textProps: {
          [getPluginType(editor, KEYS.ai)]: true,
        },
      });
    });
  }

  editor.setOption(AIChatPlugin, 'streaming', false);
  editor.setOption(AIChatPlugin, '_blockChunks', '');
  editor.setOption(AIChatPlugin, '_blockPath', null);
  editor.setOption(AIChatPlugin, '_mdxName', null);

  return { editor, initialSelection, initialValue };
};

describe('ai chat streaming history', () => {
  it('keeps insert-mode preview out of history and restores the snapshot on ai undo', () => {
    const { editor, initialValue } = streamPreview(['hello', ' world']);

    expect(editor.history.undos).toHaveLength(0);

    editor.tf.ai.undo();

    expect(editor.children).toEqual(initialValue);
    expect(editor.history.undos).toHaveLength(0);
  });

  it('accepts streamed preview as a compact undoable batch', () => {
    const chunks = Array.from({ length: 40 }, () => 'chunk ');
    const { editor, initialSelection, initialValue } = streamPreview(chunks);

    acceptAIChat(editor);

    expect(editor.history.undos).toHaveLength(1);
    expect(editor.history.undos[0].operations.length).toBeLessThan(
      chunks.length
    );
    expect(
      editor.api.some({
        at: [],
        match: (n: any) =>
          ElementApi.isElement(n) &&
          n.type === getPluginType(editor, KEYS.aiChat),
      })
    ).toBe(false);
    expect(
      editor.api.some({
        at: [],
        match: (n: any) => !!n[getPluginType(editor, KEYS.ai)],
      })
    ).toBe(false);
    expect(
      editor.api.some({
        at: [],
        match: (n: any) => ElementApi.isElement(n) && !!n.aiPreview,
      })
    ).toBe(false);

    editor.undo();

    expect(editor.children).toEqual(initialValue);
    expect(editor.selection).toEqual(initialSelection);
  });

  it('places the cursor at the end of the accepted preview', () => {
    const { editor } = streamPreview(['hello', ' world']);

    acceptAIChat(editor);

    expect(editor.selection).toEqual({
      anchor: { offset: 11, path: [0, 0] },
      focus: { offset: 11, path: [0, 0] },
    });
  });

  it('restores the accepted cursor on redo after undo', () => {
    const { editor } = streamPreview(['hello', ' world']);

    acceptAIChat(editor);
    editor.undo();
    editor.redo();

    expect(editor.selection).toEqual({
      anchor: { offset: 11, path: [0, 0] },
      focus: { offset: 11, path: [0, 0] },
    });
  });
});
