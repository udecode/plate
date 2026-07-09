import { createBaseEditor } from '@platejs/core';

import { BaseSuggestionPlugin } from '../BaseSuggestionPlugin';
import { removeNodesSuggestion } from './removeNodesSuggestion';

describe('removeNodesSuggestion', () => {
  it('does nothing for an empty node list', () => {
    const editor = createBaseEditor({
      plugins: [BaseSuggestionPlugin],
      selection: {
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
      },
      value: [{ type: 'p', children: [{ text: 'one' }] }],
    });

    removeNodesSuggestion(editor, []);

    expect(editor.read.children()).toEqual([{ ...editor.read.children()[0] }]);
  });

  it('reuses one removal id and timestamp across every marked node', () => {
    const editor = createBaseEditor({
      plugins: [
        BaseSuggestionPlugin.configure({
          options: {
            currentUserId: 'user-1',
          },
        }),
      ],
      selection: {
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
      },
      value: [
        { type: 'p', children: [{ text: 'one' }] },
        { type: 'p', children: [{ text: 'two' }] },
      ],
    });

    const nodes = [
      [editor.read.children()[0], [0]],
      [editor.read.children()[1], [1]],
    ] as any;

    removeNodesSuggestion(editor, nodes);

    const firstSuggestion = (editor.read.children()[0] as any).suggestion;
    const secondSuggestion = (editor.read.children()[1] as any).suggestion;

    expect(firstSuggestion).toMatchObject({ type: 'remove' });
    expect(secondSuggestion).toMatchObject({ type: 'remove' });
    expect(firstSuggestion.id).toBe(secondSuggestion.id);
    expect(firstSuggestion.createdAt).toBe(secondSuggestion.createdAt);
  });
});
