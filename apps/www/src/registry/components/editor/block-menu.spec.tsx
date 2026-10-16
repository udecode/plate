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
import {
  BaseIndentPlugin,
  BaseParagraphPlugin,
  BaseTextAlignPlugin,
  SelectionApi,
  type Value,
} from 'platejs';
import { BaseDetailsPlugin, BaseDetailsSummaryPlugin } from 'platejs/details';
import { createEditor, EditorRoot } from 'platejs/react';
import * as React from 'react';

import { BaseBasicBlocksKit } from './basic-blocks-static';

const RadioContext = React.createContext<{
  onValueChange: (value: string) => void;
  value: string;
}>({ onValueChange: () => {}, value: '' });

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
    value,
  }: React.PropsWithChildren<{
    onValueChange: (value: string) => void;
    value: string;
  }>) => {
    const contextValue = React.useMemo(
      () => ({ onValueChange, value }),
      [onValueChange, value]
    );

    return <RadioContext value={contextValue}>{children}</RadioContext>;
  },
  ContextMenuRadioItem: ({
    children,
    value,
  }: React.PropsWithChildren<{ value: string }>) => {
    const radio = React.use(RadioContext);

    return (
      <button
        aria-checked={radio.value === value}
        onClick={() => radio.onValueChange(value)}
        role="radio"
        type="button"
      >
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
    selection: SelectionApi.nodes([[0], [2]], { mode: 'block' }),
  });

let currentEditor: ReturnType<typeof createTestEditor>;

async function renderBlockMenu<E>(editor: E) {
  const { BlockContextMenu } = await import(
    `./block-menu?test=${Math.random().toString(36).slice(2)}`
  );

  return render(
    <EditorRoot editor={editor}>
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
    const view = await renderBlockMenu(currentEditor);

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

  it('does not read an H4 as Text', async () => {
    const initialValue: Value = [
      { children: [{ text: 'four' }], level: 4, type: 'heading' },
    ];

    const editor = createEditor({
      plugins: [...BaseBasicBlocksKit],
      initialValue,
      selection: SelectionApi.nodes([[0]], { mode: 'block' }),
    });
    const view = await renderBlockMenu(editor);

    expect(view.getByRole('radio', { name: 'Text' })).toHaveAttribute(
      'aria-checked',
      'false'
    );

    fireEvent.click(view.getByRole('radio', { name: 'Text' }));

    expect(editor.read.children()).toEqual([
      { children: [{ text: 'four' }], type: 'paragraph' },
    ]);
  });

  it('turns a leveled title into a plain title through Text without Heading', async () => {
    const initialValue: Value = [
      {
        children: [
          { children: [{ text: 'Title' }], level: 2, type: 'summary' },
          { children: [{ text: 'Body' }], type: 'paragraph' },
        ],
        type: 'details',
      },
    ];

    const editor = createEditor({
      plugins: [
        BaseParagraphPlugin,
        BaseDetailsSummaryPlugin,
        BaseDetailsPlugin,
      ],
      initialValue,
      selection: SelectionApi.nodes([[0, 0]], { mode: 'block' }),
    });
    const view = await renderBlockMenu(editor);

    fireEvent.click(view.getByRole('radio', { name: 'Text' }));

    expect(editor.read.nodes.get([0, 0])?.[0]).toEqual({
      children: [{ text: 'Title' }],
      type: 'summary',
    });
  });

  it('omits unavailable AI and unsupported Code Drawing conversion', async () => {
    const view = await renderBlockMenu(currentEditor);

    expect(view.queryByRole('button', { name: 'Ask AI' })).toBeNull();
    expect(view.queryByText('Code Drawing')).toBeNull();
  });
});
