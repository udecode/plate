import { createSlateEditor } from '../../editor';
import { ChunkingPlugin } from './ChunkingPlugin';

describe('withChunking', () => {
  it('uses the current editor root as the default chunking ancestor', () => {
    const editor = createSlateEditor({
      plugins: [ChunkingPlugin],
    });

    expect(editor.getChunkSize?.(editor)).toBe(1000);
    expect(
      editor.getChunkSize?.({
        children: [{ text: 'hello' }],
        type: 'p',
      })
    ).toBeNull();
  });

  it('returns the configured chunk size only for matching ancestors', () => {
    let editor: ReturnType<typeof createSlateEditor>;
    const query = mock((ancestor: unknown) => ancestor === editor);

    editor = createSlateEditor({
      plugins: [
        ChunkingPlugin.configure({
          options: {
            chunkSize: 48,
            query,
          },
        }),
      ],
    });

    expect(editor.getChunkSize?.(editor)).toBe(48);
    expect(
      editor.getChunkSize?.({
        children: [{ text: 'hello' }],
        type: 'p',
      })
    ).toBeNull();
    expect(query).toHaveBeenCalledTimes(2);
  });
});
