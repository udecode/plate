import { describe, expect, it } from 'bun:test';

import { createEditor } from 'platejs';

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
    expect(editor.plugin('mentionInput').render.node).toBe(MentionInputElement);
    expect(editor.plugin('slashInput').render.node).toBe(SlashInputElement);
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
