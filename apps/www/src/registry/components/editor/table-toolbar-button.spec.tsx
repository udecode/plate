import { afterAll, beforeEach, describe, expect, it, mock } from 'bun:test';

import * as actualCoreReact from '@platejs/core/react';
import { fireEvent, render } from '@testing-library/react';
import * as React from 'react';

const focusMock = mock();
const insertRowMock = mock();
const pluginMock = mock(() => ({
  read: {
    selection: () => ({
      anchor: { colSpan: 1, rowSpan: 1 },
      anchors: [],
      complete: true,
    }),
  },
  schema: { type: 'table' },
  update: {
    insert: mock(),
    insertColumn: mock(),
    insertRow: insertRowMock,
    merge: mock(),
    remove: mock(),
    removeColumn: mock(),
    removeRow: mock(),
    split: mock(),
  },
}));

let dropdownOnFinalFocus:
  | ((event: { preventDefault: () => void }) => void)
  | undefined;

const editor = {
  api: { dom: { focus: focusMock } },
  plugin: pluginMock,
  read: {
    nodes: { some: () => true },
    view: { isReadOnly: () => false },
  },
};

mock.module('platejs/react', () => ({
  ...actualCoreReact,
  useEditor: () => editor,
  useEditorSelector: (selector: (currentEditor: typeof editor) => unknown) =>
    selector(editor),
  usePluginStore: () => false,
}));

mock.module('./dropdown-menu', () => ({
  DropdownMenu: ({ children }: React.PropsWithChildren) => <>{children}</>,
  DropdownMenuContent: ({
    children,
    onFinalFocus,
  }: React.PropsWithChildren<{
    onFinalFocus?: (event: { preventDefault: () => void }) => void;
  }>) => {
    dropdownOnFinalFocus = onFinalFocus;

    return <div>{children}</div>;
  },
  DropdownMenuGroup: ({ children }: React.PropsWithChildren) => (
    <div>{children}</div>
  ),
  DropdownMenuItem: ({
    children,
    onSelect,
    ...props
  }: React.PropsWithChildren<
    Omit<React.ComponentProps<'button'>, 'onSelect'> & {
      onSelect?: () => void;
    }
  >) => (
    <button {...props} onClick={onSelect} type="button">
      {children}
    </button>
  ),
  DropdownMenuSub: ({ children }: React.PropsWithChildren) => <>{children}</>,
  DropdownMenuSubContent: ({ children }: React.PropsWithChildren) => (
    <div>{children}</div>
  ),
  DropdownMenuSubTrigger: ({
    children,
    ...props
  }: React.ComponentProps<'button'>) => (
    <button {...props} type="button">
      {children}
    </button>
  ),
  DropdownMenuTrigger: ({ children }: React.PropsWithChildren) => (
    <>{children}</>
  ),
}));

mock.module('@/lib/utils', () => ({
  cn: (...values: Array<string | false | null | undefined>) =>
    values.filter(Boolean).join(' '),
}));

mock.module('./toolbar', () => ({
  ToolbarButton: ({
    children,
    isDropdown: _isDropdown,
    tooltip: _tooltip,
    ...props
  }: React.ComponentProps<'button'> & {
    isDropdown?: boolean;
    tooltip?: React.ReactNode;
  }) => (
    <button {...props} type="button">
      {children}
    </button>
  ),
}));

describe('TableToolbarButton', () => {
  beforeEach(() => {
    dropdownOnFinalFocus = undefined;
    focusMock.mockClear();
    insertRowMock.mockClear();
    pluginMock.mockClear();
  });

  afterAll(() => {
    mock.restore();
  });

  it('restores editor focus after the selected table command closes the menu', async () => {
    const preventDefaultMock = mock();
    const { TableToolbarButton } = await import(
      `./table-toolbar-button?focus=${Math.random().toString(36).slice(2)}`
    );
    const view = render(<TableToolbarButton />);

    fireEvent.click(view.getByRole('button', { name: 'Insert row after' }));

    expect(insertRowMock).toHaveBeenCalledTimes(1);
    expect(focusMock).not.toHaveBeenCalled();

    dropdownOnFinalFocus?.({ preventDefault: preventDefaultMock });

    expect(preventDefaultMock).toHaveBeenCalledTimes(1);
    expect(focusMock).toHaveBeenCalledTimes(1);
    expect(focusMock).toHaveBeenCalledWith();
  });
});
