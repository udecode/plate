/* eslint-disable jest/no-conditional-expect */
import { createPlateEditor } from '@udecode/plate-core/react';

import { experimental_parseNode } from './parseNode';

describe('experimental_parseNode', () => {
  const editor = createPlateEditor();

  beforeEach(() => {
    editor.children = [
      {
        children: [
          {
            text: 'hello world. this is a test.',
          },
        ],
        type: 'p',
      },
    ];
  });

  it('should find all matches in a single block', () => {
    const { annotations } = experimental_parseNode(editor, {
      at: [0],
      match: () => true,
      splitPattern: /\b[A-Za-z]+\b/g,
    });

    expect(annotations).toHaveLength(6); // hello, world, this, is, a, test

    // Check annotation positions
    expect(annotations[0].text).toBe('hello');
    expect(annotations[0].range.anchor.offset).toBe(0);
    expect(annotations[0].range.focus.offset).toBe(5);

    expect(annotations[1].text).toBe('world');
    expect(annotations[1].range.anchor.offset).toBe(6);
    expect(annotations[1].range.focus.offset).toBe(11);
  });

  it('should respect minLength and maxLength', () => {
    const { annotations } = experimental_parseNode(editor, {
      at: [0],
      match: () => true,
      maxLength: 5,
      minLength: 4,
      splitPattern: /\b[A-Za-z]+\b/g,
    });

    // Words with length 4-5: 'hello', 'world', 'this', 'test'
    expect(annotations).toHaveLength(4);
    expect(annotations.map((t) => t.text)).toEqual([
      'hello',
      'world',
      'this',
      'test',
    ]);
  });

  it('should apply match function correctly', () => {
    const { annotations } = experimental_parseNode(editor, {
      at: [0],
      match: ({ text }) => text.length > 4, // Only match words longer than 4 chars
      splitPattern: /\b[A-Za-z]+\b/g,
    });

    // Only words longer than 4 chars: 'hello', 'world'
    expect(annotations).toHaveLength(2);
    expect(annotations.map((t) => t.text)).toEqual(['hello', 'world']);
  });

  it('should provide correct context in match function', () => {
    const matchFn = jest.fn(({ end, fullText, getContext, start, text }) => {
      // Test context for 'world'
      if (text === 'world') {
        expect(start).toBe(6);
        expect(end).toBe(11);
        expect(fullText).toBe('hello world. this is a test.');

        const prevContext = getContext({ before: 2 });
        expect(prevContext).toContain('o '); // Previous chars before 'world'

        const nextContext = getContext({ after: 2 });
        expect(nextContext).toContain('. '); // Next chars after 'world'
      }

      return true;
    });

    experimental_parseNode(editor, {
      at: [0],
      match: matchFn,
      splitPattern: /\b[A-Za-z]+\b/g,
    });

    expect(matchFn).toHaveBeenCalled();
  });

  it('should handle transform function', () => {
    const { annotations } = experimental_parseNode(editor, {
      at: [0],
      match: () => true,
      splitPattern: /\b[A-Za-z]+\b/g,
      transform: (annotation) => ({
        ...annotation,
        data: { transformed: true },
      }),
    });

    annotations.forEach((annotation) => {
      expect(annotation.data).toEqual({ transformed: true });
    });
  });

  it('should parse entire editor when at is undefined', () => {
    editor.children = [
      {
        children: [
          {
            text: 'hello world.',
          },
        ],
        type: 'p',
      },
      {
        children: [
          {
            text: 'another block.',
          },
        ],
        type: 'p',
      },
    ];

    const { annotations } = experimental_parseNode(editor, {
      match: () => true,
      splitPattern: /\b[A-Za-z]+\b/g,
    });

    expect(annotations).toHaveLength(4); // hello, world, another, block
    expect(annotations.map((t) => t.text)).toEqual([
      'hello',
      'world',
      'another',
      'block',
    ]);

    // Check paths are correct - now they should be nested under root []
    expect(annotations[0].range.anchor.path).toEqual([0, 0]);
    expect(annotations[2].range.anchor.path).toEqual([1, 0]);
  });

  it('should handle empty editor', () => {
    editor.children = [];

    const { annotations } = experimental_parseNode(editor, {
      match: () => true,
      splitPattern: /\b[A-Za-z]+\b/g,
    });

    expect(annotations).toHaveLength(0);
  });

  it('should handle root block with at=[]', () => {
    editor.children = [
      {
        children: [{ text: 'hello' }],
        type: 'p',
      },
      {
        children: [{ text: 'world' }],
        type: 'p',
      },
    ];

    const { annotations } = experimental_parseNode(editor, {
      match: () => true,
      splitPattern: /\b[A-Za-z]+\b/g,
    });

    expect(annotations.map((t) => t.text)).toEqual(['hello', 'world']);
    expect(annotations[0].range.anchor.path).toEqual([0, 0]);
    expect(annotations[1].range.anchor.path).toEqual([1, 0]);
  });

  it('should handle nested blocks with at=[]', () => {
    editor.children = [
      {
        children: [
          {
            children: [{ text: 'nested' }],
            type: 'p',
          },
        ],
        type: 'block',
      },
    ];

    const { annotations } = experimental_parseNode(editor, {
      match: () => true,
      splitPattern: /\b[A-Za-z]+\b/g,
    });

    expect(annotations.map((t) => t.text)).toEqual(['nested']);
    expect(annotations[0].range.anchor.path).toEqual([0, 0, 0]);
  });
});
