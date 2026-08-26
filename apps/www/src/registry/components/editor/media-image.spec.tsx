import { afterAll, beforeEach, describe, expect, it, mock } from 'bun:test';

import * as actualCoreReact from '@platejs/core/react';
import * as actualDnd from '@platejs/dnd';
import { render } from '@testing-library/react';
import * as React from 'react';

const selectionMock = mock();
const useEditorSelectorMock = mock();
const useDraggableMock = mock();
const usePluginStoreMock = mock();

mock.module('@platejs/dnd', () => ({
  ...actualDnd,
  useDraggable: useDraggableMock,
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
  useEditorFocused: () => true,
  useEditorReadOnly: () => false,
  useEditorSelector: (selector: (editor: unknown) => unknown) =>
    useEditorSelectorMock(selector),
  useElement: () => ({ children: [{ text: '' }], type: 'image' }),
  useElementSelected: () => {
    const selection = selectionMock();

    return (
      selection?.kind === 'node' &&
      selection.paths?.some((path: number[]) => path[0] === 0)
    );
  },
  usePluginStore: usePluginStoreMock,
  usePath: () => [0],
}));

mock.module('@/lib/utils', () => ({
  cn: (...values: Array<string | false | null | undefined>) =>
    values.filter(Boolean).join(' '),
}));

mock.module('./media-toolbar', () => ({
  MediaToolbar: ({
    children,
    disabled,
    selected,
  }: React.PropsWithChildren<{ disabled?: boolean; selected: boolean }>) => (
    <div
      data-disabled={disabled}
      data-testid="media-toolbar"
      data-selected={selected}
    >
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
    useEditorSelectorMock.mockReset();
    useDraggableMock.mockReset();
    usePluginStoreMock.mockReset();

    selectionMock.mockReturnValue(null);
    useDraggableMock.mockReturnValue({});
    usePluginStoreMock.mockReturnValue(false);
    useEditorSelectorMock.mockImplementation(
      (selector: (editor: unknown) => unknown) =>
        selector({ read: { selection: selectionMock } })
    );
  });

  afterAll(() => {
    mock.restore();
  });

  const renderImage = async () => {
    const { ImageElement } = await import(
      `./media-image?test=${Math.random().toString(36).slice(2)}`
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
      paths: [[0]],
    });

    const view = await renderImage();

    expect(view.container.querySelector('img')?.className).toContain('ring-2');
    expect(view.container.querySelector('img')?.getAttribute('src')).toBe(
      '/image.png'
    );
    expect(view.getByTestId('media-toolbar').dataset.selected).toBe('true');
    expect(view.container.querySelector('figcaption')).toBeTruthy();
    expect(view.getAllByTestId('caption-content')).toHaveLength(1);
  });

  it('disables only the image toolbar while previewing', async () => {
    usePluginStoreMock.mockReturnValue(true);

    const view = await renderImage();

    expect(view.getByTestId('media-toolbar').dataset.disabled).toBe('true');
  });

  it('keeps caption focus separate from asset selection', async () => {
    selectionMock.mockReturnValue({
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 0, path: [0, 0] },
      kind: 'text',
    });

    const view = await renderImage();

    expect(view.container.querySelector('img')?.className).not.toContain(
      'ring-2'
    );
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
