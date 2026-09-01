import { describe, expect, it } from 'bun:test';

import { act, fireEvent, render, waitFor } from '@testing-library/react';
import { LinkPlugin, Plate, PlateContent, createEditor } from 'platejs/react';
import * as React from 'react';

import { type FindController, FindKit, useFindController } from './find';

const value = [
  {
    type: 'paragraph',
    children: [
      { text: 'hello ' },
      {
        type: 'link',
        children: [{ text: 'world' }],
        url: 'https://platejs.org',
      },
      { text: ' again' },
    ],
  },
  { type: 'paragraph', children: [{ text: 'hello outside' }] },
];

function ControllerHarness({
  onController,
}: {
  onController: (controller: FindController) => void;
}) {
  onController(useFindController());

  return null;
}

const setup = () => {
  const editor = createEditor({
    plugins: [LinkPlugin, ...FindKit],
    initialValue: value,
  });
  let controller: FindController | null = null;
  const view = render(
    <Plate editor={editor}>
      <ControllerHarness
        onController={(nextController) => {
          controller = nextController;
        }}
      />
      <PlateContent aria-label="Editor" />
    </Plate>
  );
  const getController = () => {
    if (!controller) throw new Error('Expected Find controller');

    return controller;
  };

  return { editor, getController, view };
};

describe('FindKit', () => {
  it('finds through inline descendants without persisting match state', async () => {
    const { editor, getController } = setup();
    const before = editor.read.children();

    act(() => getController().open('hello world again'));

    await waitFor(() => expect(getController().count).toBe(1));
    expect(editor.read.children()).toEqual(before);
    expect(getController().activeIndex).toBe(0);
    let committed = false;

    act(() => {
      committed = getController().commitActiveMatch();
    });
    expect(committed).toBe(true);
    expect(editor.read.selection()).toMatchObject({
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 6, path: [0, 2] },
    });
  });

  it('wraps navigation and rescans only after document commits', async () => {
    const { editor, getController } = setup();

    act(() => getController().open('hello'));
    await waitFor(() => expect(getController().count).toBe(2));

    act(() => getController().previous());
    expect(getController().activeIndex).toBe(1);
    act(() => getController().next());
    expect(getController().activeIndex).toBe(0);

    act(() => {
      editor.update.text.insert(' hello', {
        at: { offset: 13, path: [1, 0] },
      });
    });
    await waitFor(() => expect(getController().count).toBe(3));
  });

  it('owns an accessible find bar and returns focus on Escape', async () => {
    const { getController, view } = setup();

    act(() => getController().open('hello'));

    const search = await view.findByRole('search', {
      name: 'Find in document',
    });
    const input = view.getByRole('searchbox', { name: 'Find text' });

    await waitFor(() => expect(getController().count).toBe(2));
    expect(document.activeElement).toBe(input);
    expect(search.getAttribute('aria-busy')).toBe('false');
    expect(view.getByText('1 of 2')).toBeTruthy();

    fireEvent.keyDown(input, { key: 'Enter' });
    expect(getController().activeIndex).toBe(1);
    fireEvent.keyDown(input, { key: 'Enter', shiftKey: true });
    expect(getController().activeIndex).toBe(0);
    fireEvent.keyDown(input, { key: 'Escape' });

    await waitFor(() => expect(view.queryByRole('search')).toBeNull());
    await waitFor(() =>
      expect(document.activeElement).toBe(
        view.getByRole('textbox', { name: 'Editor' })
      )
    );
  });
});
