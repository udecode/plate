import { AuthoredPlugin, projectAuthoredDocument } from '../../authored';
import { createEditor } from '../../core';
import { BaseSuggestionPlugin } from './BaseSuggestionPlugin';

const value = [
  { children: [{ text: 'Accepted' }], type: 'paragraph' },
] as const;

describe('BaseSuggestionPlugin', () => {
  it('enters suggestion mode as the local user when the editor names no user', () => {
    const editor = createEditor({
      initialValue: value,
      plugins: [BaseSuggestionPlugin],
    });

    editor.plugin(BaseSuggestionPlugin).api.setMode('suggesting');

    expect(editor.plugin(BaseSuggestionPlugin).read.mode()).toBe('suggesting');
  });

  it('records writes as suggestions only in suggesting mode', () => {
    const editor = createEditor({
      initialValue: value,
      plugins: [BaseSuggestionPlugin],
      userId: 'alice',
    });
    const suggestion = editor.plugin(BaseSuggestionPlugin);
    const accepted = () =>
      projectAuthoredDocument(editor.read.value(), { projection: 'accepted' })
        .document.children;

    expect(suggestion.read.mode()).toBe('editing');
    suggestion.api.setMode('suggesting');
    expect(editor.plugin(AuthoredPlugin).read.view()).toEqual({
      intent: 'propose',
    });

    editor.update.text.insert(' proposed', {
      at: { offset: 8, path: [0, 0] },
    });
    expect(accepted()).toEqual(value);
    expect(editor.plugin(AuthoredPlugin).read.changes().items).toEqual([
      expect.objectContaining({ authorId: 'alice' }),
    ]);

    suggestion.api.setMode('editing');
    expect(suggestion.read.mode()).toBe('editing');
    editor.update.text.insert('!', {
      at: { offset: 0, path: [0, 0] },
    });
    expect(accepted()).toEqual([
      { children: [{ text: '!Accepted' }], type: 'paragraph' },
    ]);
    expect(editor.read.text.string([])).toBe('!Accepted proposed');
  });
});
