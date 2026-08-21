import { afterAll, beforeEach, describe, expect, it, mock } from 'bun:test';

import { fireEvent, render } from '@testing-library/react';
import * as React from 'react';

const focusMock = mock();
const removeMock = mock();
const setUrlMock = mock(() => false);

const plugin = { name: 'media' } as any;
const element = {
  children: [{ text: '' }],
  type: 'media',
  url: 'https://example.com/original',
};

mock.module('platejs/react', () => ({
  useEditor: () => ({
    api: { dom: { focus: focusMock } },
    plugin: () => ({ update: { setUrl: setUrlMock } }),
    update: { nodes: { remove: removeMock } },
  }),
  useEditorReadOnly: () => false,
  useElement: () => element,
  useFocusedLast: () => true,
}));

mock.module('@/components/ui/button', () => ({
  Button: ({ children, ...props }: React.ComponentProps<'button'>) => (
    <button {...props}>{children}</button>
  ),
  buttonVariants: () => '',
}));

mock.module('@/components/ui/popover', () => ({
  Popover: ({ children }: React.PropsWithChildren) => <>{children}</>,
  PopoverAnchor: ({ children }: React.PropsWithChildren) => <>{children}</>,
  PopoverContent: ({ children }: React.PropsWithChildren) => <>{children}</>,
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
    removeMock.mockReset();
    setUrlMock.mockReset();
    setUrlMock.mockReturnValue(false);
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
    const { MediaToolbar } = await import(
      `./media-toolbar?test=${Math.random().toString(36).slice(2)}`
    );
    const view = render(
      <MediaToolbar plugin={plugin} selected>
        <div />
      </MediaToolbar>
    );

    fireEvent.click(view.getAllByRole('button').at(-1)!);

    expect(removeMock).toHaveBeenCalledWith({ at: element });
    expect(focusMock).toHaveBeenCalledTimes(1);
  });
});
