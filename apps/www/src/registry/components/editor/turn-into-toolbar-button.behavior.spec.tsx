import {
  afterAll,
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  mock,
} from 'bun:test';

import { act, cleanup, fireEvent, render } from '@testing-library/react';
import {
  BaseParagraphPlugin,
  BaseHeadingPlugin,
  BaseListPlugin,
  definePlugin,
  schema,
  SelectionApi,
  type Selection,
  type Value,
} from 'platejs';
import { BaseCalloutPlugin } from 'platejs/callout';
import { BaseColumnPlugin } from 'platejs/layout';
import { CodeBlockPlugin, createEditor, EditorRoot } from 'platejs/react';
import { BaseTablePlugin } from 'platejs/table';
import * as React from 'react';

import { BaseBasicBlocksKit } from './basic-blocks-static';
import { BaseDetailsKit } from './details-static';
import { BaseListKit } from './list-static';

const RadioContext = React.createContext<{
  onValueChange: (value: string) => void;
  value: string;
}>({ onValueChange: () => {}, value: '' });

let currentEditor: ReturnType<typeof createEditor>;

mock.module('@/registry/components/editor/dropdown-menu', () => ({
  DropdownMenu: ({ children }: React.PropsWithChildren) => <>{children}</>,
  DropdownMenuCheckboxItem: ({
    children,
    checked,
    disabled,
    onSelect,
  }: React.PropsWithChildren<{
    checked?: boolean;
    disabled?: boolean;
    onSelect?: () => void;
  }>) => (
    <button
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onSelect?.()}
      role="menuitemcheckbox"
      type="button"
    >
      {children}
    </button>
  ),
  DropdownMenuContent: ({ children }: React.PropsWithChildren) => (
    <div>{children}</div>
  ),
  DropdownMenuRadioGroup: ({
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
  DropdownMenuRadioItem: ({
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
  DropdownMenuTrigger: ({ children }: React.PropsWithChildren) => (
    <>{children}</>
  ),
}));

mock.module('@/registry/components/editor/toolbar', () => ({
  ToolbarButton: ({
    children,
    isDropdown: _isDropdown,
    pressed: _pressed,
    tooltip: _tooltip,
    ...props
  }: React.ComponentProps<'button'> & {
    isDropdown?: boolean;
    pressed?: boolean;
    tooltip?: React.ReactNode;
  }) => (
    <button type="button" {...props}>
      {children}
    </button>
  ),
  ToolbarMenuGroup: ({ children }: React.PropsWithChildren) => (
    <div>{children}</div>
  ),
}));

const createTestEditor = ({
  selection = SelectionApi.nodes([[0], [2]], { mode: 'block' }),
  initialValue = ['one', 'middle', 'three'].map((text) => ({
    children: [{ text }],
    type: 'paragraph',
  })),
}: Partial<{
  initialValue: Value;
  selection: Selection;
}> = {}) =>
  createEditor({
    plugins: [
      ...BaseBasicBlocksKit,
      ...BaseListKit,
      ...BaseDetailsKit,
      CodeBlockPlugin,
      BaseColumnPlugin,
    ],
    selection,
    initialValue,
  });

async function renderTurnInto() {
  const { TurnIntoToolbarButton } = await import(
    `./turn-into-toolbar-button?test=${Math.random().toString(36).slice(2)}`
  );

  return render(
    <EditorRoot editor={currentEditor}>
      <TurnIntoToolbarButton />
    </EditorRoot>
  );
}

async function renderDetailsToolbar() {
  const { DetailsToolbarButton } = await import(
    `./details-toolbar-button?test=${Math.random().toString(36).slice(2)}`
  );

  return render(
    <EditorRoot editor={currentEditor}>
      <DetailsToolbarButton />
    </EditorRoot>
  );
}

afterEach(cleanup);

afterAll(() => {
  mock.restore();
});

describe('turn into menu behavior', () => {
  it('publishes no preparatory formatting when Details conversion refuses', async () => {
    const initialValue: Value = [
      { type: 'heading', level: 2, children: [{ text: 'Heading' }] },
      {
        type: 'details',
        children: [
          { type: 'summary', children: [{ text: 'Title' }] },
          { type: 'callout', children: [{ text: 'Body' }] },
        ],
      },
    ];
    currentEditor = createEditor({
      plugins: [
        BaseHeadingPlugin,
        ...BaseDetailsKit,
        BaseCalloutPlugin,
        BaseListPlugin.configure({
          targetPlugins: [BaseParagraphPlugin, BaseHeadingPlugin],
        }),
      ],
      initialValue,
      selection: SelectionApi.nodes([[0], [1, 0]], { mode: 'block' }),
    });
    const before = currentEditor.read.children();
    const view = await renderTurnInto();
    const commit = currentEditor.read.lastCommit();
    fireEvent.click(view.getByRole('radio', { name: 'Bulleted list' }));
    expect(currentEditor.read.children()).toEqual(before);
    expect(currentEditor.read.lastCommit()).toBe(commit);
  });

  it('keeps a body list item when Quote is refused on its Details title', async () => {
    currentEditor = createTestEditor({
      initialValue: [
        {
          type: 'details',
          children: [
            { type: 'summary', children: [{ text: 'Title' }] },
            {
              type: 'paragraph',
              indent: 1,
              listType: 'bulleted',
              children: [{ text: 'Item' }],
            },
          ],
        },
      ],
      selection: {
        kind: 'text',
        anchor: { path: [0, 0, 0], offset: 0 },
        focus: { path: [0, 1, 0], offset: 4 },
      },
    });
    const before = currentEditor.read.children();
    const view = await renderTurnInto();
    fireEvent.click(view.getByRole('menuitemcheckbox', { name: 'Quote' }));
    expect(currentEditor.read.children()).toEqual(before);
  });

  it('converts a title and body range to a list without resetting the body to Summary', async () => {
    currentEditor = createTestEditor({
      initialValue: [
        {
          type: 'details',
          children: [
            { type: 'summary', children: [{ text: 'Outer' }] },
            {
              type: 'details',
              children: [
                { type: 'summary', children: [{ text: 'Title' }] },
                { type: 'paragraph', children: [{ text: 'Body' }] },
              ],
            },
          ],
        },
      ],
      selection: {
        kind: 'text',
        anchor: { path: [0, 1, 0, 0], offset: 0 },
        focus: { path: [0, 1, 1, 0], offset: 4 },
      },
    });
    const view = await renderTurnInto();
    fireEvent.click(view.getByRole('radio', { name: 'Bulleted list' }));
    expect(currentEditor.read.children()).toMatchObject([
      {
        type: 'details',
        children: [
          { type: 'summary', children: [{ text: 'Outer' }] },
          {
            type: 'paragraph',
            listType: 'bulleted',
            indent: 1,
            children: [{ text: 'Title' }],
          },
          {
            type: 'paragraph',
            listType: 'bulleted',
            indent: 2,
            children: [{ text: 'Body' }],
          },
        ],
      },
    ]);
  });

  it.each([
    ['offers', 'a title alone', { path: [0, 0, 0], offset: 5 }, false],
    ['disables', 'a title with its body', { path: [0, 1, 0], offset: 4 }, true],
  ])('%s Code for %s', async (_, __, focus, disabled) => {
    currentEditor = createTestEditor({
      initialValue: [
        {
          type: 'details',
          children: [
            { type: 'summary', children: [{ text: 'Title' }] },
            { type: 'paragraph', children: [{ text: 'Body' }] },
          ],
        },
      ],
      selection: {
        kind: 'text',
        anchor: { path: [0, 0, 0], offset: 0 },
        focus,
      },
    });
    const view = await renderTurnInto();

    expect(
      (
        view.getByRole('menuitemcheckbox', {
          name: 'Code',
        }) as HTMLButtonElement
      ).disabled
    ).toBe(disabled);
  });

  it('turns a code block into a paragraph list item', async () => {
    currentEditor = createTestEditor({
      initialValue: [{ type: 'codeBlock', children: [{ text: 'code' }] }],
      selection: {
        kind: 'text',
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 0 },
      },
    });
    const view = await renderTurnInto();

    fireEvent.click(view.getByRole('radio', { name: 'Bulleted list' }));

    expect(currentEditor.read.children()).toMatchObject([
      {
        children: [{ text: 'code' }],
        indent: 1,
        listType: 'bulleted',
        type: 'paragraph',
      },
    ]);
  });

  it('keeps the heading a slot requires when it becomes a list item', async () => {
    const HeadingSlot = definePlugin('headingSlot', {
      dependencies: [BaseHeadingPlugin],
      schema: {
        element: {
          blockContent: true,
          content: schema.content.prefix(
            [{ element: 'heading', properties: { level: 1 } }],
            schema.content.group('block')
          ),
        },
      },
    });
    const initialValue: Value = [
      {
        type: 'headingSlot',
        children: [
          { type: 'heading', level: 1, children: [{ text: 'Title' }] },
          { type: 'paragraph', children: [{ text: 'Body' }] },
        ],
      },
    ];
    currentEditor = createEditor({
      plugins: [...BaseBasicBlocksKit, ...BaseListKit, HeadingSlot],
      initialValue,
      selection: {
        kind: 'text',
        anchor: { path: [0, 0, 0], offset: 0 },
        focus: { path: [0, 0, 0], offset: 0 },
      },
    });
    const view = await renderTurnInto();

    fireEvent.click(view.getByRole('radio', { name: 'Bulleted list' }));

    expect(currentEditor.read.children()[0].children[0]).toMatchObject({
      children: [{ text: 'Title' }],
      level: 1,
      listType: 'bulleted',
      type: 'heading',
    });
  });

  beforeEach(() => {
    currentEditor = createTestEditor();
  });

  it('keeps disjoint leaf conversion exact and disables range-owned structures', async () => {
    const before = currentEditor.read.children();
    const view = await renderTurnInto();

    expect(
      (
        view.getByRole('menuitemcheckbox', {
          name: 'Details',
        }) as HTMLButtonElement
      ).disabled
    ).toBe(true);
    expect(
      (
        view.getByRole('menuitemcheckbox', {
          name: '3 columns',
        }) as HTMLButtonElement
      ).disabled
    ).toBe(true);
    expect(
      (
        view.getByRole('menuitemcheckbox', {
          name: 'Quote',
        }) as HTMLButtonElement
      ).disabled
    ).toBe(false);
    expect(view.queryByText('Code Drawing')).toBeNull();

    fireEvent.click(view.getByRole('radio', { name: 'Heading 2' }));

    expect(currentEditor.read.children()).toMatchObject([
      { children: [{ text: 'one' }], level: 2, type: 'heading' },
      before[1],
      { children: [{ text: 'three' }], level: 2, type: 'heading' },
    ]);

    act(() => {
      currentEditor.api.history.undo();
    });
    expect(currentEditor.read.children()).toEqual(before);
  });

  it('codes each block of a sparse block selection and leaves the block between them', async () => {
    const middle = currentEditor.read.children()[1];
    const view = await renderTurnInto();

    fireEvent.click(view.getByRole('menuitemcheckbox', { name: 'Code' }));

    expect(currentEditor.read.children()).toMatchObject([
      { children: [{ text: 'one' }], type: 'codeBlock' },
      middle,
      { children: [{ text: 'three' }], type: 'codeBlock' },
    ]);
  });

  it('uses the schema reset for exact list-to-text conversion', async () => {
    currentEditor = createTestEditor({
      initialValue: [0, 1, 2].map((index) => ({
        checked: true,
        children: [{ text: String(index) }],
        indent: 2,
        listType: 'task',
        type: 'paragraph',
      })),
    });
    const middle = currentEditor.read.children()[1];
    const view = await renderTurnInto();

    fireEvent.click(view.getByRole('radio', { name: 'Text' }));

    expect(currentEditor.read.children()).toMatchObject([
      { children: [{ text: '0' }], type: 'paragraph' },
      middle,
      { children: [{ text: '2' }], type: 'paragraph' },
    ]);
    expect(currentEditor.read.children()[0]).not.toHaveProperty('listType');
    expect(currentEditor.read.children()[0]).not.toHaveProperty('checked');
    expect(currentEditor.read.children()[2]).not.toHaveProperty('indent');
  });

  it('formats selected table-cell content and disables invalid wrappers', async () => {
    const initialValue: Value = [
      {
        children: [
          {
            children: [
              {
                children: [{ children: [{ text: 'one' }], type: 'paragraph' }],
                type: 'tableCell',
              },
              {
                children: [{ children: [{ text: 'two' }], type: 'paragraph' }],
                type: 'tableCell',
              },
            ],
            type: 'tableRow',
          },
        ],
        type: 'table',
      },
    ];

    currentEditor = createEditor({
      plugins: [
        ...BaseBasicBlocksKit,
        ...BaseListKit,
        ...BaseDetailsKit,
        CodeBlockPlugin,
        BaseColumnPlugin,
        BaseTablePlugin,
      ],
      initialValue,
      selection: SelectionApi.nodes(
        [
          [0, 0, 0],
          [0, 0, 1],
        ],
        { mode: 'block' }
      ),
    });
    expect(
      currentEditor.read.nodes
        .blocks({ mode: 'highest' })
        .map(([, path]) => path)
    ).toEqual([[0]]);
    expect(
      currentEditor.read.nodes
        .blocks({ mode: 'lowest' })
        .map(([, path]) => path)
    ).toEqual([
      [0, 0, 0, 0],
      [0, 0, 1, 0],
    ]);
    const view = await renderTurnInto();

    act(() => {
      currentEditor.update.selection.setNodes([
        [0, 0, 0],
        [0, 0, 1],
      ]);
    });
    expect(
      currentEditor.read.selection.nodes().map(([, path]) => path)
    ).toEqual([
      [0, 0, 0],
      [0, 0, 1],
    ]);

    expect(
      (
        view.getByRole('menuitemcheckbox', {
          name: 'Details',
        }) as HTMLButtonElement
      ).disabled
    ).toBe(true);
    expect(
      (
        view.getByRole('menuitemcheckbox', {
          name: '3 columns',
        }) as HTMLButtonElement
      ).disabled
    ).toBe(true);
    const detailsView = await renderDetailsToolbar();
    const detailsButton = detailsView.container.querySelector('button');

    expect(detailsButton?.disabled).toBe(true);

    fireEvent.click(view.getByRole('radio', { name: 'Heading 2' }));

    expect(currentEditor.read.nodes.get([0, 0, 0, 0])?.[0]).toMatchObject({
      children: [{ text: 'one' }],
      level: 2,
      type: 'heading',
    });
    expect(currentEditor.read.nodes.get([0, 0, 1, 0])?.[0]).toMatchObject({
      children: [{ text: 'two' }],
      level: 2,
      type: 'heading',
    });

    act(() => {
      currentEditor.api.history.undo();
    });
    fireEvent.click(view.getByRole('radio', { name: 'Bulleted list' }));

    expect(currentEditor.read.nodes.get([0, 0, 0, 0])?.[0]).toMatchObject({
      children: [{ text: 'one' }],
      indent: 1,
      listType: 'bulleted',
      type: 'paragraph',
    });
    expect(currentEditor.read.nodes.get([0, 0, 1, 0])?.[0]).toMatchObject({
      children: [{ text: 'two' }],
      indent: 1,
      listType: 'bulleted',
      type: 'paragraph',
    });
  });

  it('keeps an already-active leaf radio action as a no-op', async () => {
    currentEditor = createTestEditor({
      initialValue: [
        { children: [{ text: 'heading' }], level: 2, type: 'heading' },
      ],
      selection: {
        kind: 'text',
        anchor: { offset: 2, path: [0, 0] },
        focus: { offset: 2, path: [0, 0] },
      },
    });
    const commit = currentEditor.read.lastCommit();
    const view = await renderTurnInto();

    fireEvent.click(view.getByRole('radio', { name: 'Heading 2' }));

    expect(currentEditor.read.lastCommit()).toBe(commit);
    expect(currentEditor.read.children()).toEqual([
      { children: [{ text: 'heading' }], level: 2, type: 'heading' },
    ]);
  });

  it('drops the bullet when a bulleted heading takes its own level', async () => {
    currentEditor = createTestEditor({
      initialValue: [
        {
          children: [{ text: 'one' }],
          indent: 1,
          level: 2,
          listType: 'bulleted',
          type: 'heading',
        },
      ],
      selection: SelectionApi.nodes([[0]], { mode: 'block' }),
    });
    const view = await renderTurnInto();

    fireEvent.click(view.getByRole('radio', { name: 'Heading 2' }));

    expect(currentEditor.read.children()).toEqual([
      { children: [{ text: 'one' }], level: 2, type: 'heading' },
    ]);
  });

  it.each([false, true])(
    'turns a leveled title into a plain title through Text (Heading installed: %p)',
    async (headingInstalled) => {
      const initialValue: Value = [
        {
          children: [
            { children: [{ text: 'Title' }], level: 2, type: 'summary' },
            { children: [{ text: 'Body' }], type: 'paragraph' },
          ],
          type: 'details',
        },
      ];

      currentEditor = createEditor({
        plugins: [
          ...(headingInstalled ? BaseBasicBlocksKit : [BaseParagraphPlugin]),
          ...BaseListKit,
          ...BaseDetailsKit,
        ],
        initialValue,
        selection: {
          kind: 'text',
          anchor: { offset: 2, path: [0, 0, 0] },
          focus: { offset: 2, path: [0, 0, 0] },
        },
      });
      const view = await renderTurnInto();

      fireEvent.click(view.getByRole('radio', { name: 'Text' }));

      expect(currentEditor.read.children()).toEqual([
        {
          children: [
            { children: [{ text: 'Title' }], type: 'summary' },
            { children: [{ text: 'Body' }], type: 'paragraph' },
          ],
          type: 'details',
        },
      ]);
    }
  );

  it('offers Details for one contiguous sibling run and wraps it once', async () => {
    currentEditor = createTestEditor({
      selection: SelectionApi.nodes([[0], [1]], { mode: 'block' }),
    });
    const view = await renderTurnInto();
    const details = view.getByRole('menuitemcheckbox', { name: 'Details' });

    expect((details as HTMLButtonElement).disabled).toBe(false);
    fireEvent.click(details);

    expect(currentEditor.read.children()).toMatchObject([
      {
        children: [
          { children: [{ text: 'one' }], type: 'summary' },
          { children: [{ text: 'middle' }], type: 'paragraph' },
        ],
        type: 'details',
      },
      { children: [{ text: 'three' }], type: 'paragraph' },
    ]);
  });

  it('unwraps the exact active Details ancestor', async () => {
    currentEditor = createTestEditor({
      initialValue: [
        {
          children: [
            { children: [{ text: 'summary' }], type: 'summary' },
            { children: [{ text: 'body' }], type: 'paragraph' },
          ],
          type: 'details',
        },
        { children: [{ text: 'after' }], type: 'paragraph' },
      ],
      selection: SelectionApi.nodes([[0, 1]], { mode: 'block' }),
    });
    const view = await renderTurnInto();
    const details = view.getByRole('menuitemcheckbox', { name: 'Details' });

    expect(details).toHaveAttribute('aria-checked', 'true');
    fireEvent.click(details);

    expect(currentEditor.read.children()).toMatchObject([
      { children: [{ text: 'summary' }], type: 'paragraph' },
      { children: [{ text: 'body' }], type: 'paragraph' },
      { children: [{ text: 'after' }], type: 'paragraph' },
    ]);
  });

  it('unwraps both Details for a range across sibling Details', async () => {
    const details = (title: string) => ({
      children: [
        { children: [{ text: title }], type: 'summary' },
        { children: [{ text: title.toLowerCase() }], type: 'paragraph' },
      ],
      type: 'details',
    });
    currentEditor = createTestEditor({
      initialValue: [details('A'), details('B')],
      selection: {
        anchor: { offset: 0, path: [0, 1, 0] },
        focus: { offset: 1, path: [1, 1, 0] },
        kind: 'text',
      },
    });
    const view = await renderTurnInto();
    const item = view.getByRole('menuitemcheckbox', { name: 'Details' });

    expect(item).toHaveAttribute('aria-checked', 'true');
    fireEvent.click(item);

    expect(currentEditor.read.children()).toMatchObject(
      ['A', 'a', 'B', 'b'].map((text) => ({
        children: [{ text }],
        type: 'paragraph',
      }))
    );
  });

  it('unwraps the inner Details from its title without removing the outer Details', async () => {
    currentEditor = createTestEditor({
      initialValue: [
        {
          type: 'details',
          children: [
            { type: 'summary', children: [{ text: 'Outer' }] },
            {
              type: 'details',
              children: [
                { type: 'summary', children: [{ text: 'Inner' }] },
                { type: 'paragraph', children: [{ text: 'Body' }] },
              ],
            },
          ],
        },
      ],
      selection: {
        kind: 'text',
        anchor: { path: [0, 1, 0, 0], offset: 2 },
        focus: { path: [0, 1, 0, 0], offset: 2 },
      },
    });
    const view = await renderTurnInto();
    const item = view.getByRole('menuitemcheckbox', { name: 'Details' });

    expect(item).toHaveAttribute('aria-checked', 'true');
    expect((item as HTMLButtonElement).disabled).toBe(false);
    fireEvent.click(item);

    expect(currentEditor.read.children()).toEqual([
      {
        type: 'details',
        children: [
          { type: 'summary', children: [{ text: 'Outer' }] },
          { type: 'paragraph', children: [{ text: 'Inner' }] },
          { type: 'paragraph', children: [{ text: 'Body' }] },
        ],
      },
    ]);
  });
});
