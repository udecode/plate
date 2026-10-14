import { join } from 'node:path';

import * as element from '../src/interfaces/element';
import * as text from '../src/interfaces/text';

const realElement = { ...element };
const realText = { ...text };
let typeChecks = 0;

mock.module(join(import.meta.dir, '../src/interfaces/element.ts'), () => ({
  ...realElement,
  ElementApi: Object.freeze({
    ...realElement.ElementApi,
    isElement: (...args: Parameters<typeof element.ElementApi.isElement>) => {
      typeChecks += 1;

      return realElement.ElementApi.isElement(...args);
    },
  }),
}));
mock.module(join(import.meta.dir, '../src/interfaces/text.ts'), () => ({
  ...realText,
  TextApi: Object.freeze({
    ...realText.TextApi,
    isText: (value: unknown) => {
      typeChecks += 1;

      return realText.TextApi.isText(value);
    },
  }),
}));

const { createEditor, editorCommands } = await import('plitejs');

const words = Array.from({ length: 30 }, (_, k) => `word${k}`).join(' ');

// Every walk over the document asks whether each node it visits is an
// element or a text, so this count grows with how much of the document a key
// walks.
const typeChecksPerKey = (
  blocks: number,
  caret: (middle: number) => { offset: number; path: number[] },
  key: (editor: ReturnType<typeof createEditor>) => void
) => {
  const editor = createEditor({
    initialValue: Array.from({ length: blocks }, (_, i) => ({
      children: [{ text: `line${i} ${words}` }],
      type: 'paragraph',
    })),
  });
  const at = caret(blocks / 2);

  editor.update((tx) => tx.selection.set({ anchor: at, focus: at }));

  return [0, 1].map(() => {
    const before = typeChecks;
    const children = editor.read.children();

    key(editor);
    expect(editor.read.children()).not.toBe(children);

    return typeChecks - before;
  });
};

const midLine = (middle: number) => ({
  offset: `line${middle} ${words}`.indexOf(' word20'),
  path: [middle, 0],
});

describe('structural key work per key', () => {
  it('reads as much of the document for Enter at 2,000 blocks as at 100', () => {
    const [small, large] = [100, 2000].map((blocks) =>
      typeChecksPerKey(blocks, midLine, (editor) =>
        editor.update((tx) => tx.command(editorCommands.insertBreak))
      )
    );

    expect(small[0]).toBeGreaterThan(0);
    expect(large).toEqual(small);
  });

  it('reads as much of the document for a word delete at 2,000 blocks as at 100', () => {
    const [small, large] = [100, 2000].map((blocks) =>
      typeChecksPerKey(blocks, midLine, (editor) =>
        editor.update((tx) =>
          tx.command(editorCommands.delete, {
            direction: 'backward',
            unit: 'word',
          })
        )
      )
    );

    expect(small[0]).toBeGreaterThan(0);
    expect(large).toEqual(small);
  });

  it('reads as much of the document for a Backspace that joins two lines at 2,000 blocks as at 100', () => {
    const [small, large] = [100, 2000].map((blocks) => {
      const lineStart = { offset: 0, path: [blocks / 2, 0] };

      return typeChecksPerKey(
        blocks,
        () => lineStart,
        (editor) =>
          editor.update((tx) => {
            tx.selection.set({ anchor: lineStart, focus: lineStart });
            tx.command(editorCommands.delete, {
              direction: 'backward',
              unit: 'character',
            });
          })
      );
    });

    expect(small[0]).toBeGreaterThan(0);
    expect(large).toEqual(small);
  });
});
