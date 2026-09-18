import { describe, expect, it } from 'bun:test';

import { MentionInputPlugin } from 'platejs/mention/react';
import { createEditor } from 'platejs/react';
import { SlashInputPlugin } from 'platejs/slash-command/react';
import { TablePlugin } from 'platejs/table/react';

import { EmojiKit } from './emoji';
import { FootnoteKit } from './footnote';
import { MentionInputElement, MentionKit } from './mention';
import { SlashInputElement, SlashKit } from './slash';

const ComboboxKit = [...MentionKit, ...FootnoteKit, ...SlashKit, ...EmojiKit];

describe('EditorKit combobox triggers', () => {
  it('replaces the mention trigger with a transient input', () => {
    const editor = createEditor({
      plugins: ComboboxKit,
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
      },
      initialValue: [{ children: [{ text: '' }], type: 'paragraph' }],
    });
    const commits: Array<
      Parameters<Parameters<typeof editor.subscribeCommit>[0]>[0]
    > = [];
    const unsubscribe = editor.subscribeCommit((commit) => {
      commits.push(commit);
    });

    editor.update.text.insert('@', {
      at: editor.read.selection() ?? undefined,
    });

    unsubscribe();

    expect(editor.read.children()).toMatchObject([
      {
        children: [
          { text: '' },
          {
            children: [{ text: '' }],
            trigger: '@',
            type: 'mentionInput',
          },
          { text: '' },
        ],
        type: 'paragraph',
      },
    ]);
    expect(editor.plugin(MentionInputPlugin).component).toBe(
      MentionInputElement
    );
    expect(editor.plugin(SlashInputPlugin).component).toBe(SlashInputElement);
    expect(commits).toHaveLength(1);
    expect(commits[0]?.changed.hasAny('structure')).toBe(true);
  });

  it('keeps mention commands in the assembled editor kit', async () => {
    Object.defineProperty(window.location, 'origin', {
      configurable: true,
      value: 'http://localhost:3000',
    });
    const { EditorKit } = await import('./plugins');
    const editor = createEditor({
      plugins: EditorKit,
      userId: 'alice',
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
      },
      initialValue: [{ children: [{ text: '' }], type: 'paragraph' }],
    });

    editor.update.text.insert('@', {
      at: editor.read.selection() ?? undefined,
    });

    expect(editor.read.children()[0]?.children).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ type: 'mentionInput' }),
      ])
    );
  });
});

describe('EditorKit table policy', () => {
  it('supplies a usable default width for imported tables', async () => {
    const { EditorKit } = await import('./plugins');
    const editor = createEditor({
      plugins: EditorKit,
      initialValue: [
        {
          children: [
            {
              children: [
                {
                  children: [{ children: [{ text: 'A' }], type: 'paragraph' }],
                  type: 'tableCell',
                },
                {
                  children: [{ children: [{ text: 'B' }], type: 'paragraph' }],
                  type: 'tableCell',
                },
              ],
              type: 'tableRow',
            },
          ],
          type: 'table',
        },
      ],
    });
    const table = editor.read.children()[0];

    expect(editor.plugin(TablePlugin).api.columnWidths(table)).toEqual([
      300, 300,
    ]);
  });
});
