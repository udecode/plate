import * as React from 'react';

import * as actualCoreReact from '@platejs/core/react';
import * as actualDnd from '@platejs/dnd';
import * as actualMediaReact from '@platejs/media/react';
import { render } from '@testing-library/react';
import { afterAll, beforeEach, describe, expect, it, mock } from 'bun:test';

const selectionMock = mock();
const useEditorSelectorMock = mock();
const useMediaStateMock = mock();
const useDraggableMock = mock();

mock.module('@platejs/dnd', () => ({
  ...actualDnd,
  useDraggable: useDraggableMock,
}));

mock.module('@platejs/media/react', () => ({
  ...actualMediaReact,
  Image: ({ className }: React.ComponentProps<'img'>) => (
    <img className={className} data-testid="image" alt="" />
  ),
  ImagePlugin: { name: 'image' },
  useMediaState: useMediaStateMock,
}));

mock.module('@platejs/resizable', () => ({
  ResizableProvider: ({ children }: React.PropsWithChildren) => <>{children}</>,
  useResizableValue: () => '100%',
}));

mock.module('platejs/react', () => ({
  ...actualCoreReact,
  PlateElement: ({ children }: React.PropsWithChildren) => (
    <div data-testid="plate-element">{children}</div>
  ),
  useEditor: () => ({
    plugin: () => ({ update: { set: () => {} } }),
    read: { selection: selectionMock },
  }),
  useEditorMounted: () => true,
  useEditorReadOnly: () => false,
  useEditorSelector: (selector: (editor: unknown) => unknown) =>
    useEditorSelectorMock(selector),
  useElement: () => ({ children: [{ text: '' }], type: 'image' }),
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
  withResizableProvider: (Component: React.ComponentType) => Component,
}));

describe('ImageElement', () => {
  beforeEach(() => {
    selectionMock.mockReset();
    useEditorSelectorMock.mockReset();
    useMediaStateMock.mockReset();
    useDraggableMock.mockReset();

    selectionMock.mockReturnValue(null);
    useDraggableMock.mockReturnValue({});
    useEditorSelectorMock.mockImplementation(
      (selector: (editor: unknown) => unknown) =>
        selector({ read: { selection: selectionMock } })
    );
    useMediaStateMock.mockImplementation(() => {
      const selection = selectionMock();

      return {
        focused: true,
        readOnly: false,
        selected: selection?.kind === 'node' && selection.path?.[0] === 0,
        textAlign: 'center',
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
        element={{ children: [{ text: '' }], type: 'image', url: '/image.png' }}
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
