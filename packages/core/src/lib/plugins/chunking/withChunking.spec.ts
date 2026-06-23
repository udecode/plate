import { createBasePlateEditor } from '../../editor';
import { ChunkingPlugin } from './ChunkingPlugin';

describe('withChunking', () => {
  it('uses the current editor root as the default chunking ancestor', () => {
    const editor = createBasePlateEditor({
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
    let editor: ReturnType<typeof createBasePlateEditor>;
    const query = mock((ancestor: unknown) => ancestor === editor);

    editor = createBasePlateEditor({
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
