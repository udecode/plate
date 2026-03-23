import { createSlateEditor } from 'platejs';

import { BaseSuggestionPlugin } from '../BaseSuggestionPlugin';
import { removeNodesSuggestion } from './removeNodesSuggestion';

describe('removeNodesSuggestion', () => {
  it('does nothing for an empty node list', () => {
    const editor = createSlateEditor({
      plugins: [BaseSuggestionPlugin],
      selection: {
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
      },
      value: [{ type: 'p', children: [{ text: 'one' }] }],
    });

    removeNodesSuggestion(editor, []);

    expect(editor.children).toEqual([{ ...editor.children[0] }]);
  });

  it('reuses one removal id and timestamp across every marked node', () => {
    const editor = createSlateEditor({
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
      [editor.children[0], [0]],
      [editor.children[1], [1]],
    ] as any;

    removeNodesSuggestion(editor, nodes);

    const firstSuggestion = (editor.children[0] as any).suggestion;
    const secondSuggestion = (editor.children[1] as any).suggestion;

    expect(firstSuggestion).toMatchObject({ type: 'remove' });
    expect(secondSuggestion).toMatchObject({ type: 'remove' });
    expect(firstSuggestion.id).toBe(secondSuggestion.id);
    expect(firstSuggestion.createdAt).toBe(secondSuggestion.createdAt);
  });
});
