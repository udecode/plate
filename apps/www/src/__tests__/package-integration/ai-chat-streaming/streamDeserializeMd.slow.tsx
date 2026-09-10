import { AIChatPlugin } from 'platejs/ai/react';

import { createTestEditor } from './__tests__/createTestEditor';

const streamSource = (source: string) => {
  const { editor } = createTestEditor();
  const before = editor.read.value();
  const ai = editor.plugin(AIChatPlugin);
  const id = ai.api.start({ mode: 'insert', toolName: 'generate' });
  ai.api.receive(id, source);
  ai.api.finish(id);
  const operation = ai.store.get('operation');
  expect(operation?.status).toBe('ready');
  expect(operation?.source).toBe(source);
  expect(operation?.value).toEqual(
    editor.api.markdown.deserialize(source).children
  );
  expect(editor.read.value()).toEqual(before);
  expect(editor.read.history.undos()).toHaveLength(0);
  return operation;
};

describe('AIChatPlugin detached Markdown parsing', () => {
  it('preserves paragraph source with a trailing blank line', () => {
    const operation = streamSource('chunk1\n\n');
    expect(operation?.value).toEqual([
      { type: 'paragraph', children: [{ text: 'chunk1' }] },
    ]);
  });

  it('keeps trailing line breaks inside code blocks', () => {
    const operation = streamSource('```typescript\nconst a = 1\n\n');
    expect(operation?.value).toEqual([
      {
        children: [
          { children: [{ text: 'const a = 1' }], type: 'codeLine' },
          { children: [{ text: '' }], type: 'codeLine' },
        ],
        language: 'typescript',
        type: 'codeBlock',
      },
    ]);
  });

  it('preserves an incomplete inline math source without serialization feedback', () => {
    streamSource('$$a^2 ');
  });

  it('preserves incomplete HTML source using complete Markdown parsing', () => {
    streamSource('<!DOCTYPE ');
  });
});
