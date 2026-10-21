import { act, fireEvent, render, screen } from '@testing-library/react';
import React from 'react';

import { schema } from '../../core';
import { definePlugin } from '../../lib';
import { createEditor } from '../editor';
import { useRootChrome, useRootEditor } from '../plite-react';
import { EditorRoot } from './Plate';
import { EditorContent } from './PlateContent';

type RootView = ReturnType<typeof useRootEditor>;

const wait = (ms = 50) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });

const paragraph = (text: string) => ({
  children: [{ text }],
  type: 'paragraph',
});

const HeaderHolderPlugin = definePlugin('headerHolder', {
  schema: {
    element: {
      blockContent: true,
      contentRoots: {
        body: {
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

const createViewsEditor = () =>
  createEditor({
    initialValue: {
      children: [
        paragraph('hello world'),
        {
          childRoots: { body: 'header' },
          children: [{ text: '' }],
          type: 'headerHolder',
        },
      ],
      roots: { header: [paragraph('header text')] },
    },
    plugins: [HeaderHolderPlugin],
  });

const caret = (view: RootView) =>
  view.read((state) => {
    const selection = state.selection();

    return selection
      ? [...selection.anchor.path, selection.anchor.offset].join('.')
      : null;
  });

const place = async (view: RootView, offset: number) => {
  await act(async () => {
    view.update((tx) => tx.selection.set({ offset, path: [0, 0] }));
  });
};

const pressChrome = async (name: string) => {
  await act(async () => {
    fireEvent.mouseDown(screen.getByText(`${name} chrome`));
    await wait();
  });
};

const MainChrome = ({
  name,
  register,
}: {
  name: string;
  register: Map<string, RootView>;
}) => {
  const chrome = useRootChrome();
  register.set(name, useRootEditor());

  return (
    <section {...chrome.props}>
      <span>{name} chrome</span>
      <EditorContent aria-label={`${name} content`} />
    </section>
  );
};

const HeaderChrome = ({ register }: { register: Map<string, RootView> }) => {
  const chrome = useRootChrome('header');
  register.set('header', useRootEditor('header'));

  return (
    <section {...chrome.props}>
      <span>header chrome</span>
      <EditorContent aria-label="header content" root="header" />
    </section>
  );
};

describe('Plate roots as views (R26)', () => {
  it('keeps separate carets for two EditorRoots of one editor', async () => {
    const editor = createViewsEditor();
    const views = new Map<string, RootView>();

    render(
      <>
        <EditorRoot editor={editor} suppressInstanceWarning>
          <MainChrome name="A" register={views} />
        </EditorRoot>
        <EditorRoot editor={editor} suppressInstanceWarning>
          <MainChrome name="B" register={views} />
        </EditorRoot>
      </>
    );
    const a = views.get('A')!;
    const b = views.get('B')!;

    await place(a, 1);
    await place(b, 8);
    await act(async () => {
      b.update((tx) =>
        tx.text.insert('XY', { at: { offset: 0, path: [0, 0] } })
      );
    });
    await pressChrome('A');
    const restoredA = caret(a);

    await pressChrome('B');

    expect([restoredA, caret(b)]).toEqual(['0.0.3', '0.0.10']);
  });

  it('restores and focuses the header content from chrome around it', async () => {
    const editor = createViewsEditor();
    const views = new Map<string, RootView>();

    render(
      <EditorRoot editor={editor} suppressInstanceWarning>
        <HeaderChrome register={views} />
        <MainChrome name="main" register={views} />
      </EditorRoot>
    );

    await place(views.get('header')!, 3);
    await place(views.get('main')!, 5);
    await pressChrome('header');

    expect([
      caret(views.get('header')!),
      document.activeElement === screen.getByLabelText('header content'),
    ]).toEqual(['0.0.3', true]);
  });

  it("makes a root's content the owner when a toolbar places through useRootEditor", async () => {
    const editor = createViewsEditor();
    const views = new Map<string, RootView>();
    let headerToolbar!: RootView;
    const Toolbar = () => {
      headerToolbar = useRootEditor('header');
      return null;
    };

    render(
      <EditorRoot editor={editor} suppressInstanceWarning>
        <Toolbar />
        <HeaderChrome register={views} />
        <MainChrome name="main" register={views} />
      </EditorRoot>
    );

    await place(views.get('main')!, 5);
    await place(headerToolbar, 3);
    const placed = [caret(views.get('header')!), caret(views.get('main')!)];

    await pressChrome('main');

    expect([
      ...placed,
      caret(views.get('main')!),
      document.activeElement === screen.getByLabelText('main content'),
    ]).toEqual(['0.0.3', null, '0.0.5', true]);
  });
});
