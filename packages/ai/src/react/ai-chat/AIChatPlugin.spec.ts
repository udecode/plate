import { describe, expect, it } from 'bun:test';

import { BaseParagraphPlugin, createSlateEditor } from 'platejs';

import { BaseAIPlugin } from '../../lib/BaseAIPlugin';
import { AIChatPlugin } from './AIChatPlugin';

describe('AIChatPlugin', () => {
  it('clears internal streaming state when stop is called', () => {
    const editor = createSlateEditor({
      plugins: [BaseParagraphPlugin, BaseAIPlugin, AIChatPlugin],
      value: [{ children: [{ text: 'x' }], type: 'p' }],
    });

    editor.setOption(AIChatPlugin, 'streaming', true);
    editor.setOption(AIChatPlugin, '_blockChunks', 'abc');
    editor.setOption(AIChatPlugin, '_blockPath', [0]);
    editor.setOption(AIChatPlugin, '_mdxName', 'foo');

    editor.getApi(AIChatPlugin).aiChat.stop();

    expect(editor.getOption(AIChatPlugin, 'streaming')).toBe(false);
    expect(editor.getOption(AIChatPlugin, '_blockChunks')).toBe('');
    expect(editor.getOption(AIChatPlugin, '_blockPath')).toBeNull();
    expect(editor.getOption(AIChatPlugin, '_mdxName')).toBeNull();
  });
});
