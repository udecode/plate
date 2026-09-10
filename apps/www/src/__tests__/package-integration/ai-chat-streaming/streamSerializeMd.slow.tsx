import { AIChatPlugin } from 'platejs/ai/react';

import { createTestEditor } from './__tests__/createTestEditor';

const fixtures = [
  ['keeps content without a trailing line break', 'chunk1'],
  ['preserves internal text line breaks', 'chunk1\nchunk2'],
  ['preserves markdown hard break syntax', 'chunk1\\\nchunk2'],
  [
    'preserves mixed text line breaks and markdown hard breaks',
    'chunk1\nchunk2\\\nchunk3',
  ],
  ['preserves trailing spaces', 'chunk1\n '],
  ['preserves spaces before trailing line breaks', 'chunk1 \n '],
  [
    'preserves literal trailing backslashes before newline whitespace',
    'chunk1\\\\\n ',
  ],
  ['preserves a trailing line break', 'chunk1\n'],
  [
    'preserves trailing blank lines without manufacturing an empty block',
    'chunk1\n\n',
  ],
  ['preserves headings with a trailing line break', '## Heading 1\n'],
  ['preserves complete code blocks', '```ts\nconst a = 123\n```'],
  ['preserves incomplete code blocks', '```ts\nconst a = 123'],
  ['preserves complete math blocks', '$$\nE = mc^2\n$$'],
  ['preserves incomplete math blocks', '$$E = mc^2'],
] as const;

describe('AIChatPlugin raw Markdown source preservation', () => {
  it.each(fixtures)('%s', (_label, source) => {
    const { editor } = createTestEditor();
    const before = editor.read.value();
    const selection = editor.read.selection();
    const ai = editor.plugin(AIChatPlugin);
    const id = ai.api.start({ mode: 'insert', toolName: 'generate' });
    for (let end = 1; end <= source.length; end++) {
      const cumulative = source.slice(0, end);
      ai.api.receive(id, cumulative);
      expect(ai.store.get('operation')?.source).toBe(cumulative);
      expect(editor.read.value()).toEqual(before);
      expect(editor.read.selection()).toEqual(selection);
      expect(editor.read.history.undos()).toHaveLength(0);
    }
    ai.api.finish(id);
    const operation = ai.store.get('operation');
    expect(operation?.status).toBe('ready');
    expect(operation?.source).toBe(source);
    expect(operation?.value).toEqual(
      editor.api.markdown.deserialize(source).children
    );
    expect(editor.read.value()).toEqual(before);
    expect(editor.read.history.undos()).toHaveLength(0);
  });
});
