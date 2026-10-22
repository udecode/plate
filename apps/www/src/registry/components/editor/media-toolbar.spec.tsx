import {
  afterAll,
  beforeEach,
  describe,
  expect,
  it,
  mock,
  spyOn,
} from 'bun:test';

import { fireEvent, render } from '@testing-library/react';
import { createEditor } from 'platejs';
import { BaseImagePlugin } from 'platejs/media';
import * as PlateReact from 'platejs/react';
import * as React from 'react';

const focusMock = mock();
const setUrlMock = mock(() => false);

const plugin = { name: 'media' } as any;
const element = {
  children: [{ text: '' }],
  type: 'media',
  url: 'https://example.com/original',
};
let editor: unknown;
let currentElement: unknown;

mock.module('platejs/react', () => ({
  ...PlateReact,
  useEditor: () => editor,
  useEditorReadOnly: () => false,
  useElement: () => currentElement,
  useFocusedLast: () => true,
}));

mock.module('@/components/ui/button', () => ({
  Button: ({ children, ...props }: React.ComponentProps<'button'>) => (
    <button type="button" {...props}>
      {children}
    </button>
  ),
  buttonVariants: () => '',
}));

mock.module('@/registry/components/editor/floating-popover', () => ({
  FloatingPopover: ({ children }: React.PropsWithChildren) => <>{children}</>,
  FloatingPopoverAnchor: ({
    element: anchorElement,
  }: {
    element: React.ReactNode;
  }) => <>{anchorElement}</>,
  FloatingPopoverContent: ({ children }: React.PropsWithChildren) => (
    <>{children}</>
  ),
}));

mock.module('@/components/ui/separator', () => ({
  Separator: () => <hr />,
}));

mock.module('./caption', () => ({
  CaptionButton: ({ children }: React.PropsWithChildren) => (
    <button type="button">{children}</button>
  ),
}));

describe('MediaToolbar', () => {
  beforeEach(() => {
    element.url = 'https://example.com/original';
    focusMock.mockReset();
    setUrlMock.mockReset();
    setUrlMock.mockReturnValue(false);
    editor = {
      api: { dom: { focus: focusMock } },
      plugin: () => ({ update: { setUrl: setUrlMock } }),
    };
    currentElement = element;
  });

  afterAll(() => {
    mock.restore();
  });

  it('consumes Enter when an edited URL is invalid', async () => {
    const { MediaToolbar } = await import(
      `./media-toolbar?test=${Math.random().toString(36).slice(2)}`
    );
    const view = render(
      <MediaToolbar plugin={plugin} selected>
        <div />
      </MediaToolbar>
    );

    fireEvent.click(view.getByRole('button', { name: 'Edit link' }));

    const input = view.getByPlaceholderText(
      'Paste the embed link...'
    ) as HTMLInputElement;
    element.url = 'https://example.com/changed';

    expect(fireEvent.keyDown(input, { key: 'Enter' })).toBe(false);
    expect(setUrlMock).toHaveBeenCalledWith({
      element,
      url: 'https://example.com/original',
    });
    expect(input.value).toBe('https://example.com/original');
    expect(focusMock).not.toHaveBeenCalled();
  });

  it('returns focus to the editor after deleting media', async () => {
    const live = createEditor({
      initialValue: [
        {
          children: [{ text: '' }],
          type: 'image',
          url: 'https://example.com/a.png',
        },
        { children: [{ text: 'After' }], type: 'paragraph' },
      ],
      plugins: [BaseImagePlugin],
    });
    const focus = spyOn(live.api.dom, 'focus');
    editor = live;
    currentElement = live.read.children()[0];
    const { MediaToolbar } = await import(
      `./media-toolbar?test=${Math.random().toString(36).slice(2)}`
    );
    const view = render(
      <MediaToolbar plugin={plugin} selected>
        <div />
      </MediaToolbar>
    );

    fireEvent.click(view.getAllByRole('button').at(-1)!);

    expect(live.read.children()).toEqual([
      { children: [{ text: 'After' }], type: 'paragraph' },
    ]);
    expect(focus).toHaveBeenCalledTimes(1);
  });
});
