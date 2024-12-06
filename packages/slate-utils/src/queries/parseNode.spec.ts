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
    const { decorations, tokens } = experimental_parseNode(editor, {
      at: [0],
      match: () => true,
      splitPattern: /\b[A-Za-z]+\b/g,
    });

    expect(tokens).toHaveLength(6); // hello, world, this, is, a, test
    expect(decorations).toHaveLength(6);

    // Check token positions
    expect(tokens[0].text).toBe('hello');
    expect(tokens[0].range.anchor.offset).toBe(0);
    expect(tokens[0].range.focus.offset).toBe(5);

    expect(tokens[1].text).toBe('world');
    expect(tokens[1].range.anchor.offset).toBe(6);
    expect(tokens[1].range.focus.offset).toBe(11);
  });

  it('should respect minLength and maxLength', () => {
    const { tokens } = experimental_parseNode(editor, {
      at: [0],
      match: () => true,
      maxLength: 5,
      minLength: 4,
      splitPattern: /\b[A-Za-z]+\b/g,
    });

    // Words with length 4-5: 'hello', 'world', 'this', 'test'
    expect(tokens).toHaveLength(4);
    expect(tokens.map((t) => t.text)).toEqual([
      'hello',
      'world',
      'this',
      'test',
    ]);
  });

  it('should apply match function correctly', () => {
    const { tokens } = experimental_parseNode(editor, {
      at: [0],
      match: ({ text }) => text.length > 4, // Only match words longer than 4 chars
      splitPattern: /\b[A-Za-z]+\b/g,
    });

    // Only words longer than 4 chars: 'hello', 'world'
    expect(tokens).toHaveLength(2);
    expect(tokens.map((t) => t.text)).toEqual(['hello', 'world']);
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
    const { tokens } = experimental_parseNode(editor, {
      at: [0],
      match: () => true,
      splitPattern: /\b[A-Za-z]+\b/g,
      transform: (token) => ({
        ...token,
        data: { transformed: true },
      }),
    });

    tokens.forEach((token) => {
      expect(token.data).toEqual({ transformed: true });
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

    const { tokens } = experimental_parseNode(editor, {
      match: () => true,
      splitPattern: /\b[A-Za-z]+\b/g,
    });

    expect(tokens).toHaveLength(4); // hello, world, another, block
    expect(tokens.map((t) => t.text)).toEqual([
      'hello',
      'world',
      'another',
      'block',
    ]);

    // Check paths are correct - now they should be nested under root []
    expect(tokens[0].range.anchor.path).toEqual([0, 0]);
    expect(tokens[2].range.anchor.path).toEqual([1, 0]);
  });

  it('should handle empty editor with at=[]', () => {
    editor.children = [];

    const { decorations, tokens } = experimental_parseNode(editor, {
      match: () => true,
      splitPattern: /\b[A-Za-z]+\b/g,
    });

    expect(tokens).toHaveLength(0);
    expect(decorations).toHaveLength(0);
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

    const { tokens } = experimental_parseNode(editor, {
      match: () => true,
      splitPattern: /\b[A-Za-z]+\b/g,
    });

    expect(tokens.map((t) => t.text)).toEqual(['hello', 'world']);
    expect(tokens[0].range.anchor.path).toEqual([0, 0]);
    expect(tokens[1].range.anchor.path).toEqual([1, 0]);
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

    const { tokens } = experimental_parseNode(editor, {
      match: () => true,
      splitPattern: /\b[A-Za-z]+\b/g,
    });

    expect(tokens.map((t) => t.text)).toEqual(['nested']);
    expect(tokens[0].range.anchor.path).toEqual([0, 0, 0]);
  });
});
