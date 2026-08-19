import * as React from 'react';

import { fireEvent, render, renderHook } from '@testing-library/react';
import { afterAll, beforeEach, describe, expect, it, mock } from 'bun:test';

const useEditorMock = mock();
const useElementMock = mock();

mock.module('platejs/react', () => ({
  useEditor: () => useEditorMock(),
  useElement: () => useElementMock(),
  useEditorSelector: (selector: (editor: unknown) => unknown) =>
    selector(useEditorMock()),
}));

mock.module('@/components/ui/button', () => ({
  Button: ({
    children,
    ...props
  }: React.ComponentProps<'button'> & { asChild?: boolean }) => (
    <button {...props}>{children}</button>
  ),
}));

mock.module('@/lib/utils', () => ({
  cn: (...values: Array<string | false | null | undefined>) =>
    values.filter(Boolean).join(' '),
}));

describe('Caption', () => {
  beforeEach(() => {
    useEditorMock.mockReset();
    useEditorMock.mockReturnValue({
      read: { selection: () => null },
    });
    useElementMock.mockReset();
  });

  afterAll(() => {
    mock.restore();
  });

  it('covers empty direct caption content while media is inactive', async () => {
    const contentBoundary = mock(() => <span data-testid="caption-boundary" />);
    const { Caption } = await import(
      `./caption?test=${Math.random().toString(36).slice(2)}`
    );
    const view = render(
      <Caption
        active={false}
        element={{ children: [{ text: '' }], type: 'image' }}
        slots={{ contentBoundary } as any}
      >
        <span>Hidden caption</span>
      </Caption>
    );

    expect(view.getByTestId('caption-boundary')).toBeTruthy();
    expect(view.queryByText('Hidden caption')).toBeNull();
    expect(contentBoundary).toHaveBeenCalledWith({
      copyPolicy: 'model',
      mounted: false,
      reason: 'app-hidden',
      renderPlaceholder: expect.any(Function),
      scope: { from: 0, to: 0, type: 'children' },
      selectionPolicy: 'skip',
    });
  });

  it('reveals an empty caption for a media node selection', async () => {
    const { Caption } = await import(
      `./caption?test=${Math.random().toString(36).slice(2)}`
    );
    const view = render(
      <Caption
        active
        element={{ children: [{ text: '' }], type: 'image' }}
        slots={{ contentBoundary: () => null } as any}
      >
        <span data-testid="caption-content" />
      </Caption>
    );

    const caption = view.container.querySelector('figcaption');

    expect(caption).toBeTruthy();
    expect(caption?.getAttribute('data-placeholder')).toBe(
      'Write a caption...'
    );
    expect(view.getAllByTestId('caption-content')).toHaveLength(1);
  });

  it('keeps direct caption content mounted for a caption text selection', async () => {
    const { Caption } = await import(
      `./caption?text=${Math.random().toString(36).slice(2)}`
    );
    const view = render(
      <Caption
        active
        element={{ children: [{ text: '' }], type: 'image' }}
        slots={{ contentBoundary: () => null } as any}
      >
        <span data-testid="caption-content" />
      </Caption>
    );

    expect(view.container.querySelector('figcaption')).toBeTruthy();
    expect(view.getAllByTestId('caption-content')).toHaveLength(1);
  });

  it('renders non-empty direct children exactly once without selection', async () => {
    const { Caption } = await import(
      `./caption?visible=${Math.random().toString(36).slice(2)}`
    );
    const view = render(
      <Caption
        active={false}
        element={{ children: [{ text: 'Visible caption' }], type: 'image' }}
        slots={{ contentBoundary: () => null } as any}
      >
        <span data-testid="caption-content">Visible caption</span>
      </Caption>
    );

    expect(view.getAllByTestId('caption-content')).toHaveLength(1);
    expect(
      view.getByTestId('caption-content').closest('figcaption')
    ).toBeTruthy();
  });

  it('matches descendant text focus without treating NodeSelection as caption focus', async () => {
    const { useCaptionFocused } = await import(
      `./caption?selection=${Math.random().toString(36).slice(2)}`
    );
    useEditorMock.mockReturnValue({
      read: {
        selection: () => ({
          anchor: { offset: 0, path: [0, 0] },
          focus: { offset: 0, path: [0, 0] },
          kind: 'node',
          path: [0],
        }),
      },
    });

    const nodeSelection = renderHook(() => useCaptionFocused([0]));

    expect(nodeSelection.result.current).toBe(false);
    nodeSelection.unmount();

    useEditorMock.mockReturnValue({
      read: {
        selection: () => ({
          anchor: { offset: 0, path: [0, 0] },
          focus: { offset: 0, path: [0, 0] },
          kind: 'text',
        }),
      },
    });

    const captionSelection = renderHook(() => useCaptionFocused([0]));

    expect(captionSelection.result.current).toBe(true);
    captionSelection.unmount();

    useEditorMock.mockReturnValue({
      read: {
        selection: () => ({
          anchor: { offset: 0, path: [1, 0] },
          focus: { offset: 0, path: [1, 0] },
          kind: 'node',
          path: [1],
        }),
      },
    });

    const otherSelection = renderHook(() => useCaptionFocused([0]));

    expect(otherSelection.result.current).toBe(false);
  });

  it('selects and focuses the first caption point', async () => {
    const point = { offset: 0, path: [2, 0, 0] };
    const focus = mock();
    const setSelection = mock();
    const element = {
      children: [{ text: 'Caption' }],
      type: 'image',
    };

    useEditorMock.mockReturnValue({
      api: { dom: { focus } },
      read: { points: { start: mock(() => point) } },
      update: { selection: { set: setSelection } },
    });
    useElementMock.mockReturnValue(element);

    const { CaptionButton } = await import(
      `./caption?button=${Math.random().toString(36).slice(2)}`
    );
    const view = render(<CaptionButton>Caption</CaptionButton>);

    fireEvent.click(view.getByRole('button', { name: 'Caption' }));

    expect(setSelection).toHaveBeenCalledWith(point);
    expect(focus).toHaveBeenCalledTimes(1);
  });

  it('does not focus a caption without an editable point', async () => {
    const focus = mock();
    const setSelection = mock();

    useEditorMock.mockReturnValue({
      api: { dom: { focus } },
      read: { points: { start: mock(() => null) } },
      update: { selection: { set: setSelection } },
    });
    useElementMock.mockReturnValue({ children: [], type: 'image' });

    const { CaptionButton } = await import(
      `./caption?empty-button=${Math.random().toString(36).slice(2)}`
    );
    const view = render(<CaptionButton>Caption</CaptionButton>);

    fireEvent.click(view.getByRole('button', { name: 'Caption' }));

    expect(setSelection).not.toHaveBeenCalled();
    expect(focus).not.toHaveBeenCalled();
  });
});

describe('CaptionStatic', () => {
  it('renders non-empty direct children exactly once', async () => {
    const { CaptionStatic } = await import(
      `./caption-static?visible=${Math.random().toString(36).slice(2)}`
    );
    const view = render(
      <CaptionStatic
        element={{ children: [{ text: 'Caption' }], type: 'image' }}
      >
        <span data-testid="caption-content">Caption</span>
      </CaptionStatic>
    );

    expect(view.getAllByTestId('caption-content')).toHaveLength(1);
    expect(
      view.getByTestId('caption-content').closest('figcaption')
    ).toBeTruthy();
  });

  it('omits empty direct caption content', async () => {
    const { CaptionStatic } = await import(
      `./caption-static?empty=${Math.random().toString(36).slice(2)}`
    );
    const view = render(
      <CaptionStatic element={{ children: [{ text: '' }], type: 'image' }}>
        <span data-testid="caption-content" />
      </CaptionStatic>
    );

    expect(view.queryByTestId('caption-content')).toBeNull();
    expect(view.container.querySelector('figcaption')).toBeNull();
  });
});
