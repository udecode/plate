import {
  DefaultAuthoredPlugin,
  type AuthoredChangePublication,
} from '../../authored';
import { createEditor } from '../../core';
import { BaseSuggestionPlugin } from './BaseSuggestionPlugin';

const value = [
  { children: [{ text: 'Accepted' }], type: 'paragraph' },
] as const;

describe('BaseSuggestionPlugin', () => {
  it('owns the editing and suggesting modes over native authored views', () => {
    const editor = createEditor({
      initialValue: value,
      plugins: [BaseSuggestionPlugin],
      userId: 'alice',
    });
    const suggestion = editor.plugin(BaseSuggestionPlugin);

    expect(suggestion.read.mode()).toBe('editing');
    suggestion.api.setMode('suggesting');
    expect(suggestion.read.mode()).toBe('suggesting');
    expect(editor.plugin(DefaultAuthoredPlugin).read.view()).toEqual({
      intent: 'propose',
      projection: 'markup',
    });

    editor.update.text.insert(' proposed', {
      at: { offset: 8, path: [0, 0] },
    });
    expect(editor.read.value().children).toEqual(value);
    expect(editor.plugin(DefaultAuthoredPlugin).read.changes().items).toEqual([
      expect.objectContaining({ authorId: 'alice', status: 'pending' }),
    ]);

    suggestion.api.setMode('editing');
    expect(editor.plugin(DefaultAuthoredPlugin).read.view()).toEqual({
      intent: 'edit',
      projection: 'accepted',
    });
  });

  it('publishes immutable affected change and text identities', () => {
    const editor = createEditor({
      initialValue: value,
      plugins: [BaseSuggestionPlugin],
      userId: 'alice',
    });
    const received: AuthoredChangePublication[] = [];
    const authored = editor.plugin(DefaultAuthoredPlugin);
    const stop = authored.api.subscribeChanges((publication) => {
      received.push(publication);
    });

    editor.plugin(BaseSuggestionPlugin).api.setMode('suggesting');
    editor.update.text.insert(' proposed', {
      at: { offset: 8, path: [0, 0] },
    });
    stop();

    expect(received).toHaveLength(1);
    expect(received[0].changeIds).toEqual([
      authored.read.changes().items[0].id,
    ]);
    expect(received[0].documentChanged).toBe(false);
    expect(received[0].nodeKeys).toContain(editor.key([0, 0]));
    expect(Object.isFrozen(received[0])).toBe(true);
    expect(Object.isFrozen(received[0].changeIds)).toBe(true);
    expect(Object.isFrozen(received[0].nodeKeys)).toBe(true);
  });
});
