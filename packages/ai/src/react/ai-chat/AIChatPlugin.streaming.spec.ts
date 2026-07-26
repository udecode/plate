import { BaseParagraphPlugin } from '@platejs/core';
import { createPlateEditor } from '@platejs/core/react';

import { AI_PREVIEW_KEY } from '../../lib/BaseAIPlugin';
import { AIChatPlugin } from './AIChatPlugin';

const createEditor = () =>
  createPlateEditor({
    plugins: [BaseParagraphPlugin, AIChatPlugin],
    selection: {
      kind: 'text',
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 0, path: [0, 0] },
    },
    initialValue: [{ children: [{ text: '' }], type: 'p' }],
  });

describe('AIChatPlugin streaming', () => {
  it('keeps a trailing empty paragraph while deserializing chunks', () => {
    const editor = createEditor();

    expect(
      editor.plugin(AIChatPlugin).api.deserializeChunk('hello\n\n')
    ).toEqual([
      { children: [{ text: 'hello' }], type: 'p' },
      { children: [{ text: '' }], type: 'p' },
    ]);
  });

  it('streams into the current empty block with supplied element props', () => {
    const editor = createEditor();

    editor.plugin(AIChatPlugin).api.insertChunk('hello', {
      elementProps: { [AI_PREVIEW_KEY]: true },
    });

    expect(editor.read.text.string([])).toBe('hello');
    expect(Reflect.get(editor.read.children()[0]!, AI_PREVIEW_KEY)).toBe(true);
  });
});
