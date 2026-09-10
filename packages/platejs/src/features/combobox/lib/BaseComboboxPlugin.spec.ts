import {
  createEditor,
  defineBasePlugin,
  schema,
  type Point,
} from '../../../core';
import { BaseEmojiPlugin } from '../../../emoji/lib/BaseEmojiPlugin';
import {
  BaseFootnoteDefinitionPlugin,
  BaseFootnotePlugin,
} from '../../footnote/lib/BaseFootnotePlugin';
import { BaseMentionPlugin } from '../../mention/lib/BaseMentionPlugin';
import { BaseComboboxPlugin } from './BaseComboboxPlugin';

const setup = () => {
  const editor = createEditor({
    plugins: [BaseMentionPlugin],
    initialValue: [
      { type: 'paragraph', children: [{ text: 'Other paragraph' }] },
      { type: 'paragraph', children: [{ text: 'Before ' }] },
    ],
    selection: {
      kind: 'text',
      anchor: { path: [1, 0], offset: 7 },
      focus: { path: [1, 0], offset: 7 },
    },
  });
  editor.update.text.insert('@');
  const input = editor.key(editor.read.children()[1].children[1]);

  return { editor, input, combobox: editor.plugin(BaseComboboxPlugin) };
};

describe('combobox input completion', () => {
  it('replaces an emoji input with native text in one undoable publication', () => {
    const editor = createEditor({
      plugins: [BaseEmojiPlugin],
      initialValue: [{ type: 'paragraph', children: [{ text: 'Before ' }] }],
      selection: {
        kind: 'text',
        anchor: { path: [0, 0], offset: 7 },
        focus: { path: [0, 0], offset: 7 },
      },
    });
    editor.update.text.insert(':');
    const input = editor.key(editor.read.children()[0].children[1]);
    const before = editor.read.value();
    const { version } = editor.read.lastCommit()!;

    expect(
      editor.plugin(BaseComboboxPlugin).api.commit(input, (tx) => {
        tx.plugin(BaseEmojiPlugin).insert({
          id: 'fire',
          keywords: ['flame'],
          name: 'Fire',
          skins: [{ native: '🔥', unified: '1f525' }],
          version: 1,
        });
      })
    ).toBe(true);
    expect(editor.read.text.string([0])).toBe('Before 🔥');
    expect(editor.read.lastCommit()!.version - version).toBe(1);
    editor.update.history.undo();
    expect(editor.read.value()).toEqual(before);
  });

  it('removes the footnote prefix and inserts a reference and definition together', () => {
    const editor = createEditor({
      plugins: [BaseFootnotePlugin, BaseFootnoteDefinitionPlugin],
      initialValue: [{ type: 'paragraph', children: [{ text: 'Before [' }] }],
      selection: {
        kind: 'text',
        anchor: { path: [0, 0], offset: 8 },
        focus: { path: [0, 0], offset: 8 },
      },
    });
    editor.update.text.insert('^');
    const input = editor.key(editor.read.children()[0].children[1]);
    const before = editor.read.value();
    const { version } = editor.read.lastCommit()!;

    expect(
      editor.plugin(BaseComboboxPlugin).api.commit(input, (tx) => {
        tx.plugin(BaseFootnotePlugin).insert({
          ref: 'proof',
          trigger: '[',
          focusDefinition: false,
        });
      })
    ).toBe(true);
    expect(editor.read.text.string([0])).toBe('Before ');
    expect(editor.read.children()[0].children[1]).toMatchObject({
      type: 'footnoteReference',
      ref: 'proof',
    });
    expect(editor.read.children()[1]).toMatchObject({
      type: 'footnoteDefinition',
      ref: 'proof',
    });
    expect(editor.read.lastCommit()!.version - version).toBe(1);
    editor.update.history.undo();
    expect(editor.read.value()).toEqual(before);
  });

  it('restores literal query text in one publication and history entry', () => {
    const { editor, input, combobox } = setup();
    const before = editor.read.children();
    const { version } = editor.read.lastCommit()!;
    const undos = editor.read.history.undos().length;

    expect(combobox.api.cancel(input, { text: '@query' })).toBe(true);
    expect(editor.read.text.string([1])).toBe('Before @query');
    expect(editor.read.lastCommit()!.version - version).toBe(1);
    expect(editor.read.history.undos()).toHaveLength(undos + 1);

    const after = editor.read.children();
    editor.update.history.undo();
    expect(editor.read.children()).toEqual(before);
    editor.update.history.redo();
    expect(editor.read.children()).toEqual(after);
  });

  it('inserts the chosen feature at the live input in the same transaction', () => {
    const { editor, input, combobox } = setup();
    editor.update.nodes.insert(
      { type: 'paragraph', children: [{ text: 'Leading' }] },
      { at: [0] }
    );
    const before = editor.read.children();
    const { version } = editor.read.lastCommit()!;

    expect(
      combobox.api.commit(input, (tx) => {
        tx.plugin(BaseMentionPlugin).insert({ ref: 'alice', label: 'Alice' });
      })
    ).toBe(true);
    expect(editor.read.children()[2].children[1]).toMatchObject({
      type: 'mention',
      ref: 'alice',
      label: 'Alice',
    });
    expect(editor.read.lastCommit()!.version - version).toBe(1);
    editor.update.history.undo();
    expect(editor.read.children()).toEqual(before);
  });

  it('treats a second completion as a no-op without a mounted-view flag', () => {
    const { editor, input, combobox } = setup();
    expect(combobox.api.cancel(input)).toBe(true);
    const { version } = editor.read.lastCommit()!;
    expect(combobox.api.cancel(input, { text: '@duplicate' })).toBe(false);
    expect(
      combobox.api.commit(input, () => {
        throw new Error('stale');
      })
    ).toBe(false);
    expect(editor.read.lastCommit()!.version).toBe(version);
    expect(editor.read.text.string([1])).toBe('Before ');
  });

  it('does not write into the current selection after the source is deleted', () => {
    const { editor, input, combobox } = setup();
    editor.update.nodes.remove({ at: [1] });
    editor.update.selection.set({ path: [0, 0], offset: 0 });
    const before = editor.read.children();
    expect(combobox.api.cancel(input, { text: '@query' })).toBe(false);
    expect(editor.read.children()).toEqual(before);
  });

  it('reads current collaboration ownership for every command', () => {
    const { editor, input, combobox } = setup();
    editor.update.nodes.set({ userId: 'owner' }, { at: input });
    editor.runtime.userId = 'other';
    const before = editor.read.children();
    expect(combobox.read.canEdit(input)).toBe(false);
    expect(combobox.api.cancel(input, { text: '@query' })).toBe(false);
    expect(
      combobox.api.commit(input, () => {
        throw new Error('foreign');
      })
    ).toBe(false);
    expect(combobox.api.undo(input)).toBe(false);
    expect(combobox.api.redo(input)).toBe(false);
    expect(editor.read.children()).toEqual(before);
    editor.runtime.userId = 'owner';
    expect(combobox.read.canEdit(input)).toBe(true);
    expect(combobox.api.cancel(input)).toBe(true);
  });

  it('rejects a node from another editor and ordinary text blocks', () => {
    const { editor, combobox } = setup();
    const other = setup();
    const before = editor.read.children();
    expect(combobox.api.cancel(other.input, { text: '@query' })).toBe(false);
    expect(combobox.api.cancel(editor.key(editor.read.children()[0]))).toBe(
      false
    );
    expect(editor.read.children()).toEqual(before);
  });

  it('leaves inputs in a read-only editor untouched', () => {
    const source = setup();
    const editor = createEditor({
      plugins: [BaseMentionPlugin],
      readOnly: true,
      initialValue: source.editor.read.value(),
    });
    const input = editor.key(editor.read.children()[1].children[1]);
    const before = editor.read.value();
    expect(editor.plugin(BaseComboboxPlugin).read.canEdit(input)).toBe(false);
    expect(
      editor.plugin(BaseComboboxPlugin).api.cancel(input, { text: '@query' })
    ).toBe(false);
    expect(editor.read.value()).toEqual(before);
  });

  it('preserves an outside selection when canceling after deselection', () => {
    const { editor, input, combobox } = setup();
    const point: Point = { path: [0, 0], offset: 3 };
    editor.update.selection.set(point);
    combobox.api.cancel(input, { text: '@query' });
    expect(editor.read.selection()).toEqual({ anchor: point, focus: point });
  });

  it.each(['start', 'end'] as const)(
    'places a boundary exit at the %s of restored text',
    (select) => {
      const { editor, input, combobox } = setup();
      combobox.api.cancel(input, { text: '@query', select });
      const point = { path: [1, 0], offset: select === 'start' ? 7 : 13 };
      expect(editor.read.selection()).toEqual({ anchor: point, focus: point });
    }
  );

  it('rolls back input removal when the chosen feature rejects insertion', () => {
    const { editor, input, combobox } = setup();
    const before = editor.read.children();
    const { version } = editor.read.lastCommit()!;
    expect(() =>
      combobox.api.commit(input, (tx) => {
        tx.plugin(BaseMentionPlugin).insert({ ref: '' });
      })
    ).toThrow('Mention ref must be a non-empty string.');
    expect(editor.read.children()).toEqual(before);
    expect(editor.read.lastCommit()!.version).toBe(version);
  });

  it('supports undo from the input and a fresh renderer after history restores it', () => {
    const { editor, input, combobox } = setup();
    expect(combobox.api.undo(input)).toBe(true);
    expect(combobox.api.cancel(input, { text: '@stale' })).toBe(false);
    editor.update.history.redo();
    const restored = editor.key(editor.read.children()[1].children[1]);
    expect(
      editor.plugin(BaseComboboxPlugin).api.cancel(restored, { text: '@fresh' })
    ).toBe(true);
    expect(editor.read.text.string([1])).toBe('Before @fresh');
  });

  it('restores a named-root input inside its original root', () => {
    const FigurePlugin = defineBasePlugin('comboboxFigure', {
      schema: {
        element: {
          contentRoots: {
            caption: {
              content: schema.content.type('paragraph', {
                default: { type: 'paragraph' },
                min: 1,
              }),
              ownership: 'exclusive',
            },
          },
          void: 'block',
        },
      },
    });
    const editor = createEditor({
      plugins: [BaseMentionPlugin, FigurePlugin],
      initialValue: {
        children: [
          { type: 'paragraph', children: [{ text: 'Body' }] },
          {
            type: 'comboboxFigure',
            childRoots: { caption: 'caption:1' },
            children: [{ text: '' }],
          },
        ],
        roots: {
          'caption:1': [
            {
              type: 'paragraph',
              children: [
                { text: 'Before ' },
                {
                  type: 'mentionInput',
                  trigger: '@',
                  children: [{ text: '' }],
                },
                { text: '' },
              ],
            },
          ],
        },
      },
    });
    const input = editor.key(editor.read.root('caption:1')[0].children[1]);
    const before = editor.read.value();
    expect(
      editor
        .plugin(BaseComboboxPlugin)
        .api.cancel(input, { text: '@query', select: 'end' })
    ).toBe(true);
    expect(editor.read.root('caption:1')[0].children).toEqual([
      { text: 'Before @query' },
    ]);
    expect(editor.read.children()).toEqual(before.children);
    expect(editor.read.selection()?.anchor).toEqual({
      root: 'caption:1',
      path: [0, 0],
      offset: 13,
    });
    editor.update.history.undo();
    expect(editor.read.value()).toEqual(before);
  });
});
