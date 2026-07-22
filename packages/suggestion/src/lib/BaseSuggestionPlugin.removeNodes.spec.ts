import { createBaseEditor } from '@platejs/core';

import { BaseSuggestionPlugin } from './BaseSuggestionPlugin';

describe('editor.update.suggestion.removeNodes', () => {
  it('does nothing for an empty node list', () => {
    const editor = createBaseEditor({
      plugins: [BaseSuggestionPlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
      },
      initialValue: [{ type: 'p', children: [{ text: 'one' }] }],
    });

    editor.update.suggestion.removeNodes([]);

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
        kind: 'text',
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
      },
      initialValue: [
        { type: 'p', children: [{ text: 'one' }] },
        { type: 'p', children: [{ text: 'two' }] },
      ],
    });

    const nodes = [
      [editor.read.children()[0], [0]],
      [editor.read.children()[1], [1]],
    ] as any;

    editor.update.suggestion.removeNodes(nodes);

    const firstSuggestion = (editor.read.children()[0] as any).suggestion;
    const secondSuggestion = (editor.read.children()[1] as any).suggestion;

    expect(firstSuggestion).toMatchObject({
      type: 'remove',
      userId: 'user-1',
    });
    expect(secondSuggestion).toMatchObject({
      type: 'remove',
      userId: 'user-1',
    });
    expect(firstSuggestion.id).toBe(secondSuggestion.id);
    expect(firstSuggestion.createdAt).toBe(secondSuggestion.createdAt);
  });
});
