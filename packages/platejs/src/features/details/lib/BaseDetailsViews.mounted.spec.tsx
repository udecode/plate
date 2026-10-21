import { act, fireEvent, render, screen } from '@testing-library/react';
import React from 'react';

import { AuthoredPlugin } from '../../../authored';
import { NodeApi, schema } from '../../../core';
import { createEditorView } from '../../../facade';
import { definePlugin } from '../../../lib';
import {
  type EditorElementProps,
  EditorElement,
} from '../../../react/components/plate-nodes';
import {
  createEditor,
  EditorContent,
  EditorRoot,
  useEditor,
  useViewStore,
} from '../../../react/core';
import { DetailsPlugin } from '../../../react/features/details/DetailsPlugin';
import { useRootEditor } from '../../../react/plite-react';
import { BaseDetailsPlugin } from './BaseDetailsPlugin';

type RootView = ReturnType<typeof useRootEditor>;

const wait = (ms = 50) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });

const paragraph = (text: string) => ({
  children: [{ text }],
  type: 'paragraph',
});

const section = (title: string) => ({
  children: [
    { children: [{ text: title }], type: 'summary' },
    paragraph('Body'),
  ],
  type: 'details',
});

const NoteHolderPlugin = definePlugin('noteHolder', {
  component: (props) => (
    <EditorElement {...props}>
      <div>{props.slots.contentRoot('body')}</div>
      {props.children}
    </EditorElement>
  ),
  schema: {
    element: {
      blockContent: true,
      contentRoots: {
        body: {
          content: schema.content.types(['paragraph', 'details'], {
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

const createNoteEditor = () =>
  createEditor({
    initialValue: {
      children: [
        {
          childRoots: { body: 'note' },
          children: [{ text: '' }],
          type: 'noteHolder',
        },
        paragraph('After'),
      ],
      roots: { note: [section('Note')] },
    },
    plugins: [AuthoredPlugin, DetailsPlugin, NoteHolderPlugin],
  });

const createSectionEditor = () =>
  createEditor({
    initialValue: [section('Title'), paragraph('After')],
    plugins: [DetailsPlugin],
  });

type ViewsEditor = ReturnType<typeof createNoteEditor>;

const renderViews = (editor: ViewsEditor, { authored = false } = {}) => {
  const views = new Map<string, RootView>();
  const Register = ({ name }: { name: string }) => {
    views.set(name, useRootEditor());

    return null;
  };

  render(
    <>
      {['a', 'b'].map((name) => (
        <EditorRoot
          authored={authored ? { intent: 'propose' } : undefined}
          editor={editor}
          key={name}
          suppressInstanceWarning
        >
          <Register name={name} />
          <EditorContent aria-label={`${name} content`} />
        </EditorRoot>
      ))}
    </>
  );

  return { a: views.get('a')!, b: views.get('b')! };
};

const setOpen = async (view: RootView, key: string, open: boolean) => {
  await act(async () => {
    view.plugin(BaseDetailsPlugin).api.setOpen(key, open);
  });
};

const textAt = (container: Element, path: string) =>
  container.querySelector(`[data-editor-path="${path}"]`)!.firstChild!;

const selectAcross = async (name: string, path: string, offset: number) => {
  const content = screen.getByLabelText(`${name} content`);
  const note = content.querySelector('[data-editor-root="note"]')!;
  const start = textAt(note, path);

  await act(async () => {
    content.focus();
    document
      .getSelection()!
      .setBaseAndExtent(start, offset, textAt(content, '1,0'), 0);
    document.dispatchEvent(new Event('selectionchange'));
    await wait();
  });
  document.getSelection()!.setBaseAndExtent(start, offset, start, offset);

  return content;
};

const beforeInput = async (target: HTMLElement, init: InputEventInit) => {
  await act(async () => {
    fireEvent(
      target,
      new InputEvent('beforeinput', {
        bubbles: true,
        cancelable: true,
        ...init,
      })
    );
    await wait();
  });
};

const noteTitleText = '0,0,0';
const noteBodyText = '0,1,0';

const projectedInputs = {
  Enter: async (name: string) => {
    const content = await selectAcross(name, noteTitleText, 2);

    await beforeInput(content, { inputType: 'insertParagraph' });
  },
  paste: async (name: string) => {
    const content = await selectAcross(name, noteBodyText, 2);

    await act(async () => {
      fireEvent.paste(content, {
        clipboardData: {
          files: [],
          getData: (format: string) => (format === 'text/plain' ? 'Z' : ''),
          types: ['text/plain'],
        },
      });
      await wait();
    });
  },
  typing: async (name: string) => {
    const content = await selectAcross(name, noteBodyText, 2);

    await beforeInput(content, { data: 'Z', inputType: 'insertText' });
  },
};

const noteText = (editor: ViewsEditor) =>
  createEditorView(editor, { authored: { preview: 'proposed' }, root: 'note' })
    .read.root('note')
    .map((node) =>
      node.type === 'details'
        ? (node.children as Array<Parameters<typeof NodeApi.string>[0]>).map(
            NodeApi.string
          )
        : NodeApi.string(node)
    );

describe('projected input into another root (R13)', () => {
  it.each([
    ['typing', 'a writable', false, [['Note', 'BoZ']], [['NoteZ', 'Bo']]],
    ['typing', 'a suggesting', true, [['Note', 'BoZ']], [['NoteZ', 'Bo']]],
    ['paste', 'a writable', false, [['Note', 'BoZ']], [['NoteZ', 'Bo']]],
    ['paste', 'a suggesting', true, [['Note', 'BoZ']], [['NoteZ', 'Bo']]],
    ['Enter', 'a writable', false, [['No', '']], [['No'], '']],
    ['Enter', 'a suggesting', true, [['No', '']], [['No'], '']],
  ] as const)(
    '%s lands in that root by the open state of %s calling view',
    async (input, _mode, authored, open, closed) => {
      const landed: unknown[] = [];

      for (const name of ['a', 'b']) {
        const editor = createNoteEditor();
        const views = renderViews(editor, { authored });

        await setOpen(
          views.a,
          createEditorView(editor, { root: 'note' }).key([0])!,
          true
        );
        await projectedInputs[input](name);
        landed.push(noteText(editor));
        document.body.innerHTML = '';
      }

      expect(landed).toEqual([open, closed]);
    }
  );
});

describe('closing a section in mounted views', () => {
  const renderSection = async () => {
    const editor = createSectionEditor();
    const views = renderViews(editor);
    const key = editor.key([0])!;

    await setOpen(views.a, key, true);
    await setOpen(views.b, key, true);

    return { ...views, editor, key };
  };

  const place = async (view: RootView, path: number[], offset: number) => {
    await act(async () => {
      view.update((tx) => tx.selection.set({ offset, path }));
    });
  };

  it("keeps another view's selection in the body (R17)", async () => {
    const { a, b, editor, key } = await renderSection();
    const body = screen
      .getByLabelText('b content')
      .querySelector('[data-editor-path="0,1"]')!;

    await act(async () => {
      screen.getByLabelText('b content').focus();
    });
    await place(b, [0, 1, 0], 2);
    await act(async () => {
      await wait();
    });
    await setOpen(a, key, false);
    await act(async () => {
      await wait();
    });

    expect([
      editor.read.selection()?.anchor,
      body.contains(document.getSelection()!.anchorNode),
      document.activeElement === screen.getByLabelText('b content'),
    ]).toEqual([{ offset: 2, path: [0, 1, 0] }, true, true]);
  });

  it('moves the selection to the summary end when the closing view holds it (R18)', async () => {
    const { a, editor, key } = await renderSection();

    await place(a, [0, 1, 0], 2);
    await setOpen(a, key, false);

    expect(editor.read.selection()?.anchor).toEqual({
      offset: 5,
      path: [0, 0, 0],
    });
  });

  it('moves the selection on a base editor close when no view holds it (R18)', async () => {
    const { editor, key } = await renderSection();
    const details = editor.plugin(BaseDetailsPlugin).api;

    await act(async () => {
      details.setOpen(key, true);
      editor.update.selection.set({ offset: 2, path: [0, 1, 0] });
      details.setOpen(key, false);
    });

    expect(editor.read.selection()?.anchor).toEqual({
      offset: 5,
      path: [0, 0, 0],
    });
  });

  it("credits a close run inside another view's update to the view that calls it (R18)", async () => {
    const { a, b, editor, key } = await renderSection();

    await place(a, [1, 0], 3);
    await place(b, [0, 1, 0], 2);
    await act(async () => {
      a.update(() => b.plugin(BaseDetailsPlugin).api.setOpen(key, false));
    });
    const afterClose = editor.read.selection()?.anchor;

    await act(async () => {
      screen.getByLabelText('a content').focus();
      await wait();
    });

    expect([afterClose, editor.read.selection()?.anchor]).toEqual([
      { offset: 5, path: [0, 0, 0] },
      { offset: 3, path: [1, 0] },
    ]);
  });

  it('moves a caret the closing view placed earlier in the same update (R18)', async () => {
    const { b, editor, key } = await renderSection();

    await act(async () => {
      b.update((tx) => {
        tx.selection.set({ offset: 2, path: [0, 1, 0] });
        b.plugin(BaseDetailsPlugin).api.setOpen(key, false);
      });
    });

    expect(editor.read.selection()?.anchor).toEqual({
      offset: 5,
      path: [0, 0, 0],
    });
  });

  it('a view that closes a section and is focused in the same batch shows its caret at the summary end before any typing', async () => {
    const CollapsingDetails = (
      props: EditorElementProps<typeof DetailsPlugin>
    ) => {
      const editor = useEditor();
      const key = editor.key(props.element);
      const open = useViewStore(
        BaseDetailsPlugin,
        (state) => key !== undefined && state.openKeys.has(key)
      );

      return (
        <EditorElement {...props}>
          <div data-testid="summary">
            {props.slots.children({ from: 0, to: 0 })}
          </div>
          <div>
            {props.slots.contentBoundary({
              copyPolicy: 'model',
              mounted: open,
              reason: 'app-collapse',
              renderPlaceholder: () => null,
              scope: {
                from: 1,
                to: props.element.children.length - 1,
                type: 'children',
              },
              selectionPolicy: 'skip',
            })}
          </div>
        </EditorElement>
      );
    };
    const CollapsingDetailsPlugin = DetailsPlugin.configure({
      component: CollapsingDetails,
    });
    const editor = createEditor({
      initialValue: [section('Title'), paragraph('After')],
      plugins: [CollapsingDetailsPlugin],
    });
    const { a, b } = renderViews(editor);
    const key = editor.key([0])!;

    await setOpen(b, key, true);
    await place(b, [0, 1, 0], 2);
    await place(a, [1, 0], 3);
    act(() => {
      b.plugin(BaseDetailsPlugin).api.setOpen(key, false);
      screen.getByLabelText('b content').focus();
    });
    const summary = screen
      .getByLabelText('b content')
      .querySelector('[data-testid="summary"]')!;

    expect([
      editor.read.selection()?.anchor,
      summary.contains(document.getSelection()!.anchorNode),
      document.activeElement === screen.getByLabelText('b content'),
    ]).toEqual([{ offset: 5, path: [0, 0, 0] }, true, true]);
  });
});

it('remounting an EditorContent keeps its open sections (R26)', async () => {
  const editor = createSectionEditor();
  const key = editor.key([0])!;
  let view!: RootView;
  let setMounted!: (mounted: boolean) => void;
  const Register = () => {
    view = useRootEditor();

    return null;
  };
  const Content = () => {
    const [mounted, setState] = React.useState(true);

    setMounted = setState;

    return mounted ? (
      <>
        <Register />
        <EditorContent />
      </>
    ) : null;
  };

  render(
    <EditorRoot editor={editor} suppressInstanceWarning>
      <Content />
    </EditorRoot>
  );
  await setOpen(view, key, true);
  await act(async () => {
    setMounted(false);
  });
  await act(async () => {
    setMounted(true);
  });

  expect(view.plugin(BaseDetailsPlugin).api.isOpen(key)).toBe(true);
});
