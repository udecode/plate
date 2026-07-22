import { createBaseEditor } from '@platejs/core';
import type { Point } from '@platejs/plite';

import { BaseLinkPlugin } from './BaseLinkPlugin';

const value = [
  {
    children: [
      { text: 'x' },
      {
        children: [{ text: 'abcdef' }],
        type: 'a',
        url: 'https://example.com',
      },
      { text: 'y' },
    ],
    type: 'p',
  },
];

const createEditor = (anchor: Point, focus: Point) =>
  createBaseEditor({
    plugins: [BaseLinkPlugin],
    selection: { kind: 'text', anchor, focus },
    initialValue: value,
  });

const splitCases: {
  anchor: Point;
  focus: Point;
  linked: string;
  plain: string;
}[] = [
  {
    anchor: { offset: 1, path: [0, 0] },
    focus: { offset: 4, path: [0, 1, 0] },
    linked: 'abcd',
    plain: 'efy',
  },
  {
    anchor: { offset: 1, path: [0, 0] },
    focus: { offset: 2, path: [0, 1, 0] },
    linked: 'ab',
    plain: 'cdefy',
  },
  {
    anchor: { offset: 4, path: [0, 1, 0] },
    focus: { offset: 1, path: [0, 2] },
    linked: 'abcd',
    plain: 'efy',
  },
];

describe('editor.update.link.unwrap', () => {
  it('unwraps an entire link when split mode is off', () => {
    const editor = createEditor(
      { offset: 0, path: [0, 1, 0] },
      { offset: 6, path: [0, 1, 0] }
    );

    editor.update.link.unwrap();

    expect(editor.read.children()).toEqual([
      { children: [{ text: 'xabcdefy' }], type: 'p' },
    ]);
  });

  it.each(
    splitCases
  )('preserves the linked fragment in split mode', (fixture) => {
    const editor = createEditor(fixture.anchor, fixture.focus);

    editor.update.link.unwrap({ split: true });

    expect(editor.read.children()).toEqual([
      {
        children: [
          { text: 'x' },
          {
            children: [{ text: fixture.linked }],
            type: 'a',
            url: 'https://example.com',
          },
          { text: fixture.plain },
        ],
        type: 'p',
      },
    ]);
  });

  it('unwraps only the selected middle fragment in split mode', () => {
    const editor = createEditor(
      { offset: 2, path: [0, 1, 0] },
      { offset: 4, path: [0, 1, 0] }
    );

    editor.update.link.unwrap({ split: true });

    expect(editor.read.children()).toEqual([
      {
        children: [
          { text: 'x' },
          {
            children: [{ text: 'ab' }],
            type: 'a',
            url: 'https://example.com',
          },
          { text: 'cd' },
          {
            children: [{ text: 'ef' }],
            type: 'a',
            url: 'https://example.com',
          },
          { text: 'y' },
        ],
        type: 'p',
      },
    ]);
  });
});
