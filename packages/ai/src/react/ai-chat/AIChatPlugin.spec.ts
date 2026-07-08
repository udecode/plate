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

    editor.plugin(AIChatPlugin).setOption('streaming', true);
    editor.plugin(AIChatPlugin).setOption('_blockChunks', 'abc');
    editor.plugin(AIChatPlugin).setOption('_blockPath', [0]);
    editor.plugin(AIChatPlugin).setOption('_mdxName', 'foo');

    editor.getApi(AIChatPlugin).aiChat.stop();

    expect(editor.plugin(AIChatPlugin).getOption('streaming')).toBe(false);
    expect(editor.plugin(AIChatPlugin).getOption('_blockChunks')).toBe('');
    expect(editor.plugin(AIChatPlugin).getOption('_blockPath')).toBeNull();
    expect(editor.plugin(AIChatPlugin).getOption('_mdxName')).toBeNull();
  });
});
