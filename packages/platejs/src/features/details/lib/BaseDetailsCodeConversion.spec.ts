import {
  BaseParagraphPlugin,
  createEditor,
  createEditorView,
  SelectionApi,
} from '../../../core';
import { BaseCodeBlockPlugin } from '../../code-block/lib/BaseCodeBlockPlugin';
import { BaseIndentPlugin } from '../../indent';
import {
  added,
  convertAfterWrite,
  holder,
  noteEditor,
  section,
} from '../__tests__/detailsConversionFixture';
import { BaseDetailsPlugin } from './BaseDetailsPlugin';

describe('Code from a Details title', () => {
  it('leaves a Code conversion unwritten when the parent refuses code', () => {
    const editor = createEditor({
      plugins: [
        BaseDetailsPlugin,
        BaseCodeBlockPlugin,
        holder('proseHolder', {}),
      ],
      initialValue: [{ type: 'proseHolder', children: [section('A')] }],
    });
    const before = editor.read.children();

    expect(
      convertAfterWrite(editor, (tx) => {
        tx.selection.set({ offset: 1, path: [0, 0, 0, 0] });

        return tx.plugin(BaseCodeBlockPlugin).toggle();
      })
    ).toBe(false);
    expect(editor.read.children()).toEqual([...before, added]);
  });

  it('refuses a selection that holds the title and its body', () => {
    const editor = createEditor({
      plugins: [BaseDetailsPlugin, BaseCodeBlockPlugin],
      initialValue: [section('Title')],
    });
    const before = editor.read.children();

    editor.update.selection.set({
      anchor: { offset: 0, path: [0, 0, 0] },
      focus: { offset: 4, path: [0, 1, 0] },
    });

    expect(editor.plugin(BaseCodeBlockPlugin).update.toggle()).toBe(false);
    expect(editor.read.children()).toEqual(before);
  });

  it('refuses a selection that holds the title and a code block', () => {
    const editor = createEditor({
      plugins: [BaseDetailsPlugin, BaseCodeBlockPlugin],
      initialValue: [
        section('Title', [{ type: 'codeBlock', children: [{ text: 'Body' }] }]),
      ],
    });
    const before = editor.read.children();

    editor.update.selection.set({
      anchor: { offset: 0, path: [0, 0, 0] },
      focus: { offset: 2, path: [0, 1, 0] },
    });

    expect(editor.plugin(BaseCodeBlockPlugin).update.toggle()).toBe(false);
    expect(editor.read.children()).toEqual(before);
  });

  it('codes two selected blocks and leaves a Details between them whole', () => {
    const editor = createEditor({
      plugins: [BaseDetailsPlugin, BaseCodeBlockPlugin],
      initialValue: [
        { type: 'paragraph', children: [{ text: 'A' }] },
        section('Untouched'),
        { type: 'paragraph', children: [{ text: 'B' }] },
      ],
    });
    const details = editor.read.children()[1];

    editor.update.selection.set(
      SelectionApi.nodes([[0], [2]], { mode: 'block' })
    );

    expect(editor.plugin(BaseCodeBlockPlugin).update.toggle()).toBe(true);
    expect(editor.read.children()).toEqual([
      { type: 'codeBlock', children: [{ text: 'A' }] },
      details,
      { type: 'codeBlock', children: [{ text: 'B' }] },
    ]);
  });

  it('converts a title in a named document through its view', () => {
    const editor = noteEditor();
    const main = editor.read.children();
    const view = createEditorView(editor, { root: 'note' });

    view.update.selection.set({ offset: 0, path: [0, 0, 0], root: 'note' });
    view.plugin(BaseCodeBlockPlugin).update.toggle();

    expect({
      main: editor.read.children(),
      note: editor.read.root('note'),
    }).toEqual({
      main,
      note: [
        { type: 'codeBlock', children: [{ text: 'Title' }] },
        { type: 'paragraph', children: [{ text: 'Body' }] },
      ],
    });
  });

  it('refuses a named document selection outside its view', () => {
    const editor = noteEditor();
    const before = editor.read.value();

    editor.update.selection.set({ offset: 0, path: [0, 0, 0], root: 'note' });

    expect(editor.plugin(BaseCodeBlockPlugin).update.toggle()).toBe(false);
    expect(editor.read.value()).toEqual(before);
  });

  it('drops the indent of an indented section, as unwrap does', () => {
    const editor = createEditor({
      plugins: [
        BaseDetailsPlugin,
        BaseCodeBlockPlugin,
        BaseIndentPlugin.configure({
          targetPlugins: [BaseParagraphPlugin, BaseDetailsPlugin],
        }),
      ],
      initialValue: [section('Title', undefined, { indent: 1 })],
    });

    editor.update.selection.set({ offset: 2, path: [0, 0, 0] });

    expect(editor.plugin(BaseCodeBlockPlugin).update.toggle()).toBe(true);
    expect(editor.read.children()).toEqual([
      { type: 'codeBlock', children: [{ text: 'Title' }] },
      { type: 'paragraph', children: [{ text: 'Title body' }] },
    ]);
  });
});
