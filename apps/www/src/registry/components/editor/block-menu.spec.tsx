import {
  afterAll,
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  mock,
} from 'bun:test';

import { cleanup, fireEvent, render } from '@testing-library/react';
import { BaseIndentPlugin, BaseTextAlignPlugin, SelectionApi } from 'platejs';
import { createEditor, EditorRoot } from 'platejs/react';
import * as React from 'react';

import { BaseBasicBlocksKit } from './basic-blocks-static';

const RadioContext = React.createContext<(value: string) => void>(() => {});

mock.module('@/registry/components/editor/context-menu', () => ({
  ContextMenu: ({ children }: React.PropsWithChildren) => <>{children}</>,
  ContextMenuCheckboxItem: ({
    children,
    onSelect,
  }: React.PropsWithChildren<{ onSelect?: () => void }>) => (
    <button onClick={() => onSelect?.()} type="button">
      {children}
    </button>
  ),
  ContextMenuContent: ({ children }: React.PropsWithChildren) => (
    <div>{children}</div>
  ),
  ContextMenuGroup: ({ children }: React.PropsWithChildren) => (
    <div>{children}</div>
  ),
  ContextMenuItem: ({
    children,
    disabled,
    onClick,
  }: React.PropsWithChildren<{
    disabled?: boolean;
    onClick?: () => void;
  }>) => (
    <button disabled={disabled} onClick={onClick} type="button">
      {children}
    </button>
  ),
  ContextMenuRadioGroup: ({
    children,
    onValueChange,
  }: React.PropsWithChildren<{
    onValueChange: (value: string) => void;
  }>) => <RadioContext value={onValueChange}>{children}</RadioContext>,
  ContextMenuRadioItem: ({
    children,
    value,
  }: React.PropsWithChildren<{ value: string }>) => {
    const onValueChange = React.use(RadioContext);

    return (
      <button onClick={() => onValueChange(value)} type="button">
        {children}
      </button>
    );
  },
  ContextMenuSub: ({ children }: React.PropsWithChildren) => (
    <div>{children}</div>
  ),
  ContextMenuSubContent: ({ children }: React.PropsWithChildren) => (
    <div>{children}</div>
  ),
  ContextMenuSubTrigger: ({
    children,
    disabled,
  }: React.PropsWithChildren<{ disabled?: boolean }>) => (
    <button disabled={disabled} type="button">
      {children}
    </button>
  ),
  ContextMenuTrigger: ({ children }: React.PropsWithChildren) => (
    <>{children}</>
  ),
}));

const createTestEditor = () =>
  createEditor({
    plugins: [...BaseBasicBlocksKit, BaseIndentPlugin, BaseTextAlignPlugin],
    initialValue: ['one', 'middle', 'three'].map((text) => ({
      children: [{ text }],
      type: 'paragraph',
    })),
    selection: SelectionApi.nodes([[0], [2]]),
  });

let currentEditor: ReturnType<typeof createTestEditor>;

async function renderBlockMenu() {
  const { BlockContextMenu } = await import(
    `./block-menu?test=${Math.random().toString(36).slice(2)}`
  );

  return render(
    <EditorRoot<typeof currentEditor> editor={currentEditor}>
      <BlockContextMenu>
        <div>Editor</div>
      </BlockContextMenu>
    </EditorRoot>
  );
}

beforeEach(() => {
  currentEditor = createTestEditor();
});

afterEach(cleanup);

afterAll(() => {
  mock.restore();
});

describe('block menu commands', () => {
  it('applies alignment and indentation to exact disjoint membership', async () => {
    const before = currentEditor.read.children();
    const version = currentEditor.read.lastCommit()?.version ?? 0;
    const view = await renderBlockMenu();

    fireEvent.click(view.getByRole('button', { name: 'Center' }));

    expect(currentEditor.read.children()).toMatchObject([
      { textAlign: 'center' },
      before[1],
      { textAlign: 'center' },
    ]);
    expect(currentEditor.read.lastCommit()?.version).toBe(version + 1);

    fireEvent.click(view.getByRole('button', { name: 'Indent' }));

    expect(currentEditor.read.children()).toMatchObject([
      { indent: 1, textAlign: 'center' },
      before[1],
      { indent: 1, textAlign: 'center' },
    ]);
    expect(currentEditor.read.lastCommit()?.version).toBe(version + 2);

    currentEditor.api.history.undo();
    currentEditor.api.history.undo();
    expect(currentEditor.read.children()).toEqual(before);
  });

  it('omits unavailable AI and unsupported Code Drawing conversion', async () => {
    const view = await renderBlockMenu();

    expect(view.queryByRole('button', { name: 'Ask AI' })).toBeNull();
    expect(view.queryByText('Code Drawing')).toBeNull();
  });
});
