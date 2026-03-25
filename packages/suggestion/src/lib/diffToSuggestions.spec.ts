import { createSlateEditor } from 'platejs';

import { BaseSuggestionPlugin } from './BaseSuggestionPlugin';
import { diffToSuggestions } from './diffToSuggestions';
import { getInlineSuggestionData } from './utils/getSuggestionId';

const createSuggestionEditor = () =>
  createSlateEditor({
    plugins: [
      BaseSuggestionPlugin.configure({
        options: {
          currentUserId: 'user-1',
        },
      }),
    ],
  });

describe('diffToSuggestions', () => {
  it('marks inserted text and leaves untouched text alone', () => {
    const editor = createSuggestionEditor();

    const value = diffToSuggestions(
      editor,
      [{ type: 'p', children: [{ text: 'a' }] }],
      [{ type: 'p', children: [{ text: 'ab' }] }]
    );

    expect(value[0].children).toHaveLength(2);
    expect(value[0].children[0]).toEqual({ text: 'a' });
    expect(value[0].children[1]).toMatchObject({
      suggestion: true,
      text: 'b',
    });
    expect(getInlineSuggestionData(value[0].children[1] as any)).toMatchObject({
      type: 'insert',
      userId: 'user-1',
    });
  });

  it('reuses the same id and timestamp for adjacent remove and insert replacements', () => {
    const editor = createSuggestionEditor();

    const value = diffToSuggestions(
      editor,
      [{ type: 'p', children: [{ text: 'ab' }] }],
      [{ type: 'p', children: [{ text: 'ac' }] }]
    );

    const removed = value[0].children[1];
    const inserted = value[0].children[2];
    const removedData = getInlineSuggestionData(removed as any)!;
    const insertedData = getInlineSuggestionData(inserted as any)!;

    expect(removed).toMatchObject({ suggestion: true, text: 'b' });
    expect(inserted).toMatchObject({ suggestion: true, text: 'c' });
    expect(removedData.type).toBe('remove');
    expect(insertedData.type).toBe('insert');
    expect(insertedData.id).toBe(removedData.id);
    expect(insertedData.createdAt).toBe(removedData.createdAt);
  });

  it('recursively traverses nested element children', () => {
    const editor = createSuggestionEditor();

    const value = diffToSuggestions(
      editor,
      [
        {
          type: 'blockquote',
          children: [{ type: 'p', children: [{ text: 'a' }] }],
        },
      ],
      [
        {
          type: 'blockquote',
          children: [{ type: 'p', children: [{ text: 'ab' }] }],
        },
      ]
    );

    const inserted = ((value[0] as any).children[0] as any).children[1];

    expect(inserted).toMatchObject({
      suggestion: true,
      text: 'b',
    });
    expect(getInlineSuggestionData(inserted)).toMatchObject({
      type: 'insert',
      userId: 'user-1',
    });
  });

  it('keeps separate replacement groups distinct when they are not adjacent', () => {
    const editor = createSuggestionEditor();

    const value = diffToSuggestions(
      editor,
      [
        { type: 'p', children: [{ text: 'ab' }] },
        { type: 'p', children: [{ text: 'cd' }] },
      ],
      [
        { type: 'p', children: [{ text: 'ac' }] },
        { type: 'p', children: [{ text: 'ce' }] },
      ]
    );

    const firstRemovedData = getInlineSuggestionData(
      value[0].children[1] as any
    )!;
    const firstInsertedData = getInlineSuggestionData(
      value[0].children[2] as any
    )!;
    const secondRemovedData = getInlineSuggestionData(
      value[1].children[1] as any
    )!;
    const secondInsertedData = getInlineSuggestionData(
      value[1].children[2] as any
    )!;

    expect(firstInsertedData.id).toBe(firstRemovedData.id);
    expect(secondInsertedData.id).toBe(secondRemovedData.id);
    expect(firstInsertedData.id).not.toBe(secondInsertedData.id);
  });
});
