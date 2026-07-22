import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';
import {
  deleteBackward as editorDeleteBackward,
  deleteForward as editorDeleteForward,
  getChildren as editorGetChildren,
  getLastCommit as editorGetLastCommit,
  getSnapshot as editorGetSnapshot,
  insertBreak as editorInsertBreak,
  insertText as editorInsertText,
  replace as editorReplace,
  string as editorString,
} from '@platejs/plite/internal';

import { createEditor, type Element, schema } from '@platejs/plite';
import { defineTestSchema } from './support/schema';

const paragraph = (text: string): Element => ({
  type: 'paragraph',
  children: [{ text }],
});

const table = (): Element => ({
  type: 'table',
  children: [
    {
      type: 'table-row',
      children: [
        { type: 'table-cell', children: [{ text: '' }] },
        { type: 'table-cell', children: [{ bold: true, text: 'Human' }] },
        { type: 'table-cell', children: [{ bold: true, text: 'Dog' }] },
        { type: 'table-cell', children: [{ bold: true, text: 'Cat' }] },
      ],
    },
    {
      type: 'table-row',
      children: [
        { type: 'table-cell', children: [{ bold: true, text: '# of Feet' }] },
        { type: 'table-cell', children: [{ text: '2' }] },
        { type: 'table-cell', children: [{ text: '4' }] },
        { type: 'table-cell', children: [{ text: '4' }] },
      ],
    },
    {
      type: 'table-row',
      children: [
        { type: 'table-cell', children: [{ bold: true, text: '# of Lives' }] },
        { type: 'table-cell', children: [{ text: '1' }] },
        { type: 'table-cell', children: [{ text: '1' }] },
        { type: 'table-cell', children: [{ text: '9' }] },
      ],
    },
  ],
});

describe('plite delete contract', () => {
  it('keeps the adjacent text boundary when deleting an inline void', () => {
    for (const reverse of [true, false]) {
      const editor = createEditor();

      editor.extend(
        defineTestSchema(`inline-void-delete-${reverse}`, {
          token: { void: 'inline' },
        })
      );
      editorReplace(editor, {
        children: [
          {
            type: 'paragraph',
            children: [
              { text: 'hi ' },
              { type: 'token', children: [{ text: '' }] },
              { text: ' after' },
            ],
          },
        ],
        selection: {
          kind: 'text',
          anchor: reverse
            ? { path: [0, 2], offset: 0 }
            : { path: [0, 0], offset: 3 },
          focus: reverse
            ? { path: [0, 2], offset: 0 }
            : { path: [0, 0], offset: 3 },
        },
      });

      const before = editorGetSnapshot(editor);
      const leftRuntimeId = before.index.idAt([0, 0]);
      const rightRuntimeId = before.index.idAt([0, 2]);

      assert.ok(leftRuntimeId);
      assert.ok(rightRuntimeId);

      editor.update((tx) => {
        if (reverse) tx.text.deleteBackward();
        else tx.text.deleteForward();
      });

      const snapshot = editorGetSnapshot(editor);

      assert.deepEqual(snapshot.children, [paragraph('hi  after')]);
      assert.equal(snapshot.index.idAt([0, 0]), leftRuntimeId);
      assert.equal(snapshot.index.pathOf(rightRuntimeId), null);
      assert.deepEqual(snapshot.selection, {
        kind: 'text',
        anchor: { path: [0, 0], offset: 3 },
        focus: { path: [0, 0], offset: 3 },
      });
    }
  });

  it('deletes a selected block void on Delete without merging the next block into it', () => {
    const editor = createEditor();

    editor.extend(
      defineTestSchema('block-void-delete-contract', {
        toc: { void: 'block' },
      })
    );

    editorReplace(editor, {
      children: [{ type: 'toc', children: [{ text: '' }] }, paragraph('after')],
      selection: {
        kind: 'text' as const,
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 0 },
      },
    });

    editor.update((tx) => {
      tx.text.deleteForward();
    });

    assert.deepEqual(editorGetSnapshot(editor).children, [paragraph('after')]);
    assert.deepEqual(editorGetSnapshot(editor).selection, {
      kind: 'text',
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    });
  });

  it('profiles whole-block range delete phases for huge-document attribution', () => {
    const wholeBlockSource = readFileSync(
      new URL(
        '../src/transforms-text/delete-text-whole-blocks.ts',
        import.meta.url
      ),
      'utf8'
    );
    assert.match(wholeBlockSource, /delete-whole-range-edge-check/);
    assert.match(wholeBlockSource, /delete-whole-range-block-scan/);
    assert.match(wholeBlockSource, /delete-whole-range-children-slice/);
    assert.match(wholeBlockSource, /delete-whole-range-apply/);
  });

  it('keeps replacement payloads isolated by default', () => {
    const editor = createEditor();
    const inserted = paragraph('inserted');

    editorReplace(editor, {
      children: [paragraph('original')],
      selection: null,
    });

    editor.update((tx) => {
      tx.value.replace({ children: [inserted], selection: null });
    });

    inserted.children[0]!.text = 'mutated';

    assert.deepEqual(editorGetSnapshot(editor).children, [
      paragraph('inserted'),
    ]);
  });

  it('deletes forward over Unicode whitespace before the next word', () => {
    const whitespaceCases = [
      ['space', ' '],
      ['tab', '\t'],
      ['newline', '\n'],
      ['no-break space', '\u00A0'],
      ['en space', '\u2002'],
      ['em space', '\u2003'],
      ['thin space', '\u2009'],
      ['ideographic space', '\u3000'],
    ] as const;

    for (const [label, whitespace] of whitespaceCases) {
      const editor = createEditor();

      editorReplace(editor, {
        children: [paragraph(`Hello${whitespace}World`)],
        selection: {
          kind: 'text' as const,
          anchor: { path: [0, 0], offset: 'Hello'.length },
          focus: { path: [0, 0], offset: 'Hello'.length },
        },
      });

      editorDeleteForward(editor, { unit: 'word' });

      assert.equal(editorString(editor, [0]), 'Hello', label);
      assert.deepEqual(
        editorGetSnapshot(editor).selection,
        {
          kind: 'text',
          anchor: { path: [0, 0], offset: 'Hello'.length },
          focus: { path: [0, 0], offset: 'Hello'.length },
        },
        label
      );
    }
  });

  it('deletes forward by word before a tab without expanding the tab', () => {
    const editor = createEditor();

    editorReplace(editor, {
      children: [paragraph('Foo\tbar')],
      selection: {
        kind: 'text' as const,
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 0 },
      },
    });

    editorDeleteForward(editor, { unit: 'word' });

    assert.equal(editorString(editor, [0]), '\tbar');
    assert.deepEqual(editorGetSnapshot(editor).selection, {
      kind: 'text',
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    });
  });

  it('deletes forward by word over surrogate pairs without leaving halves', () => {
    const cases = ['A 💩 B', 'A 🧑‍💻 B', 'A 𠮎 B'];

    for (const text of cases) {
      const editor = createEditor();

      editorReplace(editor, {
        children: [paragraph(text)],
        selection: {
          kind: 'text' as const,
          anchor: { path: [0, 0], offset: 'A '.length },
          focus: { path: [0, 0], offset: 'A '.length },
        },
      });

      editorDeleteForward(editor, { unit: 'word' });

      assert.equal(editorString(editor, [0]), 'A  B', text);
      assert.deepEqual(
        editorGetSnapshot(editor).selection,
        {
          kind: 'text',
          anchor: { path: [0, 0], offset: 'A '.length },
          focus: { path: [0, 0], offset: 'A '.length },
        },
        text
      );
    }
  });

  it('deletes backward by word at the start of the next word without clearing the line', () => {
    const editor = createEditor();

    editorReplace(editor, {
      children: [paragraph('Hello World')],
      selection: {
        kind: 'text' as const,
        anchor: { path: [0, 0], offset: 'Hello '.length },
        focus: { path: [0, 0], offset: 'Hello '.length },
      },
    });

    editorDeleteBackward(editor, { unit: 'word' });

    assert.equal(editorString(editor, [0]), 'World');
    assert.deepEqual(editorGetSnapshot(editor).selection, {
      kind: 'text',
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    });
  });

  it('keeps the first paragraph when Backspace removes its only character', () => {
    const editor = createEditor();

    editorReplace(editor, {
      children: [paragraph('A'), paragraph('next')],
      selection: {
        kind: 'text' as const,
        anchor: { path: [0, 0], offset: 1 },
        focus: { path: [0, 0], offset: 1 },
      },
    });

    editor.update((tx) => {
      tx.text.deleteBackward();
    });

    assert.deepEqual(editorGetSnapshot(editor).children, [
      paragraph(''),
      paragraph('next'),
    ]);
    assert.deepEqual(editorGetSnapshot(editor).selection, {
      kind: 'text',
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    });
  });

  it('deletes forward across adjacent text leaves with different marks', () => {
    const editor = createEditor();

    editorReplace(editor, {
      children: [
        {
          type: 'paragraph',
          children: [{ code: true, text: '<textarea>' }, { text: '!' }],
        },
      ],
      selection: {
        kind: 'text' as const,
        anchor: { path: [0, 0], offset: '<textarea>'.length },
        focus: { path: [0, 0], offset: '<textarea>'.length },
      },
    });

    editorDeleteForward(editor);

    assert.equal(editorString(editor, [0]), '<textarea>');
    assert.deepEqual(editorGetSnapshot(editor).selection, {
      kind: 'text',
      anchor: { path: [0, 0], offset: '<textarea>'.length },
      focus: { path: [0, 0], offset: '<textarea>'.length },
    });
  });

  it('deletes backward across adjacent text leaves with different marks', () => {
    const editor = createEditor();

    editorReplace(editor, {
      children: [
        {
          type: 'paragraph',
          children: [{ text: '!' }, { code: true, text: '<textarea>' }],
        },
      ],
      selection: {
        kind: 'text' as const,
        anchor: { path: [0, 1], offset: 0 },
        focus: { path: [0, 1], offset: 0 },
      },
    });

    editorDeleteBackward(editor);

    assert.equal(editorString(editor, [0]), '<textarea>');
    assert.deepEqual(editorGetSnapshot(editor).selection, {
      kind: 'text',
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    });
  });

  it('deletes a full selection that starts with an inline element', () => {
    const editor = createEditor();
    editor.extend(
      defineTestSchema('delete-leading-inline', { link: { inline: true } })
    );
    const selection = {
      kind: 'text' as const,
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 2], offset: 'World'.length },
    };

    editorReplace(editor, {
      children: [
        {
          type: 'paragraph',
          children: [
            { text: '' },
            { type: 'link', url: 'https://', children: [{ text: 'Hello' }] },
            { text: 'World' },
          ],
        },
      ],
      selection,
    });

    editor.update((tx) => {
      tx.text.delete({ at: selection });
    });

    assert.deepEqual(editorGetSnapshot(editor).children, [
      {
        type: 'paragraph',
        children: [{ text: '' }],
      },
    ]);
    assert.deepEqual(editorGetSnapshot(editor).selection, {
      kind: 'text',
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    });
  });

  it('deletes an expanded range that starts with an inline element', () => {
    const editor = createEditor();
    editor.extend(
      defineTestSchema('delete-selection-leading-inline', {
        link: { inline: true },
      })
    );
    const selection = {
      kind: 'text' as const,
      anchor: { path: [0, 1, 0], offset: 0 },
      focus: { path: [0, 2], offset: 'World'.length },
    };

    editorReplace(editor, {
      children: [
        {
          type: 'paragraph',
          children: [
            { text: 'Say' },
            { type: 'link', url: 'https://', children: [{ text: 'Hello' }] },
            { text: 'World' },
          ],
        },
      ],
      selection,
    });

    editor.update((tx) => {
      tx.text.delete({ at: selection });
    });

    assert.deepEqual(editorGetSnapshot(editor).children, [
      {
        type: 'paragraph',
        children: [{ text: 'Say' }],
      },
    ]);
    assert.deepEqual(editorGetSnapshot(editor).selection, {
      kind: 'text',
      anchor: { path: [0, 0], offset: 'Say'.length },
      focus: { path: [0, 0], offset: 'Say'.length },
    });
  });

  it('normalizes reversed expanded delete ranges before removing text', () => {
    const editor = createEditor();
    const selection = {
      kind: 'text' as const,
      anchor: { path: [0, 0], offset: 4 },
      focus: { path: [0, 0], offset: 1 },
    };

    editorReplace(editor, {
      children: [paragraph('abcdef')],
      selection,
    });

    editor.update((tx) => {
      tx.text.delete({ at: selection });
    });

    assert.deepEqual(editorGetSnapshot(editor).children, [paragraph('aef')]);
    assert.deepEqual(editorGetSnapshot(editor).selection, {
      kind: 'text',
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 1 },
    });
  });

  it('deletes only the selected formatted leaf window', () => {
    const editor = createEditor();
    const selection = {
      kind: 'text' as const,
      anchor: { path: [0, 0], offset: 'A '.length },
      focus: { path: [0, 3], offset: 0 },
    };

    editor.update((tx) => {
      tx.value.replace({
        children: [
          {
            type: 'paragraph',
            children: [
              { text: 'A paragraph with ' },
              { bold: true, text: 'rich' },
              { text: ' formatting before ' },
              { italic: true, text: 'much' },
              { text: ' more text.' },
            ],
          },
        ],
        selection,
      });
    });

    editor.update((tx) => {
      tx.text.delete({ at: selection });
    });

    assert.deepEqual(editorGetSnapshot(editor).children, [
      {
        type: 'paragraph',
        children: [
          { text: 'A ' },
          { italic: true, text: 'much' },
          { text: ' more text.' },
        ],
      },
    ]);
    assert.deepEqual(editorGetSnapshot(editor).selection, {
      kind: 'text',
      anchor: { path: [0, 0], offset: 'A '.length },
      focus: { path: [0, 0], offset: 'A '.length },
    });
  });

  it('trims both edges of an expanded range across sibling text leaves', () => {
    const editor = createEditor();
    const selection = {
      kind: 'text' as const,
      anchor: { path: [0, 0], offset: 'fi'.length },
      focus: { path: [0, 1], offset: 'sec'.length },
    };

    editor.update((tx) => {
      tx.value.replace({
        children: [
          {
            type: 'paragraph',
            children: [
              { bold: true, text: 'first' },
              { italic: true, text: 'second' },
              { text: 'third' },
            ],
          },
        ],
        selection,
      });
    });

    editor.update((tx) => {
      tx.text.delete({ at: selection });
    });

    assert.deepEqual(editorGetSnapshot(editor).children, [
      {
        type: 'paragraph',
        children: [
          { bold: true, text: 'fi' },
          { italic: true, text: 'ond' },
          { text: 'third' },
        ],
      },
    ]);
    assert.deepEqual(editorGetSnapshot(editor).selection, {
      kind: 'text',
      anchor: { path: [0, 0], offset: 'fi'.length },
      focus: { path: [0, 0], offset: 'fi'.length },
    });
  });

  it('trims cross-block expanded ranges into the anchor block', () => {
    const editor = createEditor();
    const selection = {
      kind: 'text' as const,
      anchor: { path: [0, 0], offset: 'fi'.length },
      focus: { path: [1, 0], offset: 'sec'.length },
    };

    editor.update((tx) => {
      tx.value.replace({
        children: [paragraph('first'), paragraph('second'), paragraph('third')],
        selection,
      });
    });

    editor.update((tx) => {
      tx.text.delete({ at: selection });
    });

    assert.deepEqual(editorGetSnapshot(editor).children, [
      {
        type: 'paragraph',
        children: [{ text: 'fiond' }],
      },
      paragraph('third'),
    ]);
    assert.deepEqual(editorGetSnapshot(editor).selection, {
      kind: 'text',
      anchor: { path: [0, 0], offset: 'fi'.length },
      focus: { path: [0, 0], offset: 'fi'.length },
    });
  });

  it('preserves an unselected suffix inside an isolating nested block', () => {
    const editor = createEditor();
    const selection = {
      kind: 'text' as const,
      anchor: { path: [0, 0], offset: 'Intro visible '.length },
      focus: { path: [2, 0, 0], offset: 'Overview tab'.length },
    };

    editor.extend(
      defineTestSchema('isolating-expanded-range-delete', {
        'accordion-block': {
          content: schema.content.type('paragraph', { min: 1 }),
        },
        'tab-panel': {
          content: schema.content.text({ default: 'text', min: 1 }),
        },
        'tabs-block': {
          content: schema.content.type('tab-panel', { min: 1 }),
          isolating: true,
        },
      })
    );
    editor.update((tx) => {
      tx.value.replace({
        children: [
          paragraph('Intro visible before hidden blocks.'),
          {
            type: 'accordion-block',
            children: [
              paragraph('Accordion secret alpha'),
              paragraph('Accordion secret beta'),
            ],
          },
          {
            type: 'tabs-block',
            children: [
              {
                tab: 'overview',
                type: 'tab-panel',
                children: [{ text: 'Overview tab visible text' }],
              },
              {
                tab: 'details',
                type: 'tab-panel',
                children: [{ text: 'Details tab hidden text' }],
              },
            ],
          },
          paragraph('Outro visible after hidden blocks.'),
        ],
        selection,
      });
    });

    editor.update((tx) => {
      tx.text.delete({ at: selection });
    });

    assert.deepEqual(editorGetSnapshot(editor).children, [
      paragraph('Intro visible '),
      {
        type: 'tabs-block',
        children: [
          {
            tab: 'overview',
            type: 'tab-panel',
            children: [{ text: ' visible text' }],
          },
          {
            tab: 'details',
            type: 'tab-panel',
            children: [{ text: 'Details tab hidden text' }],
          },
        ],
      },
      paragraph('Outro visible after hidden blocks.'),
    ]);
    assert.deepEqual(editorGetSnapshot(editor).selection, {
      kind: 'text',
      anchor: { path: [0, 0], offset: 'Intro visible '.length },
      focus: { path: [0, 0], offset: 'Intro visible '.length },
    });
  });

  it('merges same-mark text when Backspace crosses an empty marked block start', () => {
    const editor = createEditor();

    editor.update((tx) => {
      tx.value.replace({
        children: [
          {
            type: 'paragraph',
            children: [{ bold: true, text: 'first' }],
          },
          {
            type: 'paragraph',
            children: [{ bold: true, text: '' }, { text: ' second' }],
          },
        ],
        selection: {
          kind: 'text' as const,
          anchor: { path: [1, 0], offset: 0 },
          focus: { path: [1, 0], offset: 0 },
        },
      });
    });

    editor.update((tx) => {
      tx.text.deleteBackward();
    });

    assert.deepEqual(editorGetSnapshot(editor).children, [
      {
        type: 'paragraph',
        children: [{ bold: true, text: 'first' }, { text: ' second' }],
      },
    ]);
    assert.deepEqual(editorGetSnapshot(editor).selection, {
      kind: 'text',
      anchor: { path: [0, 0], offset: 'first'.length },
      focus: { path: [0, 0], offset: 'first'.length },
    });
  });

  it('deletes through token-like marked text to a canonical empty block', () => {
    const editor = createEditor();

    editor.update((tx) => {
      tx.value.replace({
        children: [
          {
            type: 'paragraph',
            children: [{ text: 'a' }, { text: '#foo', token: true }],
          },
        ],
        selection: {
          kind: 'text' as const,
          anchor: { path: [0, 1], offset: '#foo'.length },
          focus: { path: [0, 1], offset: '#foo'.length },
        },
      });
    });

    editor.update((tx) => {
      tx.text.deleteBackward();
      tx.text.deleteBackward();
      tx.text.deleteBackward();
      tx.text.deleteBackward();
      tx.text.deleteBackward();
    });

    assert.deepEqual(editorGetSnapshot(editor).children, [
      {
        type: 'paragraph',
        children: [{ text: '' }],
      },
    ]);
    assert.deepEqual(editorGetSnapshot(editor).selection, {
      kind: 'text',
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    });
  });

  it('resets list-heavy content when deleting the full document selection', () => {
    const editor = createEditor();
    const selection = {
      kind: 'text' as const,
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [2, 0], offset: 'after'.length },
    };

    editor.update((tx) => {
      tx.value.replace({
        children: [
          paragraph('before'),
          {
            type: 'bulleted-list',
            children: [
              {
                type: 'list-item',
                children: [
                  {
                    type: 'paragraph',
                    children: [{ text: 'item' }],
                  },
                ],
              },
            ],
          },
          paragraph('after'),
        ],
        selection,
      });
    });

    editor.update((tx) => {
      tx.text.delete({ at: selection });
    });

    assert.deepEqual(editorGetSnapshot(editor).children, [
      {
        type: 'paragraph',
        children: [{ text: '' }],
      },
    ]);
    assert.deepEqual(editorGetSnapshot(editor).selection, {
      kind: 'text',
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    });
  });

  it('merges a following paragraph into the previous list item on Backspace', () => {
    const editor = createEditor();

    editorReplace(editor, {
      children: [
        {
          type: 'bulleted-list',
          children: [
            {
              type: 'list-item',
              children: [{ text: 'list' }],
            },
          ],
        },
        paragraph('paragraph'),
      ],
      selection: {
        kind: 'text' as const,
        anchor: { path: [1, 0], offset: 0 },
        focus: { path: [1, 0], offset: 0 },
      },
    });

    editor.update((tx) => {
      tx.text.deleteBackward();
    });

    assert.deepEqual(editorGetSnapshot(editor).children, [
      {
        type: 'bulleted-list',
        children: [
          {
            type: 'list-item',
            children: [{ text: 'listparagraph' }],
          },
        ],
      },
    ]);
    assert.deepEqual(editorGetSnapshot(editor).selection, {
      kind: 'text',
      anchor: { path: [0, 0, 0], offset: 'list'.length },
      focus: { path: [0, 0, 0], offset: 'list'.length },
    });
  });

  it('preserves following list and block quote wrappers on Delete from an empty paragraph', () => {
    const cases: Array<{
      children: Element[];
      selection: NonNullable<ReturnType<typeof editorGetSnapshot>['selection']>;
    }> = [
      {
        children: [
          {
            type: 'bulleted-list',
            children: [
              {
                type: 'list-item',
                children: [{ text: 'item' }],
              },
            ],
          },
          paragraph('after'),
        ],
        selection: {
          kind: 'text' as const,
          anchor: { path: [0, 0, 0], offset: 0 },
          focus: { path: [0, 0, 0], offset: 0 },
        },
      },
      {
        children: [
          {
            type: 'block-quote',
            children: [{ text: 'quote' }],
          },
          paragraph('after'),
        ],
        selection: {
          kind: 'text' as const,
          anchor: { path: [0, 0], offset: 0 },
          focus: { path: [0, 0], offset: 0 },
        },
      },
    ];

    for (const { children, selection } of cases) {
      const editor = createEditor();

      editorReplace(editor, {
        children: [paragraph(''), ...structuredClone(children)],
        selection: {
          kind: 'text' as const,
          anchor: { path: [0, 0], offset: 0 },
          focus: { path: [0, 0], offset: 0 },
        },
      });

      editor.update((tx) => {
        tx.text.deleteForward();
      });

      assert.deepEqual(editorGetSnapshot(editor).children, children);
      assert.deepEqual(editorGetSnapshot(editor).selection, selection);
    }
  });

  it('deletes a preceding non-selectable atom block on Backspace without throwing', () => {
    const editor = createEditor();
    editor.extend(
      defineTestSchema('non-selectable-atom-delete-contract', {
        'atom-block': { atom: true, selectable: false },
      })
    );

    editorReplace(editor, {
      children: [
        {
          type: 'atom-block',
          children: [{ text: '' }],
        },
        paragraph(''),
      ],
      selection: {
        kind: 'text' as const,
        anchor: { path: [1, 0], offset: 0 },
        focus: { path: [1, 0], offset: 0 },
      },
    });

    editor.update((tx) => {
      tx.text.deleteBackward();
    });

    assert.deepEqual(editorGetSnapshot(editor).children, [paragraph('')]);
    assert.deepEqual(editorGetSnapshot(editor).selection, {
      kind: 'text',
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    });
  });

  it('does not merge across an isolating block boundary on Backspace', () => {
    const editor = createEditor();
    editor.extend(
      defineTestSchema('isolating-delete-boundary', {
        callout: { isolating: true },
      })
    );

    editor.update((tx) => {
      tx.value.replace({
        children: [
          {
            type: 'callout',
            children: [paragraph('inside')],
          },
          paragraph(''),
        ],
        selection: {
          kind: 'text' as const,
          anchor: { path: [1, 0], offset: 0 },
          focus: { path: [1, 0], offset: 0 },
        },
      });
    });

    editor.update((tx) => {
      tx.text.deleteBackward();
    });

    assert.deepEqual(editorGetSnapshot(editor).children, [
      {
        type: 'callout',
        children: [paragraph('inside')],
      },
      paragraph(''),
    ]);
    assert.deepEqual(editorGetSnapshot(editor).selection, {
      kind: 'text',
      anchor: { path: [1, 0], offset: 0 },
      focus: { path: [1, 0], offset: 0 },
    });
  });

  it('deletes a selected top-level block range with bounded changed ranges', () => {
    const editor = createEditor();
    const children = Array.from({ length: 20 }, (_, index) =>
      paragraph(`block-${index}`)
    );
    const selection = {
      kind: 'text' as const,
      anchor: { path: [10, 0], offset: 0 },
      focus: { path: [11, 0], offset: 'block-11'.length },
    };

    editorReplace(editor, {
      children,
      selection,
    });

    editor.update((tx) => {
      tx.text.delete({ at: selection });
    });

    assert.deepEqual(
      editorGetChildren(editor).map((_, index) =>
        editorString(editor, [index])
      ),
      [
        'block-0',
        'block-1',
        'block-2',
        'block-3',
        'block-4',
        'block-5',
        'block-6',
        'block-7',
        'block-8',
        'block-9',
        'block-12',
        'block-13',
        'block-14',
        'block-15',
        'block-16',
        'block-17',
        'block-18',
        'block-19',
      ]
    );
    assert.deepEqual(editorGetSnapshot(editor).selection, {
      kind: 'text',
      anchor: { path: [10, 0], offset: 0 },
      focus: { path: [10, 0], offset: 0 },
    });
    assert.deepEqual(editorGetLastCommit(editor)?.changed.topLevelRanges(), [
      [10, 11],
    ]);
  });

  it('deletes a selected full-document block range as one structural change', () => {
    const editor = createEditor();
    const children = Array.from({ length: 20 }, (_, index) =>
      paragraph(`block-${index}`)
    );
    const selection = {
      kind: 'text' as const,
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [19, 0], offset: 'block-19'.length },
    };

    editorReplace(editor, {
      children,
      selection,
    });

    editor.update((tx) => {
      tx.fragment.delete({ direction: 'backward' });
    });

    assert.deepEqual(editorGetSnapshot(editor).children, [paragraph('')]);
    assert.deepEqual(editorGetSnapshot(editor).selection, {
      kind: 'text',
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    });
    assert.equal(editorGetLastCommit(editor)?.changed.has('structure'), true);
  });

  it('does not use the full-document structural fast path for structured first blocks', () => {
    const editor = createEditor();
    const children = [table(), paragraph('tail')];
    const selection = {
      kind: 'text' as const,
      anchor: { path: [0, 0, 0, 0], offset: 0 },
      focus: { path: [1, 0], offset: 'tail'.length },
    };

    editorReplace(editor, {
      children,
      selection,
    });

    editor.update((tx) => {
      tx.fragment.delete({ direction: 'backward' });
    });

    assert.deepEqual(editorGetSnapshot(editor).children, [
      {
        type: 'table',
        children: [
          {
            type: 'table-row',
            children: [{ type: 'paragraph', children: [{ text: '' }] }],
          },
        ],
      },
    ]);
    assert.equal(editorGetLastCommit(editor)?.changed.has('replace'), false);
  });

  it('keeps table shape intact when Backspace starts after a table', () => {
    const editor = createEditor();

    editorReplace(editor, {
      children: [paragraph('before'), table(), paragraph('')],
      selection: {
        kind: 'text' as const,
        anchor: { path: [2, 0], offset: 0 },
        focus: { path: [2, 0], offset: 0 },
      },
    });

    editor.update((tx) => {
      tx.text.deleteBackward();
    });

    const tableNode = editorGetChildren(editor)[1] as Omit<
      Element,
      'children'
    > & {
      children: { children: Element[] }[];
    };

    assert.equal(tableNode.type, 'table');
    assert.equal(editorGetChildren(editor).length, 2);
    assert.deepEqual(
      tableNode.children.map((row) => row.children.length),
      [4, 4, 4]
    );
    assert.equal(editorString(editor, [1, 0, 0]), '');
    assert.equal(editorString(editor, [1, 0, 1]), 'Human');
    assert.deepEqual(editorGetSnapshot(editor).selection, {
      kind: 'text',
      anchor: { path: [1, 2, 3, 0], offset: 1 },
      focus: { path: [1, 2, 3, 0], offset: 1 },
    });
  });

  it('removes one preceding empty paragraph at a time on Backspace', () => {
    const editor = createEditor();

    editorReplace(editor, {
      children: [paragraph('text')],
      selection: {
        kind: 'text' as const,
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 0 },
      },
    });

    editor.update(() => {
      editorInsertBreak(editor);
      editorInsertBreak(editor);
      editorInsertBreak(editor);
    });

    assert.deepEqual(editorGetSnapshot(editor).children, [
      paragraph(''),
      paragraph(''),
      paragraph(''),
      paragraph('text'),
    ]);

    editor.update((tx) => {
      tx.text.deleteBackward();
    });

    assert.deepEqual(editorGetSnapshot(editor).children, [
      paragraph(''),
      paragraph(''),
      paragraph('text'),
    ]);
    assert.deepEqual(editorGetSnapshot(editor).selection, {
      kind: 'text',
      anchor: { path: [2, 0], offset: 0 },
      focus: { path: [2, 0], offset: 0 },
    });
  });

  it('keeps Backspace at the start of leading empty paragraphs as a no-op', () => {
    const editor = createEditor();

    editorReplace(editor, {
      children: [paragraph(''), paragraph(''), paragraph('text')],
      selection: {
        kind: 'text' as const,
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 0 },
      },
    });

    editor.update((tx) => {
      tx.text.deleteBackward();
    });

    assert.deepEqual(editorGetSnapshot(editor).children, [
      paragraph(''),
      paragraph(''),
      paragraph('text'),
    ]);
    assert.deepEqual(editorGetSnapshot(editor).selection, {
      kind: 'text',
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    });
  });

  it('keeps earlier empty paragraphs when Backspace merges after a space block', () => {
    const editor = createEditor();

    editorReplace(editor, {
      children: [paragraph('text')],
      selection: {
        kind: 'text' as const,
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 0 },
      },
    });

    editor.update(() => {
      editorInsertBreak(editor);
      editorInsertBreak(editor);
      editorInsertBreak(editor);
      editorInsertBreak(editor);
      editorInsertText(editor, ' ');
      editorInsertBreak(editor);
    });

    assert.deepEqual(editorGetSnapshot(editor).children, [
      paragraph(''),
      paragraph(''),
      paragraph(''),
      paragraph(''),
      paragraph(' '),
      paragraph('text'),
    ]);

    editor.update((tx) => {
      tx.text.deleteBackward();
    });

    assert.deepEqual(editorGetSnapshot(editor).children, [
      paragraph(''),
      paragraph(''),
      paragraph(''),
      paragraph(''),
      paragraph(' text'),
    ]);
    assert.deepEqual(editorGetSnapshot(editor).selection, {
      kind: 'text',
      anchor: { path: [4, 0], offset: 1 },
      focus: { path: [4, 0], offset: 1 },
    });
  });

  it('keeps marks from deleted text active after Backspace removes the marked run', () => {
    const editor = createEditor();

    editorReplace(editor, {
      children: [
        {
          type: 'paragraph',
          children: [{ bold: true, text: 'foo' }],
        },
      ],
      selection: {
        kind: 'text' as const,
        anchor: { path: [0, 0], offset: 'foo'.length },
        focus: { path: [0, 0], offset: 'foo'.length },
      },
    });

    editor.update((tx) => {
      tx.text.deleteBackward();
      tx.text.deleteBackward();
      tx.text.deleteBackward();
      tx.text.insert('bar');
    });

    assert.deepEqual(editorGetSnapshot(editor).children, [
      {
        type: 'paragraph',
        children: [{ bold: true, text: 'bar' }],
      },
    ]);
    assert.deepEqual(editorGetSnapshot(editor).selection, {
      kind: 'text',
      anchor: { path: [0, 0], offset: 'bar'.length },
      focus: { path: [0, 0], offset: 'bar'.length },
    });
  });

  it('keeps consistently selected marks active after deleting a marked range', () => {
    const editor = createEditor();

    editorReplace(editor, {
      children: [
        {
          type: 'paragraph',
          children: [{ bold: true, text: 'Styled' }],
        },
      ],
      selection: {
        kind: 'text' as const,
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 'Styled'.length },
      },
    });

    editor.update((tx) => {
      tx.fragment.delete({ direction: 'backward' });
      tx.text.insert('Next');
    });

    assert.deepEqual(editorGetSnapshot(editor).children, [
      {
        type: 'paragraph',
        children: [{ bold: true, text: 'Next' }],
      },
    ]);
    assert.deepEqual(editorGetSnapshot(editor).selection, {
      kind: 'text',
      anchor: { path: [0, 0], offset: 'Next'.length },
      focus: { path: [0, 0], offset: 'Next'.length },
    });
  });

  it('removes an empty editable inline on Backspace without deleting preceding text', () => {
    const editor = createEditor();
    editor.extend(
      defineTestSchema('inline-delete-boundary', {
        button: { inline: true },
      })
    );

    editorReplace(editor, {
      children: [
        {
          type: 'paragraph',
          children: [
            { text: 'an ' },
            { type: 'button', children: [{ text: '' }] },
            { text: '!' },
          ],
        },
      ],
      selection: {
        kind: 'text' as const,
        anchor: { path: [0, 1, 0], offset: 0 },
        focus: { path: [0, 1, 0], offset: 0 },
      },
    });

    editor.update((tx) => {
      tx.text.deleteBackward();
    });

    assert.deepEqual(editorGetSnapshot(editor).children, [
      {
        type: 'paragraph',
        children: [{ text: 'an !' }],
      },
    ]);
    assert.deepEqual(editorGetSnapshot(editor).selection, {
      kind: 'text',
      anchor: { path: [0, 0], offset: 'an '.length },
      focus: { path: [0, 0], offset: 'an '.length },
    });
  });

  it('clears inherited mark after deleting backward at offset one in marked text', () => {
    const editor = createEditor();

    editorReplace(editor, {
      children: [
        {
          type: 'paragraph',
          children: [{ bold: true, text: 'abc' }],
        },
      ],
      selection: {
        kind: 'text' as const,
        anchor: { path: [0, 0], offset: 1 },
        focus: { path: [0, 0], offset: 1 },
      },
    });

    editor.update((tx) => {
      tx.text.deleteBackward();
      tx.text.insert('a');
    });

    assert.deepEqual(editorGetSnapshot(editor).children, [
      {
        type: 'paragraph',
        children: [{ text: 'a' }, { bold: true, text: 'bc' }],
      },
    ]);
  });

  it('clears inherited mark after deleting forward at marked block start', () => {
    const editor = createEditor();

    editorReplace(editor, {
      children: [
        {
          type: 'paragraph',
          children: [{ bold: true, text: 'abc' }],
        },
      ],
      selection: {
        kind: 'text' as const,
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 0 },
      },
    });

    editor.update((tx) => {
      tx.text.deleteForward();
      tx.text.insert('a');
    });

    assert.deepEqual(editorGetSnapshot(editor).children, [
      {
        type: 'paragraph',
        children: [{ text: 'a' }, { bold: true, text: 'bc' }],
      },
    ]);
  });

  it('clears inherited mark after deleting a marked fragment at block start', () => {
    const editor = createEditor();

    editorReplace(editor, {
      children: [
        {
          type: 'paragraph',
          children: [{ bold: true, text: 'bc' }],
        },
      ],
      selection: {
        kind: 'text' as const,
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 1 },
      },
    });

    editor.update((tx) => {
      tx.fragment.delete();
      tx.text.insert('b');
    });

    assert.deepEqual(editorGetSnapshot(editor).children, [
      {
        type: 'paragraph',
        children: [{ text: 'b' }, { bold: true, text: 'c' }],
      },
    ]);
  });
});
