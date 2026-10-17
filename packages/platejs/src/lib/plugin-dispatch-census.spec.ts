import {
  createEditor,
  createEditorView,
  definePlugin,
  BaseParagraphPlugin,
  schema,
  locateAt,
  type NodeTarget,
  txLocate,
} from 'platejs';
import { AuthoredPlugin } from 'platejs/authored';

import { BaseEditorKit } from '../../../../apps/www/src/registry/components/editor/plugins-static';
import {
  censusRuntimeEditor,
  collectUpdateDeclarations,
} from '../../../plitejs/test/support/plugin-dispatch-census';
import { BaseIndentPlugin } from '../features/indent/lib/BaseIndentPlugin';

describe('plugin update declarations', () => {
  it('declares every first-party method that takes arguments, including nested and function members', () => {
    const results = [
      createEditor({ plugins: BaseEditorKit }),
      censusRuntimeEditor(),
    ].map(collectUpdateDeclarations);
    for (const result of results) {
      expect(result.methods).toBeGreaterThan(0);
      expect(result.undeclared).toEqual([]);
    }
  });
});

describe('plugin dispatch with DOM and indent', () => {
  const NoteHolder = definePlugin('noteHolder', {
    dependencies: [BaseParagraphPlugin],
    schema: ({ plugins }) => ({
      element: {
        contentRoots: {
          body: {
            content: schema.content.any([plugins.blockContent().allowed], {
              default: { type: 'paragraph' },
              min: 1,
            }),
            ownership: 'exclusive',
          },
        },
        void: 'block',
      },
    }),
  });
  const initialValue = () => ({
    children: [
      { type: 'paragraph', children: [{ text: 'main' }] },
      {
        type: 'noteHolder',
        childRoots: { body: 'note' },
        children: [{ text: '' }],
      },
    ],
    roots: { note: [{ type: 'paragraph', children: [{ text: 'note' }] }] },
  });
  const Nested = definePlugin('nested', {
    update: ({ tx }) => ({
      indent: txLocate(locateAt(0), (_options: { at: NodeTarget }) =>
        tx.plugin(BaseIndentPlugin).increase()
      ),
    }),
  });

  it('ignores a main selection when indent runs through a note view', () => {
    const editor = createEditor({
      plugins: [NoteHolder, BaseIndentPlugin],
      initialValue: initialValue(),
    });
    editor.update.selection.set({ offset: 0, path: [0, 0] });
    createEditorView(editor, { root: 'note' })
      .plugin(BaseIndentPlugin)
      .update.increase();
    expect(editor.read.value()).toEqual(initialValue());
  });

  it('keeps a nested indent in an explicitly targeted main root with no caret there', () => {
    const editor = createEditor({
      plugins: [NoteHolder, BaseIndentPlugin, Nested],
      initialValue: initialValue(),
    });
    editor.update.selection.set({ offset: 0, path: [0, 0], root: 'note' });
    editor
      .plugin(Nested)
      .update.indent({ at: editor.key(editor.read.children()[0]) });
    expect(editor.read.value()).toEqual(initialValue());
  });

  for (const review of [false, true]) {
    it(`keeps a DOM callback on the base transaction and routes its nested indent${review ? ' in a review frame' : ''}`, () => {
      const editor = createEditor({
        plugins: [NoteHolder, BaseIndentPlugin, AuthoredPlugin],
        initialValue: initialValue(),
      });
      if (review) {
        createEditorView(editor, {
          root: 'note',
          authored: { intent: 'propose' },
        }).update.text.delete({
          at: {
            anchor: { path: [0, 0], offset: 0 },
            focus: { path: [0, 0], offset: 1 },
          },
        });
      }
      editor.update.selection.set({ offset: 0, path: [0, 0], root: 'note' });
      editor.update.dom.autoScroll((tx) => {
        tx.nodes.set({ indent: 3 }, { at: [0] });
        tx.plugin(BaseIndentPlugin).increase();
      });
      const note = createEditorView(editor, {
        root: 'note',
        authored: { preview: 'proposed' },
      });
      expect({
        main: editor.read.children()[0].indent,
        note: note.read.children()[0].indent,
      }).toEqual({ main: 3, note: 1 });
    });

    it(`keeps a DOM callback's explicit paths in main${review ? ' in a review frame' : ''}`, () => {
      const editor = createEditor({
        plugins: [NoteHolder, BaseIndentPlugin, AuthoredPlugin],
        initialValue: initialValue(),
      });
      if (review) {
        createEditorView(editor, {
          root: 'note',
          authored: { intent: 'propose' },
        }).update.text.delete({
          at: {
            anchor: { path: [0, 0], offset: 0 },
            focus: { path: [0, 0], offset: 1 },
          },
        });
      }
      editor.update.selection.set({ offset: 0, path: [0, 0], root: 'note' });
      editor.update.dom.autoScroll((tx) =>
        tx.nodes.set({ indent: 3 }, { at: [0] })
      );
      expect({
        main: editor.read.children()[0].indent,
        note: editor.read.root('note')[0].indent,
      }).toEqual({ main: 3, note: undefined });
    });
  }

  it('records a proposal on a visible note key whose block has a pending deletion', () => {
    const editor = createEditor({
      plugins: [NoteHolder, BaseIndentPlugin, AuthoredPlugin],
      initialValue: initialValue(),
    });
    const proposing = createEditorView(editor, {
      root: 'note',
      authored: { intent: 'propose' },
    });
    proposing.update.text.delete({
      at: {
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 1, path: [0, 0] },
      },
    });
    const key = editor.key(editor.read.root('note')[0]);
    editor.update.selection.set({ offset: 1, path: [0, 0], root: 'note' });
    editor.update((tx) => {
      tx.plugin(AuthoredPlugin).propose();
      Reflect.apply(tx.plugin(BaseIndentPlugin).increase, undefined, [
        { nodes: { at: key } },
      ]);
    });
    const proposed = createEditorView(editor, {
      root: 'note',
      authored: { preview: 'proposed' },
    });
    const accepted = createEditorView(editor, {
      root: 'note',
      authored: { preview: 'accepted' },
    });
    expect({
      proposed: proposed.read.children()[0].indent,
      accepted: accepted.read.children()[0].indent,
      main: editor.read.children()[0].indent,
    }).toEqual({ proposed: 1, accepted: undefined, main: undefined });
    const changes = editor.read.authored.changes({}).items;
    editor.update.authored.decide({ action: 'accept', changes });
    expect(proposed.read.children()).toEqual([
      { type: 'paragraph', children: [{ text: 'ote' }], indent: 1 },
    ]);
  });
});
