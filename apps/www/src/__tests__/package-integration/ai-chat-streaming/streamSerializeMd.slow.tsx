import { AIChatPlugin } from '@platejs/ai/react';

import { createTestEditor } from './__tests__/createTestEditor';

const { editor } = createTestEditor() as any;

describe('AIChatPlugin read.serializeChunk', () => {
  it('keeps content without a trailing line break', () => {
    const chunk = 'chunk1';
    const input = editor.plugin(AIChatPlugin).api.deserializeChunk(chunk);

    const output = editor
      .plugin(AIChatPlugin)
      .read.serializeChunk({ value: { children: input } }, chunk);

    expect(output).toBe('chunk1');
  });

  it('preserves internal text line breaks', () => {
    const chunk = 'chunk1\nchunk2';
    const input = editor.plugin(AIChatPlugin).api.deserializeChunk(chunk);

    const output = editor
      .plugin(AIChatPlugin)
      .read.serializeChunk({ value: { children: input } }, chunk);

    expect(output).toBe(chunk);
  });

  it('preserves markdown hard break syntax', () => {
    const chunk = 'chunk1\\\nchunk2';
    const input = editor.plugin(AIChatPlugin).api.deserializeChunk(chunk);

    const output = editor
      .plugin(AIChatPlugin)
      .read.serializeChunk({ value: { children: input } }, chunk);

    expect(output).toBe(chunk);
  });

  it('preserves mixed text line breaks and markdown hard breaks', () => {
    const chunk = 'chunk1\nchunk2\\\nchunk3';
    const input = [
      {
        children: [
          { text: 'chunk1\nchunk2' },
          { text: '\n' },
          { text: 'chunk3' },
        ],
        type: 'paragraph',
      },
    ];

    const output = editor
      .plugin(AIChatPlugin)
      .read.serializeChunk({ value: { children: input } }, chunk);

    expect(output).toBe(chunk);
  });

  it('preserves trailing spaces', () => {
    const chunk = 'chunk1\n ';
    const input = editor.plugin(AIChatPlugin).api.deserializeChunk(chunk);

    const output = editor
      .plugin(AIChatPlugin)
      .read.serializeChunk({ value: { children: input } }, chunk);

    expect(output).toBe('chunk1\n ');
  });

  it('preserves spaces before trailing line breaks', () => {
    const chunk = 'chunk1 \n ';
    const input = editor.plugin(AIChatPlugin).api.deserializeChunk(chunk);

    const output = editor
      .plugin(AIChatPlugin)
      .read.serializeChunk({ value: { children: input } }, chunk);

    expect(output).toBe(chunk);
  });

  it('preserves literal trailing backslashes before newline whitespace', () => {
    const chunk = 'chunk1\\\\\n ';
    const input = [
      {
        children: [{ text: chunk }],
        type: 'paragraph',
      },
    ];

    const output = editor
      .plugin(AIChatPlugin)
      .read.serializeChunk({ value: { children: input } }, chunk);

    expect(output).toBe(chunk);
  });

  it('preserves a trailing line break', () => {
    const chunk = 'chunk1\n';
    const input = editor.plugin(AIChatPlugin).api.deserializeChunk(chunk);

    const output = editor
      .plugin(AIChatPlugin)
      .read.serializeChunk({ value: { children: input } }, chunk);

    expect(output).toBe('chunk1\n');
  });

  it('drops an incomplete trailing block without a line break', () => {
    const chunk = 'chunk1\n\n';

    const lastBlock = editor
      .plugin(AIChatPlugin)
      .api.deserializeChunk(chunk)
      .at(-1);

    const output = editor
      .plugin(AIChatPlugin)
      .read.serializeChunk({ value: { children: [lastBlock] } }, chunk);

    expect(output).toBe('');
  });

  it('serializes headings with a trailing line break', () => {
    const chunk = '## Heading 1\n';
    const input = editor.plugin(AIChatPlugin).api.deserializeChunk(chunk);

    const output = editor
      .plugin(AIChatPlugin)
      .read.serializeChunk({ value: { children: input } }, chunk);

    expect(output).toBe('## Heading 1\n');
  });

  describe('complete and incomplete stable blocks', () => {
    it('preserves complete code blocks', async () => {
      const chunk = '```ts\nconst a = 123\n```';

      const result = editor.plugin(AIChatPlugin).api.deserializeChunk(chunk);

      const output = editor
        .plugin(AIChatPlugin)
        .read.serializeChunk({ value: { children: result } }, chunk);

      expect(output).toBe(chunk);
    });

    it('preserves incomplete code blocks', async () => {
      const chunk = '```ts\nconst a = 123';

      const result = editor.plugin(AIChatPlugin).api.deserializeChunk(chunk);

      const output = editor
        .plugin(AIChatPlugin)
        .read.serializeChunk({ value: { children: result } }, chunk);

      expect(output).toBe(chunk);
    });

    it('preserves complete math blocks', async () => {
      const chunk = '$$\nE = mc^2\n$$';

      const result = editor.plugin(AIChatPlugin).api.deserializeChunk(chunk);

      const output = editor
        .plugin(AIChatPlugin)
        .read.serializeChunk({ value: { children: result } }, chunk);

      expect(output).toBe(chunk);
    });

    it('preserves incomplete math blocks', async () => {
      const chunk = '$$E = mc^2';

      const result = editor.plugin(AIChatPlugin).api.deserializeChunk(chunk);

      const output = editor
        .plugin(AIChatPlugin)
        .read.serializeChunk({ value: { children: result } }, chunk);

      expect(output).toBe(chunk);
    });
  });
});
