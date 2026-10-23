import {
  BaseParagraphPlugin,
  createEditor,
  definePlugin,
  editorCommands,
} from '../../../core';
import { domCommands } from '../../../dom/plite-dom.internal';
import {
  createEditorView,
  evaluateCommand,
  getCaretOwner,
  getViewPresentation,
  retainViewPresentation,
} from '../../../facade';
import type { AnyBasePlugin } from '../../../lib/plugin';
import { BaseImagePlugin } from '../../media/lib/image/BaseImagePlugin';
import { BaseUploadPlugin } from '../../upload/lib/BaseUploadPlugin';
import { NoteHolder } from '../__tests__/detailsConversionFixture';
import { BaseDetailsPlugin } from './BaseDetailsPlugin';

const createDetailsEditor = (plugins: AnyBasePlugin[] = []) =>
  createEditor({
    plugins: [BaseParagraphPlugin, BaseDetailsPlugin, ...plugins],
    initialValue: [
      {
        children: [
          { children: [{ text: 'Title' }], type: 'summary' },
          { children: [{ text: 'Body' }], type: 'paragraph' },
        ],
        type: 'details',
      },
      { children: [{ text: 'After' }], type: 'paragraph' },
    ],
  });

const createRootsEditor = (plugins: AnyBasePlugin[] = []) =>
  createEditor({
    plugins: [BaseParagraphPlugin, BaseDetailsPlugin, NoteHolder, ...plugins],
    initialValue: {
      children: [
        {
          children: [
            { children: [{ text: 'Title' }], type: 'summary' },
            { children: [{ text: 'Body' }], type: 'paragraph' },
          ],
          type: 'details',
        },
        {
          childRoots: { body: 'note' },
          children: [{ text: '' }],
          type: 'listNoteHolder',
        },
      ],
      roots: {
        note: [
          {
            children: [
              { children: [{ text: 'Note' }], type: 'summary' },
              { children: [{ text: 'Body' }], type: 'paragraph' },
            ],
            type: 'details',
          },
        ],
      },
    },
  });

const createViews = (plugins?: AnyBasePlugin[]) => {
  const editor = createDetailsEditor(plugins);
  const a = createEditorView(editor);
  const b = createEditorView(editor);

  a.plugin(BaseDetailsPlugin).api.setOpen(editor.key([0])!, true);

  return { a, b, editor, key: editor.key([0])! };
};

describe('Details in two views of one editor', () => {
  it('Enter at a summary end leaves the section in the view where it is closed', () => {
    const { b } = createViews();

    b.update.selection.set({ path: [0, 0, 0], offset: 5 });
    b.update((tx) => tx.command(editorCommands.insertBreak));

    expect(b.read.selection()?.anchor.path).toEqual([1, 0]);
  });

  it('Enter at a summary end enters the body in the view where it is open', () => {
    const { a } = createViews();

    a.update.selection.set({ path: [0, 0, 0], offset: 5 });
    a.update((tx) => tx.command(editorCommands.insertBreak));

    expect(a.read.selection()?.anchor.path).toEqual([0, 1, 0]);
  });

  it('Backspace after the section lands at the summary end in the view where it is closed', () => {
    const { b } = createViews();

    b.update.selection.set({ path: [1, 0], offset: 0 });
    b.update((tx) =>
      tx.command(editorCommands.delete, {
        direction: 'backward',
        unit: 'character',
      })
    );

    expect(b.read.selection()?.anchor).toEqual({ path: [0, 0, 0], offset: 5 });
  });

  it('Backspace after the section merges into the body in the view where it is open', () => {
    const { a } = createViews();

    a.update.selection.set({ path: [1, 0], offset: 0 });
    a.update((tx) =>
      tx.command(editorCommands.delete, {
        direction: 'backward',
        unit: 'character',
      })
    );

    expect(a.read.selection()?.anchor).toEqual({ path: [0, 1, 0], offset: 4 });
  });

  it('Delete at a summary end skips the body in the view where the section is closed', () => {
    const { b } = createViews();

    b.update.selection.set({ path: [0, 0, 0], offset: 5 });
    b.update((tx) =>
      tx.command(editorCommands.delete, {
        direction: 'forward',
        unit: 'character',
      })
    );

    expect(b.read.selection()?.anchor).toEqual({ path: [1, 0], offset: 0 });
  });

  it("a command on the base editor reads the base editor's own open state", () => {
    const { editor } = createViews();

    editor.update.selection.set({ path: [0, 0, 0], offset: 5 });
    editor.update.break.insert();

    expect(editor.read.selection()?.anchor.path).toEqual([1, 0]);
  });

  it('opening a section on the base editor leaves it closed in a view', () => {
    const { b, editor, key } = createViews();

    editor.plugin(BaseDetailsPlugin).api.setOpen(key, true);
    b.update.selection.set({ path: [0, 0, 0], offset: 5 });
    b.update((tx) => tx.command(editorCommands.insertBreak));

    expect(b.read.selection()?.anchor.path).toEqual([1, 0]);
  });

  it('opens a section inserted through a view in that view only', () => {
    const { a, b } = createViews();

    a.update.selection.set({ path: [1, 0], offset: 5 });
    a.update((tx) => tx.plugin(BaseDetailsPlugin).insert());

    expect(
      [a, b].map((view) =>
        view.plugin(BaseDetailsPlugin).api.isOpen(view.key([2])!)
      )
    ).toEqual([true, false]);
  });

  it('a view closing a section moves a caret out of its body when no root retains a view', () => {
    const { a, b, editor, key } = createViews();

    b.plugin(BaseDetailsPlugin).api.setOpen(key, true);
    b.update.selection.set({ path: [0, 1, 0], offset: 2 });
    a.plugin(BaseDetailsPlugin).api.setOpen(key, false);

    expect(editor.read.selection()?.anchor).toEqual({
      path: [0, 0, 0],
      offset: 5,
    });
  });

  it('a close leaves a caret at the same path in another root', () => {
    const editor = createRootsEditor();
    const details = editor.plugin(BaseDetailsPlugin).api;
    const key = editor.key([0])!;

    details.setOpen(key, true);
    editor.update.selection.set({ path: [0, 1, 0], offset: 2, root: 'note' });
    details.setOpen(key, false);

    expect(editor.read.selection()?.anchor).toEqual({
      path: [0, 1, 0],
      offset: 2,
      root: 'note',
    });
  });

  it('a section inserted in another root through a view is open in that view only, and inserting at its title follows that view (R19)', () => {
    const editor = createRootsEditor();
    const v = createEditorView(editor);
    const note = createEditorView(editor, { root: 'note' });

    v.update((tx) =>
      tx.plugin(BaseDetailsPlugin).insert({}, { after: note.key([0])! })
    );
    const open = [v, editor].map((view) =>
      view.plugin(BaseDetailsPlugin).api.isOpen(note.key([1])!)
    );

    v.update((tx) =>
      tx.plugin(BaseDetailsPlugin).insert({}, { after: note.key([1, 0])! })
    );

    expect(open).toEqual([true, false]);
    expect(note.read.nodes.get([1, 1])?.[0]).toMatchObject({ type: 'details' });
  });

  it("a close moves a caret out of a named root section's body to its summary end", () => {
    const editor = createRootsEditor();
    const details = editor.plugin(BaseDetailsPlugin).api;
    const key = createEditorView(editor, { root: 'note' }).key([0])!;

    details.setOpen(key, true);
    editor.update.selection.set({ path: [0, 1, 0], offset: 2, root: 'note' });
    details.setOpen(key, false);

    expect(editor.read.selection()?.anchor).toEqual({
      path: [0, 0, 0],
      offset: 4,
      root: 'note',
    });
  });
});

describe('closing a section in retained views', () => {
  const createRetainedViews = (plugins?: AnyBasePlugin[]) => {
    const views = createViews(plugins);
    const releases = [
      retainViewPresentation(views.a),
      retainViewPresentation(views.b),
    ];

    views.b.plugin(BaseDetailsPlugin).api.setOpen(views.key, true);

    return {
      ...views,
      release: () => {
        for (const release of releases) release();
      },
    };
  };

  it("keeps another view's caret in the body", () => {
    const { a, b, editor, key, release } = createRetainedViews();

    b.update.selection.set({ path: [0, 1, 0], offset: 2 });
    a.plugin(BaseDetailsPlugin).api.setOpen(key, false);
    release();

    expect(editor.read.selection()?.anchor).toEqual({
      path: [0, 1, 0],
      offset: 2,
    });
  });

  it("moves the closing view's own caret to the summary end", () => {
    const { a, editor, key, release } = createRetainedViews();

    a.update.selection.set({ path: [0, 1, 0], offset: 2 });
    a.plugin(BaseDetailsPlugin).api.setOpen(key, false);
    release();

    expect(editor.read.selection()?.anchor).toEqual({
      path: [0, 0, 0],
      offset: 5,
    });
  });

  it('moves the caret on a base editor close when no view holds it', () => {
    const { editor, key, release } = createRetainedViews();

    editor.plugin(BaseDetailsPlugin).api.setOpen(key, true);
    editor.update.selection.set({ path: [0, 1, 0], offset: 2 });
    editor.plugin(BaseDetailsPlugin).api.setOpen(key, false);
    release();

    expect(editor.read.selection()?.anchor).toEqual({
      path: [0, 0, 0],
      offset: 5,
    });
  });

  it('moves a caret placed earlier in the same update of the closing view', () => {
    const { b, editor, key, release } = createRetainedViews();

    b.update((tx) => {
      tx.selection.set({ path: [0, 1, 0], offset: 2 });
      b.plugin(BaseDetailsPlugin).api.setOpen(key, false);
    });
    release();

    expect(editor.read.selection()?.anchor).toEqual({
      path: [0, 0, 0],
      offset: 5,
    });
  });

  it('credits a close run in a command another view dispatches to the closing view', () => {
    let closeInCommand = () => {};
    const ClosingPlugin = definePlugin('closing', {}).extend(() => ({
      commands: ({ handle }) => [
        handle(editorCommands.insertBreak, ({ state }) =>
          state.transaction(() => {
            closeInCommand();
          })
        ),
      ],
    }));
    const { a, b, editor, key, release } = createRetainedViews([ClosingPlugin]);

    a.update.selection.set({ path: [1, 0], offset: 3 });
    b.update.selection.set({ path: [0, 1, 0], offset: 2 });
    closeInCommand = () => {
      b.plugin(BaseDetailsPlugin).api.setOpen(key, false);
    };
    a.update((tx) => tx.command(editorCommands.insertBreak));
    const owner = getCaretOwner(editor);
    const observed = {
      caret: editor.read.selection()?.anchor,
      owner:
        owner?.presentation === getViewPresentation(b)
          ? 'B'
          : owner?.presentation === getViewPresentation(a)
            ? 'A'
            : null,
    };

    release();

    expect(observed).toEqual({
      caret: { path: [0, 0, 0], offset: 5 },
      owner: 'B',
    });
  });

  it("moves a main view's caret to its own summary end when it closes inside a note view's update", () => {
    const editor = createRootsEditor();
    const aNote = createEditorView(editor, { root: 'note' });
    const b = createEditorView(editor);
    const releases = [retainViewPresentation(aNote), retainViewPresentation(b)];
    const key = editor.key([0])!;

    b.plugin(BaseDetailsPlugin).api.setOpen(key, true);
    b.update.selection.set({ path: [0, 1, 0], offset: 2 });
    aNote.update(() => b.plugin(BaseDetailsPlugin).api.setOpen(key, false));
    const anchor = editor.read.selection()?.anchor;

    for (const release of releases) release();

    expect(anchor).toEqual({ path: [0, 0, 0], offset: 5 });
  });
});

describe('open state within one update', () => {
  it('reads a section back as open after opening it in the same update', () => {
    const { b, key } = createViews();
    let open: boolean | undefined;

    b.update(() => {
      b.plugin(BaseDetailsPlugin).api.setOpen(key, true);
      open = b.plugin(BaseDetailsPlugin).api.isOpen(key);
    });

    expect(open).toBe(true);
  });

  it('inserts from the title of a section inserted earlier in the same update into its body', () => {
    const { a } = createViews();

    a.update.selection.set({ path: [1, 0], offset: 5 });
    a.update((tx) => {
      tx.plugin(BaseDetailsPlugin).insert({}, { select: true });
      tx.plugin(BaseDetailsPlugin).insert();
    });

    expect(a.read.nodes.get([2, 1])?.[0]).toMatchObject({ type: 'details' });
  });

  it('lets a commit callback close a section the update inserted', () => {
    const { a } = createViews();

    a.update.selection.set({ path: [1, 0], offset: 5 });
    a.update((tx, context) => {
      tx.plugin(BaseDetailsPlugin).insert({}, { select: true });
      context.afterCommit(() => {
        a.plugin(BaseDetailsPlugin).api.setOpen(a.key([2])!, false);
      });
    });

    expect(a.plugin(BaseDetailsPlugin).api.isOpen(a.key([2])!)).toBe(false);
  });

  it('keeps a close made by a discarded command probe', () => {
    let closeInCommand = () => {};
    const ClosingPlugin = definePlugin('closing', {}).extend(() => ({
      commands: ({ handle }) => [
        handle(editorCommands.insertBreak, ({ state }) => {
          closeInCommand();

          return state.transaction(() => {});
        }),
      ],
    }));
    const { a, key } = createViews([ClosingPlugin]);

    closeInCommand = () => {
      a.plugin(BaseDetailsPlugin).api.setOpen(key, false);
    };
    evaluateCommand(a, editorCommands.insertBreak);

    expect(a.plugin(BaseDetailsPlugin).api.isOpen(key)).toBe(false);
  });
});

describe('a file dropped at a section title', () => {
  const UploadPlugin = BaseUploadPlugin.configure({
    initialState: {
      client: { upload: () => new Promise(() => {}) },
      getUrl: ({ key }) => key,
      rules: { image: { kind: 'image' } },
    },
  });

  it.each([
    { caret: 'main', through: 'a', view: 'main', lands: 'body' },
    { caret: 'main', through: 'b', view: 'main', lands: 'after' },
    { caret: 'note', through: 'a', view: 'note', lands: 'body' },
    { caret: 'note', through: 'b', view: 'note', lands: 'after' },
    { caret: 'note', through: 'a', view: 'main', lands: 'body' },
    { caret: 'note', through: 'b', view: 'main', lands: 'after' },
  ] as const)(
    'lands in the $lands of a $caret section through view $through of $view',
    ({ caret, lands, through, view }) => {
      const editor = createRootsEditor([BaseImagePlugin, UploadPlugin]);
      const root = caret === 'note' ? caret : undefined;
      const options = view === 'note' ? { root: view } : {};
      const views = {
        a: createEditorView(editor, options),
        b: createEditorView(editor, options),
      };
      const key = createEditorView(editor, { root }).key([0])!;
      const data = new DataTransfer();

      data.items.add(new File(['image'], 'image.png', { type: 'image/png' }));
      views.a.plugin(BaseDetailsPlugin).api.setOpen(key, true);
      views[through].update.selection.set({
        offset: caret === 'note' ? 4 : 5,
        path: [0, 0, 0],
        ...(root ? { root } : {}),
      });
      views[through].update((tx) => {
        tx.command(domCommands.insertData, data);
      });

      const blocks = root ? editor.read.root(root) : editor.read.children();
      const holder = root ? [] : [{ type: 'listNoteHolder' }];

      expect(blocks).toMatchObject(
        lands === 'body'
          ? [
              {
                children: [
                  { type: 'summary' },
                  { type: 'upload' },
                  { type: 'paragraph' },
                ],
              },
              ...holder,
            ]
          : [
              { children: [{ type: 'summary' }, { type: 'paragraph' }] },
              { type: 'upload' },
              ...holder,
            ]
      );
    }
  );
});
