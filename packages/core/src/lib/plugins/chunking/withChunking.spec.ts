import { createSlateEditor } from '../../editor';
import { ChunkingPlugin } from './ChunkingPlugin';

describe('withChunking', () => {
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

    expect((editor as any).getChunkSize(editor)).toBe(48);
    expect(
      (editor as any).getChunkSize({
        children: [{ text: 'hello' }],
        type: 'p',
      })
    ).toBeNull();
    expect(query).toHaveBeenCalledTimes(2);
  });
});
