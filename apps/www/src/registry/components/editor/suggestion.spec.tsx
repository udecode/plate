import { DefaultAuthoredPlugin } from 'platejs/authored';
import { createEditor } from 'platejs/react';
import { SuggestionPlugin } from 'platejs/suggestion/react';

import { AIKit } from './ai';
import { SuggestionKit } from './suggestion';

const value = [
  { children: [{ text: 'Accepted' }], type: 'paragraph' },
] as const;

describe('SuggestionKit', () => {
  it('shares one authored extension identity with AIKit', () => {
    const editor = createEditor({
      initialValue: value,
      plugins: [...AIKit, ...SuggestionKit],
      userId: 'alice',
    });

    expect(editor.plugin(DefaultAuthoredPlugin).read.view()).toEqual({
      intent: 'edit',
      projection: 'accepted',
    });
  });

  it('uses the package plugin over native authored changes', () => {
    const editor = createEditor({
      initialValue: value,
      plugins: SuggestionKit,
      userId: 'alice',
    });
    const suggestion = editor.plugin(SuggestionPlugin);
    const authored = editor.plugin(DefaultAuthoredPlugin);

    expect(suggestion.installed).toBe(true);
    expect(suggestion.read.mode()).toBe('editing');
    expect(authored.read.view()).toEqual({
      intent: 'edit',
      projection: 'accepted',
    });

    suggestion.api.setMode('suggesting');
    editor.update.text.insert(' proposed', {
      at: { offset: 8, path: [0, 0] },
    });

    expect(editor.read.value().children).toEqual([
      { children: [{ text: 'Accepted' }], type: 'paragraph' },
    ]);
    expect(suggestion.read.mode()).toBe('suggesting');
    expect(authored.read.view()).toEqual({
      intent: 'propose',
      projection: 'markup',
    });
    expect(authored.read.changes().items).toEqual([
      expect.objectContaining({ authorId: 'alice', status: 'pending' }),
    ]);
  });

  it('keeps presentation optional and preserves authored identity checks', () => {
    const plain = createEditor({ initialValue: value });

    expect(plain.plugin(SuggestionPlugin).installed).toBe(false);

    const editor = createEditor({
      initialValue: value,
      plugins: SuggestionKit,
    });

    editor.plugin(SuggestionPlugin).api.setMode('suggesting');
    expect(() => editor.update.text.insert(' lost')).toThrow(
      'author is required'
    );
    expect(editor.read.children()).toEqual(value);
  });
});
