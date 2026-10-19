import { act, fireEvent, render } from '@testing-library/react';
import React from 'react';
import { hydrateRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';

import {
  createEditorView,
  definePlugin,
  NodeApi,
  PLUGINS,
  schema,
  type Element,
} from '../../../core';
import { EditorElement } from '../../components/plate-nodes';
import { createEditor, EditorRoot, EditorContent } from '../../core';
import {
  BlockquotePlugin,
  HeadingPlugin,
} from '../basic-nodes/BasicNodesPlugins';
import { CodeBlockPlugin } from '../code-block/CodeBlockPlugin';
import { DetailsPlugin } from '../details/DetailsPlugin';
import { IndentPlugin } from '../indent/IndentPlugin';
import { TablePlugin } from '../table/TablePlugin';
import { ListPlugin } from './ListPlugin';

const item = (text: string, extra: Record<string, unknown> = {}) =>
  ({
    children: [{ text }],
    indent: 1,
    listType: 'numbered',
    type: 'paragraph',
    ...extra,
  }) as Element;

const paragraph = (text: string, extra: Record<string, unknown> = {}) =>
  ({ children: [{ text }], type: 'paragraph', ...extra }) as Element;

const mountList = (
  initialValue: Element[],
  { views = 1 }: { views?: number } = {}
) => {
  const editor = createEditor({
    initialValue,
    plugins: [ListPlugin, TablePlugin],
  });
  const { container } = render(
    <EditorRoot editor={editor} suppressInstanceWarning>
      {Array.from({ length: views }, (_, index) => (
        <EditorContent key={index} />
      ))}
    </EditorRoot>
  );
  const numbers = () =>
    [...container.querySelectorAll('ol')].map((list) =>
      Number(list.getAttribute('start'))
    );

  return { editor, numbers };
};

describe('ListPlugin rendering', () => {
  it('renders ordered and unordered list wrappers', () => {
    const initialValue: Element[] = [
      {
        children: [{ text: 'Item' }],
        listStart: 4,
        listStyle: 'decimal',
        listType: 'numbered',
        type: 'paragraph',
      },
      {
        children: [{ text: 'Bullet' }],
        listStyle: 'disc',
        listType: 'bulleted',
        type: 'paragraph',
      },
      {
        children: [{ text: 'Plain' }],
        type: 'paragraph',
      },
    ];
    const editor = createEditor({
      initialValue,
      plugins: [ListPlugin],
    });
    const { container } = render(
      <EditorRoot editor={editor} suppressInstanceWarning>
        <EditorContent readOnly />
      </EditorRoot>
    );

    expect(container.querySelector('ol')?.getAttribute('start')).toBe('4');
    expect(container.querySelector('ol > li')?.textContent).toBe('Item');
    expect(container.querySelector('ul > li')?.textContent).toBe('Bullet');
    expect(container.querySelectorAll('ol, ul')).toHaveLength(2);
    expect(container.textContent).toContain('Plain');
  });
});

describe('ListPlugin live numbering', () => {
  it('renumbers after an insert at the top', () => {
    const { editor, numbers } = mountList([item('A'), item('B')]);

    act(() => {
      editor.update.nodes.insert(item('Z'), { at: [0] });
    });

    expect(numbers()).toEqual([1, 2, 3]);
  });

  it('renumbers after a start change', () => {
    const { editor, numbers } = mountList([item('A'), item('B')]);

    act(() => {
      editor.update.nodes.set({ listStart: 4 }, { at: [0] });
    });

    expect(numbers()).toEqual([4, 5]);
  });

  it('renumbers after a middle paragraph becomes a numbered item', () => {
    const { editor, numbers } = mountList([
      item('A'),
      paragraph('P', { indent: 1 }),
      item('B'),
    ]);

    act(() => {
      editor.update.nodes.set({ listType: 'numbered' }, { at: [1] });
    });

    expect(numbers()).toEqual([1, 2, 3]);
  });

  it('renumbers only the interleaved list an inserted item joins', () => {
    const { editor, numbers } = mountList([
      item('A1', { listId: 'a' }),
      item('B1', { listId: 'b' }),
      item('A2', { listId: 'a' }),
    ]);

    act(() => {
      editor.update.nodes.insert(item('A0', { listId: 'a' }), { at: [0] });
    });

    expect(numbers()).toEqual([1, 2, 1, 3]);
  });

  it('renumbers an item behind a deeper paragraph after it moves', () => {
    const { editor, numbers } = mountList([
      item('A'),
      paragraph('P', { indent: 2 }),
      item('B'),
    ]);

    act(() => {
      editor.update.nodes.insert(item('Z'), { at: [0] });
    });
    act(() => {
      editor.update.nodes.set({ listStart: 5 }, { at: [0] });
    });

    expect(numbers()).toEqual([5, 6, 7]);
  });

  it('renumbers a list inside a table cell', () => {
    const { editor, numbers } = mountList([
      {
        children: [
          {
            children: [{ children: [item('A'), item('B')], type: 'tableCell' }],
            type: 'tableRow',
          },
        ],
        type: 'table',
      },
    ]);

    act(() => {
      editor.update.nodes.insert(item('Z'), { at: [0, 0, 0, 0] });
    });

    expect(numbers()).toEqual([1, 2, 3]);
  });

  it('renumbers every view of the document', () => {
    const { editor, numbers } = mountList([item('A'), item('B')], {
      views: 2,
    });

    act(() => {
      editor.update.nodes.insert(item('Z'), { at: [0] });
    });

    expect(numbers()).toEqual([1, 2, 3, 1, 2, 3]);
  });
});

const startsIn = (container: ParentNode) =>
  [...container.querySelectorAll('ol')].map((list) =>
    Number(list.getAttribute('start'))
  );

const FigurePlugin = definePlugin('figure', {
  component: (props) => (
    <EditorElement {...props}>
      <figcaption>{props.slots.contentRoot('caption')}</figcaption>
      {props.children}
    </EditorElement>
  ),
  schema: {
    element: {
      blockContent: true,
      contentRoots: {
        caption: {
          content: schema.content.types(['paragraph'], {
            default: { type: 'paragraph' },
            min: 1,
          }),
          ownership: 'exclusive',
        },
      },
      void: 'block',
    },
  },
});

describe('ListPlugin view lifecycle', () => {
  it('renders interleaved numbers on the server', () => {
    const editor = createEditor({
      initialValue: [
        item('A1', { listId: 'a' }),
        item('B1', { listId: 'b' }),
        item('A2', { listId: 'a' }),
        item('B2', { listId: 'b' }),
      ],
      plugins: [ListPlugin],
    });
    const html = renderToString(
      <EditorRoot editor={editor} suppressInstanceWarning>
        <EditorContent />
      </EditorRoot>
    );

    expect(
      [...html.matchAll(/<ol[^>]*start="(-?\d+)"/g)].map((match) =>
        Number(match[1])
      )
    ).toEqual([1, 1, 2, 2]);
  });

  it('renumbers after hydrating server markup', async () => {
    const value = [item('A'), item('B')];
    const container = document.createElement('div');

    container.innerHTML = renderToString(
      <EditorRoot
        editor={createEditor({ initialValue: value, plugins: [ListPlugin] })}
        suppressInstanceWarning
      >
        <EditorContent />
      </EditorRoot>
    );
    document.body.append(container);

    const editor = createEditor({ initialValue: value, plugins: [ListPlugin] });

    await act(async () => {
      hydrateRoot(
        container,
        <EditorRoot editor={editor} suppressInstanceWarning>
          <EditorContent />
        </EditorRoot>
      );
    });
    act(() => {
      editor.update.nodes.insert(item('Z'), { at: [0] });
    });

    expect(startsIn(container)).toEqual([1, 2, 3]);
    container.remove();
  });

  it('renumbers an item whose list element was replaced', () => {
    const { editor, numbers } = mountList([item('A'), item('B'), item('C')]);

    act(() => {
      editor.update.nodes.set({ listType: 'bulleted' }, { at: [1] });
    });
    act(() => {
      editor.update.nodes.set({ listType: 'numbered' }, { at: [1] });
    });
    act(() => {
      editor.update.nodes.insert(item('Z'), { at: [0] });
    });

    expect(numbers()).toEqual([1, 2, 3, 4]);
  });

  it('renumbers every mounted list after more commits than the change log keeps', () => {
    const { editor, numbers } = mountList([item('A'), item('B')]);

    act(() => {
      for (let index = 0; index < 70; index += 1) {
        editor.update.nodes.insert(item(`Z${index}`), { at: [0] });
      }
    });

    expect(numbers()).toEqual(
      Array.from({ length: 72 }, (_, index) => index + 1)
    );
  });

  it('keeps renumbering a view after another view detaches', () => {
    const editor = createEditor({
      initialValue: [item('A'), item('B')],
      plugins: [ListPlugin],
    });
    const views = (count: number) => (
      <EditorRoot editor={editor} suppressInstanceWarning>
        {Array.from({ length: count }, (_, index) => (
          <EditorContent key={index} />
        ))}
      </EditorRoot>
    );
    const { container, rerender } = render(views(2));

    rerender(views(1));
    act(() => {
      editor.update.nodes.insert(item('Z'), { at: [0] });
    });

    expect(startsIn(container)).toEqual([1, 2, 3]);
  });

  it('renumbers after a commit inside a transition', async () => {
    const { editor, numbers } = mountList([item('A'), item('B')]);

    await act(async () => {
      React.startTransition(() => {
        editor.update.nodes.insert(item('Z'), { at: [0] });
      });
    });

    expect(numbers()).toEqual([1, 2, 3]);
  });

  it('renumbers a list in a content root', () => {
    const editor = createEditor({
      initialValue: {
        children: [
          {
            childRoots: { caption: 'caption:1' },
            children: [{ text: '' }],
            type: 'figure',
          },
        ],
        roots: { 'caption:1': [item('A'), item('B')] },
      },
      plugins: [ListPlugin, FigurePlugin],
    } as never);
    const { container } = render(
      <EditorRoot editor={editor} suppressInstanceWarning>
        <EditorContent />
      </EditorRoot>
    );

    act(() => {
      createEditorView(editor, { root: 'caption:1' }).update.nodes.insert(
        item('Z'),
        { at: [0] }
      );
    });

    expect(startsIn(container)).toEqual([1, 2, 3]);
  });
});

const pressShiftTab = (
  initialValue: Element[],
  selection: {
    anchor: { offset: number; path: number[] };
    focus: { offset: number; path: number[] };
  }
) => {
  const editor = createEditor({
    initialValue,
    plugins: [
      CodeBlockPlugin,
      ListPlugin.configure({ targetPlugins: ['paragraph', 'codeBlock'] }),
      BlockquotePlugin,
    ],
    selection: { kind: 'text', ...selection },
  } as never);
  const { container } = render(
    <EditorRoot editor={editor} suppressInstanceWarning>
      <EditorContent />
    </EditorRoot>
  );
  const editable = container.querySelector('[contenteditable="true"]');

  if (!editable) throw new Error('Expected editable root');

  fireEvent.keyDown(editable, { code: 'Tab', key: 'Tab', shiftKey: true });

  return editor;
};

const caret = (path: number[], offset = 0) => ({
  anchor: { offset, path },
  focus: { offset, path },
});

describe('ListPlugin keys', () => {
  it('leaves a root numbered item unchanged on Shift+Tab, with no undo step', () => {
    const editor = pressShiftTab([item('A')], caret([0, 0]));

    expect(editor.read.children()).toEqual([item('A')]);
    expect(editor.read.history.hasUndo()).toBe(false);
  });

  it('outdents only the deeper block of a selection that holds a root item', () => {
    const editor = pressShiftTab([item('A'), paragraph('P', { indent: 2 })], {
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 1, path: [1, 0] },
    });

    expect(editor.read.children()).toEqual([
      item('A'),
      paragraph('P', { indent: 1 }),
    ]);
  });

  it('leaves Shift+Tab in a code block list item to the code block [EDIT-CB-STAB-001]', () => {
    const editor = pressShiftTab(
      [
        {
          children: [{ text: '  foo' }],
          indent: 1,
          listType: 'numbered',
          type: 'codeBlock',
        },
      ],
      caret([0, 0], 4)
    );

    expect(editor.read.children()).toEqual([
      {
        children: [{ text: 'foo' }],
        indent: 1,
        listType: 'numbered',
        type: 'codeBlock',
      },
    ]);
  });

  it('outdents every selected block of a quote that holds a root item [EDIT-SEL-STAB-001]', () => {
    const editor = pressShiftTab(
      [
        {
          children: [item('A', { listType: 'bulleted' }), paragraph('P')],
          type: 'blockquote',
        },
      ],
      {
        anchor: { offset: 0, path: [0, 0, 0] },
        focus: { offset: 1, path: [0, 1, 0] },
      }
    );

    expect(editor.read.children()).toEqual([paragraph('A'), paragraph('P')]);
  });

  it('takes a root item out of the list and the quote on Shift+Tab [EDIT-BQ-LIST-STAB-001]', () => {
    const editor = pressShiftTab(
      [
        {
          children: [item('Item', { listType: 'bulleted' })],
          type: 'blockquote',
        },
      ],
      caret([0, 0, 0])
    );

    expect(editor.read.children()).toEqual([paragraph('Item')]);
  });
});

const IndentKeysOff = definePlugin('indentKeysOff', {}).configure({
  override: { [PLUGINS.indent]: { shortcuts: { tab: null, untab: null } } },
});

const mountWithoutIndentKeys = (
  initialValue: Element[],
  selection: {
    anchor: { offset: number; path: number[] };
    focus: { offset: number; path: number[] };
  }
) => {
  const editor = createEditor({
    initialValue,
    plugins: [CodeBlockPlugin, HeadingPlugin, ListPlugin, IndentKeysOff],
    selection: { kind: 'text', ...selection },
  });
  const { container } = render(
    <EditorRoot editor={editor} suppressInstanceWarning>
      <EditorContent />
    </EditorRoot>
  );
  const editable = container.querySelector('[contenteditable="true"]');

  if (!editable) throw new Error('Expected editable root');

  const press = (shiftKey = false) =>
    !fireEvent.keyDown(editable, { code: 'Tab', key: 'Tab', shiftKey });

  return { editor, press };
};

describe('ListPlugin keys without Indent keys', () => {
  it('nests an item whose indent is omitted, and one undo restores it [EDIT-LIST-TAB-001]', () => {
    const { editor, press } = mountWithoutIndentKeys(
      [item('A'), paragraph('B', { listType: 'numbered' })],
      caret([1, 0])
    );

    press();

    const nested = editor.read.children()[1]?.indent;
    const anchor = editor.read.selection()?.anchor;

    editor.api.history.undo();

    expect({ anchor, nested, undone: editor.read.children()[1] }).toEqual({
      anchor: { offset: 0, path: [1, 0] },
      nested: 2,
      undone: paragraph('B', { listType: 'numbered' }),
    });
  });

  it('moves a nested item out one level on Shift+Tab [EDIT-LIST-STAB-001]', () => {
    const { editor, press } = mountWithoutIndentKeys(
      [item('A'), item('B', { indent: 2 })],
      caret([1, 0])
    );

    press(true);

    expect({
      anchor: editor.read.selection()?.anchor,
      children: editor.read.children(),
    }).toEqual({
      anchor: { offset: 0, path: [1, 0] },
      children: [item('A'), item('B')],
    });
  });

  it('raises the paragraph and the item of a range, and leaves a heading outside its targets', () => {
    const heading = { children: [{ text: 'H' }], level: 1, type: 'heading' };
    const { editor, press } = mountWithoutIndentKeys(
      [paragraph('P'), item('A'), heading],
      {
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 1, path: [2, 0] },
      }
    );

    press();

    expect(editor.read.children()).toEqual([
      paragraph('P', { indent: 1 }),
      item('A', { indent: 2 }),
      heading,
    ]);
  });

  it('leaves Tab and Shift+Tab on a range from a code block into an item unhandled', () => {
    const initialValue: Element[] = [
      { children: [{ text: 'code' }], type: 'codeBlock' },
      item('A'),
    ];
    const { editor, press } = mountWithoutIndentKeys(initialValue, {
      anchor: { offset: 1, path: [0, 0] },
      focus: { offset: 1, path: [1, 0] },
    });

    expect({
      handled: [press(), press(true)],
      children: editor.read.children(),
    }).toEqual({ handled: [false, false], children: initialValue });
  });
});

const mountFamily = (
  initialValue: Element[],
  selection: ReturnType<typeof caret>
) => {
  const editor = createEditor({
    initialValue,
    plugins: [
      BlockquotePlugin,
      DetailsPlugin,
      ListPlugin.configure({
        targetPlugins: ['paragraph', 'details', 'blockquote'],
      }),
    ],
    selection: { kind: 'text', ...selection },
  });
  const { container } = render(
    <EditorRoot editor={editor} suppressInstanceWarning>
      <EditorContent />
    </EditorRoot>
  );
  const editable = container.querySelector('[contenteditable="true"]');

  if (!editable) throw new Error('Expected editable root');

  const press = (shiftKey = false) =>
    fireEvent.keyDown(editable, { code: 'Tab', key: 'Tab', shiftKey });

  return { editor, press };
};

const indents = (nodes: readonly Element[]) => nodes.map((node) => node.indent);

describe('ListPlugin family keys', () => {
  it('nests an item with its continuation blocks on Tab [EDIT-LIST-TAB-002]', () => {
    const { editor, press } = mountFamily(
      [
        item('A'),
        item('B'),
        paragraph('P', { indent: 2 }),
        item('C', { indent: 2 }),
        item('D'),
      ],
      caret([1, 0])
    );

    press();

    expect(indents(editor.read.children())).toEqual([1, 2, 3, 3, 1]);
  });

  it('outdents an item with its continuation blocks on Shift+Tab [EDIT-LIST-STAB-002]', () => {
    const { editor, press } = mountFamily(
      [item('A'), item('B', { indent: 2 }), paragraph('P', { indent: 3 })],
      caret([1, 0])
    );

    press(true);

    expect(indents(editor.read.children())).toEqual([1, 1, 2]);
  });

  it('moves a selected child of a selected item once', () => {
    const { editor, press } = mountFamily(
      [item('A'), item('B'), paragraph('P', { indent: 2 })],
      {
        anchor: { offset: 0, path: [1, 0] },
        focus: { offset: 1, path: [2, 0] },
      }
    );

    press();

    expect(indents(editor.read.children())).toEqual([1, 2, 3]);
  });

  it('nests an item whose indent is omitted together with its family', () => {
    const { editor, press } = mountFamily(
      [
        item('A'),
        paragraph('B', { listType: 'numbered' }),
        paragraph('P', { indent: 2 }),
      ],
      caret([1, 0])
    );

    press();

    expect(indents(editor.read.children())).toEqual([1, 2, 3]);
  });

  it('lifts a quoted root item out of the quote with its family, and undo restores it', () => {
    const initialValue = [
      {
        children: [
          item('T', { listType: 'bulleted' }),
          paragraph('P', { indent: 2 }),
        ],
        type: 'blockquote',
      },
    ] as Element[];
    const { editor, press } = mountFamily(initialValue, caret([0, 0, 0]));

    press(true);

    expect(editor.read.children()).toEqual([
      paragraph('T'),
      paragraph('P', { indent: 1 }),
    ]);

    editor.api.history.undo();

    expect(editor.read.children()).toEqual(initialValue);
  });

  it.each([
    ['Tab', [1, 1, 2, 2], [1, 2, 3, 3]],
    ['Shift+Tab', [1, 2, 3, 3], [1, 1, 2, 2]],
    ['list.outdent', [1, 1, 2, 2], [1, undefined, 1, 1]],
  ])(
    'moves each container of a family on %s and leaves its inner blocks alone',
    (action, before, after) => {
      const { editor, press } = mountFamily(
        [
          item('A', { indent: before[0] }),
          item('B', { indent: before[1] }),
          {
            children: [
              { children: [{ text: 'Title' }], type: 'summary' },
              paragraph('Body'),
            ],
            indent: before[2],
            type: 'details',
          },
          {
            children: [paragraph('Quoted')],
            indent: before[3],
            type: 'blockquote',
          },
        ],
        caret([1, 0])
      );

      if (action === 'list.outdent') {
        editor.plugin(ListPlugin).update.outdent({ at: [1] });
      } else {
        press(action === 'Shift+Tab');
      }

      const children = editor.read.children();

      expect({
        body: children[2].children[1],
        indents: indents(children),
        quoted: children[3].children[0],
      }).toEqual({
        body: paragraph('Body'),
        indents: after,
        quoted: paragraph('Quoted'),
      });
    }
  );

  it('keeps the indent buttons on one block', () => {
    const { editor } = mountFamily(
      [item('A'), item('B'), paragraph('P', { indent: 2 })],
      caret([1, 0])
    );

    act(() => {
      editor.plugin(IndentPlugin).update.increase();
    });

    expect(indents(editor.read.children())).toEqual([1, 2, 2]);
  });

  it('moves an item with its continuation blocks [EDIT-LIST-MOVE-001]', () => {
    const { editor } = mountFamily(
      [item('A'), paragraph('P', { indent: 2 }), item('B')],
      caret([0, 0])
    );

    editor.api.transfer.move({
      nodes: editor.read.transfer.nodes({ node: editor.key([0])! }),
      to: { edge: 'after', key: editor.key([2])! },
    });

    expect(
      editor.read.children().map((node) => [NodeApi.string(node), node.indent])
    ).toEqual([
      ['B', 1],
      ['A', 1],
      ['P', 2],
    ]);
  });

  it('moves a converted Details title with its body on Tab and Shift+Tab', () => {
    const { editor, press } = mountFamily(
      [
        item('A'),
        {
          children: [
            { children: [{ text: 'Title' }], type: 'summary' },
            paragraph('Body'),
          ],
          type: 'details',
        },
      ],
      caret([1, 0, 0])
    );

    editor.plugin(ListPlugin).update.toggle({ type: 'bulleted' });
    const converted = indents(editor.read.children());
    press();
    const nested = indents(editor.read.children());
    press(true);

    expect({
      converted,
      nested,
      outdented: indents(editor.read.children()),
    }).toEqual({
      converted: [1, 1, 2],
      nested: [1, 2, 3],
      outdented: [1, 1, 2],
    });
  });
});
