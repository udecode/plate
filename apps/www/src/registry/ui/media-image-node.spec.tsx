import * as React from 'react';

import { render } from '@testing-library/react';
import { afterAll, beforeEach, describe, expect, it, mock } from 'bun:test';

const selectionMock = mock();
const useDraggableMock = mock();
const useEditorSelectorMock = mock();
const useMediaStateMock = mock();

mock.module('@platejs/dnd', () => ({
  useDraggable: useDraggableMock,
}));

mock.module('@platejs/media/react', () => ({
  Image: ({ className }: React.ComponentProps<'img'>) => (
    <img className={className} data-testid="image" alt="" />
  ),
  ImagePlugin: { key: 'img' },
  useMediaState: useMediaStateMock,
}));

mock.module('@platejs/resizable', () => ({
  ResizableProvider: ({ children }: React.PropsWithChildren) => <>{children}</>,
  useResizableValue: () => '100%',
}));

mock.module('platejs/react', () => ({
  PlateElement: ({ children }: React.PropsWithChildren) => (
    <div data-testid="plate-element">{children}</div>
  ),
  useEditor: () => ({
    read: { selection: selectionMock },
  }),
  useEditorMounted: () => true,
  useEditorReadOnly: () => false,
  useEditorSelector: (selector: (editor: unknown) => unknown) =>
    useEditorSelectorMock(selector),
  useElement: () => ({ children: [{ text: '' }], type: 'img' }),
  withHOC: (_Provider: unknown, Component: React.ComponentType) => Component,
}));

mock.module('@/lib/utils', () => ({
  cn: (...values: Array<string | false | null | undefined>) =>
    values.filter(Boolean).join(' '),
}));

mock.module('./media-toolbar', () => ({
  MediaToolbar: ({
    children,
    selected,
  }: React.PropsWithChildren<{ selected: boolean }>) => (
    <div data-testid="media-toolbar" data-selected={selected}>
      {children}
    </div>
  ),
}));

mock.module('./resize-handle', () => ({
  mediaResizeHandleVariants: () => '',
  Resizable: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
  ResizeHandle: () => null,
}));

describe('ImageElement', () => {
  beforeEach(() => {
    selectionMock.mockReset();
    useDraggableMock.mockReset();
    useEditorSelectorMock.mockReset();
    useMediaStateMock.mockReset();

    selectionMock.mockReturnValue(null);
    useDraggableMock.mockReturnValue({
      handleRef: undefined,
      isDragging: false,
    });
    useEditorSelectorMock.mockImplementation(
      (selector: (editor: unknown) => unknown) =>
        selector({ read: { selection: selectionMock } })
    );
    useMediaStateMock.mockImplementation(() => {
      const selection = selectionMock();

      return {
        align: 'center',
        focused: true,
        readOnly: false,
        selected: selection?.kind === 'node' && selection.path?.[0] === 0,
      };
    });
  });

  afterAll(() => {
    mock.restore();
  });

  const renderImage = async () => {
    const { ImageElement } = await import(
      `./media-image-node?test=${Math.random().toString(36).slice(2)}`
    );

    return render(
      <ImageElement
        attributes={{}}
        editor={{ read: { selection: selectionMock } } as any}
        element={{ children: [{ text: '' }], type: 'img', url: '/image.png' }}
        path={[0]}
        slots={
          {
            contentBoundary: () => <span data-testid="caption-boundary" />,
          } as any
        }
      >
        <span data-testid="caption-content" />
      </ImageElement>
    );
  };

  it('uses NodeSelection for the asset ring and toolbar', async () => {
    selectionMock.mockReturnValue({
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 0, path: [0, 0] },
      kind: 'node',
      path: [0],
    });

    const view = await renderImage();

    expect(view.getByTestId('image').className).toContain('ring-2');
    expect(view.getByTestId('media-toolbar').dataset.selected).toBe('true');
    expect(view.container.querySelector('figcaption')).toBeTruthy();
    expect(view.getAllByTestId('caption-content')).toHaveLength(1);
  });

  it('keeps caption focus separate from asset selection', async () => {
    selectionMock.mockReturnValue({
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 0, path: [0, 0] },
      kind: 'text',
    });

    const view = await renderImage();

    expect(view.getByTestId('image').className).not.toContain('ring-2');
    expect(view.getByTestId('media-toolbar').dataset.selected).toBe('false');
    expect(view.container.querySelector('figcaption')).toBeTruthy();
    expect(view.getAllByTestId('caption-content')).toHaveLength(1);
  });

  it('hides an inactive empty caption through the model boundary', async () => {
    const view = await renderImage();

    expect(view.container.querySelector('figcaption')).toBeNull();
    expect(view.queryByTestId('caption-content')).toBeNull();
    expect(view.getByTestId('caption-boundary')).toBeTruthy();
  });
});
