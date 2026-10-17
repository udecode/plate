import { act, render } from '@testing-library/react';
import {
  BaseParagraphPlugin,
  BaseListPlugin,
  definePlugin,
  PLUGINS,
  schema,
  type Editor,
  type Element,
  createEditor,
  NodeApi,
} from 'platejs';
import { BaseImagePlugin } from 'platejs/media';
import {
  createEditor as createReactEditor,
  EditorContent,
  EditorRoot,
} from 'platejs/react';
import { renderStaticHtml } from 'platejs/static';
import React from 'react';
import ReactDOMServer from 'react-dom/server';

import { BasicBlocksKit } from '@/registry/components/editor/basic-blocks';
import { BlockList } from '@/registry/components/editor/block-list';
import { TableKit } from '@/registry/components/editor/table';

import { ListKit } from './list';
import { BaseListKit } from './list-static';
import { BaseEditorKit } from './plugins-static';

const ListTargetSchemaPlugins = [
  PLUGINS.heading,
  PLUGINS.blockquote,
  PLUGINS.codeBlock,
  PLUGINS.details,
  PLUGINS.image,
] as const;

const ListTargetSchemaKit = ListTargetSchemaPlugins.map((name) =>
  definePlugin(name, {
    schema: {
      element: {
        content: schema.content.text({ default: 'text', min: 1 }),
      },
    },
  })
);

const unorderedElement = {
  children: [{ text: 'Bullet' }],
  indent: 2,
  listType: 'bulleted',
  type: 'paragraph',
} as any;

const orderedElement = {
  children: [{ text: 'One' }],
  listStart: 3,
  listType: 'numbered',
  type: 'paragraph',
} as any;

const getListNodeProps = (editor: Editor) =>
  editor.plugin(BaseListPlugin).inject.nodeProps!;

describe('ListKit unordered list rendering', () => {
  it('decodes configured list items as paragraphs with list properties', () => {
    const editor = createEditor({
      plugins: [BaseParagraphPlugin, ...ListTargetSchemaKit, ...BaseListKit],
    });

    const result = editor.api.html.parseSlice(
      '<ul><li data-checked="true" data-list-start="3">Task</li></ul>'
    );

    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error(result.diagnostics[0].message);
    expect(result.slice.content).toEqual([
      {
        checked: true,
        children: [{ text: 'Task' }],
        indent: 1,
        listId: expect.any(String),
        listStart: 3,
        listType: 'task',
        type: 'paragraph',
      },
    ]);
  });

  it('keeps the lightweight unordered path inside the app list renderer', () => {
    expect(BlockList({ element: unorderedElement } as any)).toBeUndefined();

    const orderedWrapper = BlockList({ element: orderedElement } as any)!;
    const orderedMarkup = ReactDOMServer.renderToStaticMarkup(
      orderedWrapper({
        children: 'One',
        editor: {
          plugin: () => ({ read: { ordinal: () => 3 } }),
        },
        element: orderedElement,
      } as any)
    );

    expect(orderedMarkup).toContain('<ol');
    expect(orderedMarkup).toContain('start="3"');
    expect(orderedMarkup).toContain('<li>One</li>');
  });

  it('injects root list-item props without wiping indent margin', () => {
    const interactiveEditor = createReactEditor({
      plugins: [...ListTargetSchemaKit, ...ListKit],
    });
    const staticEditor = createEditor({
      plugins: [...ListTargetSchemaKit, ...BaseListKit],
    });

    expect(interactiveEditor.plugin(BaseListPlugin).inject.isElement).toBe(
      true
    );
    expect(staticEditor.plugin(BaseListPlugin).inject.isElement).toBe(true);

    expect(
      getListNodeProps(staticEditor).query?.({
        editor: staticEditor,
        nodeProps: { element: unorderedElement },
      } as any)
    ).toBe(false);

    const staticImageEditor = createEditor({
      plugins: [
        ...ListTargetSchemaKit.filter(
          (_, index) => ListTargetSchemaPlugins[index] !== PLUGINS.image
        ),
        BaseImagePlugin,
        ...BaseListKit,
      ],
    });

    for (const [editor, element] of [
      [interactiveEditor, unorderedElement],
      [
        staticImageEditor,
        {
          ...unorderedElement,
          type: staticImageEditor.plugin(BaseImagePlugin).schema.type,
        },
      ],
    ] as const) {
      const { query, transformProps } = getListNodeProps(editor);
      if (!query || !transformProps) {
        throw new Error('Expected configured list node props');
      }

      expect(query({ editor, nodeProps: { element } } as any)).toBe(true);
      expect(
        query({ editor, nodeProps: { element: orderedElement } } as any)
      ).toBe(false);
      expect(
        transformProps({
          props: {
            style: {
              listStyle: 'disc',
              marginLeft: '48px',
            },
          },
        } as any)
      ).toEqual({
        role: 'listitem',
        style: {
          display: 'list-item',
          listStyle: 'disc',
          marginLeft: '48px',
        },
      });
    }
  });
});

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

const mountListKit = (
  initialValue: Element[],
  { views = 1 }: { views?: number } = {}
) => {
  const editor = createReactEditor({
    initialValue,
    plugins: [...BasicBlocksKit, ...TableKit, ...ListKit],
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

  return { container, editor, numbers };
};

describe('ListKit bullet style', () => {
  const circleBullet = item('Circle', {
    listStyle: 'circle',
    listType: 'bulleted',
  });

  it('draws the chosen bullet style in the editor', () => {
    const { container } = mountListKit([circleBullet]);
    const listItem = container.querySelector<HTMLElement>('[role="listitem"]');

    expect(listItem?.style.listStyleType).toBe('circle');
  });

  it('draws the chosen bullet style in static HTML', async () => {
    const editor = createEditor({
      initialValue: [circleBullet],
      plugins: BaseListKit,
    });
    const { data } = await renderStaticHtml(editor);
    const host = document.createElement('div');
    host.innerHTML = data;
    const list = host.querySelector<HTMLElement>('ul[data-list-id]');

    expect(list?.style.listStyleType).toBe('circle');
  });
});

describe('ListKit live numbering', () => {
  it('renumbers after an insert at the top', () => {
    const { editor, numbers } = mountListKit([item('A'), item('B')]);

    act(() => {
      editor.update.nodes.insert(item('Z'), { at: [0] });
    });

    expect(numbers()).toEqual([1, 2, 3]);
  });

  it('renumbers after a start change', () => {
    const { editor, numbers } = mountListKit([item('A'), item('B')]);

    act(() => {
      editor.update.nodes.set({ listStart: 4 }, { at: [0] });
    });

    expect(numbers()).toEqual([4, 5]);
  });

  it('renumbers after a middle paragraph becomes a numbered item', () => {
    const { editor, numbers } = mountListKit([
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
    const { editor, numbers } = mountListKit([
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
    const { editor, numbers } = mountListKit([
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
    const { editor, numbers } = mountListKit([
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
    const { editor, numbers } = mountListKit([item('A'), item('B')], {
      views: 2,
    });

    act(() => {
      editor.update.nodes.insert(item('Z'), { at: [0] });
    });

    expect(numbers()).toEqual([1, 2, 3, 1, 2, 3]);
  });
});

describe('BaseListKit static HTML', () => {
  const listed = (text: string, listId: string, props: object = {}) => ({
    children: [{ text }],
    indent: 1,
    listId,
    listType: 'numbered',
    type: 'paragraph',
    ...props,
  });
  const levels = { '2': { restartAfter: 0 } };
  const original = [
    listed('A1', 'a'),
    listed('B1', 'b'),
    listed('A2', 'a'),
    { children: [{ text: 'Note' }], type: 'paragraph' },
    listed('W1', 'w', { listLevels: levels }),
    listed('W1.1', 'w', { indent: 2, listLevels: levels }),
    listed('W2', 'w', { listLevels: levels }),
    listed('W2.1', 'w', { indent: 2, listLevels: levels }),
    listed('R1', 'r'),
    listed('R2', 'r', { listRestart: 1 }),
    listed('Z5', 'z', { listStart: 5 }),
    listed('Z6', 'z'),
    listed('Task', 't', { checked: true, listType: 'task' }),
  ] as Element[];

  const describeLists = (value: readonly Element[]) => {
    const editor = createEditor({ initialValue: value, plugins: BaseListKit });
    const aliasByListId = new Map<unknown, string>();
    const describe = () =>
      editor.read.children().flatMap((node, index) => {
        if (!node.listType) return [];
        if (!aliasByListId.has(node.listId)) {
          aliasByListId.set(
            node.listId,
            String.fromCodePoint(97 + aliasByListId.size)
          );
        }

        return [
          [
            NodeApi.string(node),
            aliasByListId.get(node.listId),
            node.indent,
            node.listType,
            node.checked ?? null,
            node.listLevels ?? null,
            node.listRestart ?? null,
            node.listStart ?? null,
            editor.plugin(BaseListPlugin).read.ordinal([index]) ?? null,
          ],
        ];
      });
    const before = describe();

    editor.update.nodes.remove({ at: [0] });
    editor.update.nodes.remove({ at: [9] });

    return { afterEdit: describe(), before };
  };

  it('decodes the lists, levels, restarts and starts its wrappers write', async () => {
    const editor = createEditor({
      initialValue: original,
      plugins: BaseListKit,
    });
    const { data } = await renderStaticHtml(editor);
    const parsed = editor.api.html.parse(data);

    if (!parsed.ok) throw new Error('Expected decoded HTML');

    expect(describeLists(parsed.document.children as Element[])).toEqual(
      describeLists(original)
    );
  });

  it('keeps interleaved lists apart in the HTML the live wrappers write', async () => {
    const editor = createEditor({
      initialValue: original.slice(0, 3),
      plugins: ListKit,
    });
    const { data } = await renderStaticHtml(editor);
    const parsed = editor.api.html.parse(data);

    if (!parsed.ok) throw new Error('Expected decoded HTML');

    const [a1, b1, a2] = parsed.document.children as Element[];

    expect(a2.listId).toBe(a1.listId);
    expect(b1.listId).not.toBe(a1.listId);
  });
});

describe('BaseEditorKit static HTML lists', () => {
  const listed = (
    props: Readonly<Record<string, unknown>> & { type: string },
    text: string
  ): Element => ({
    children: [{ text }],
    indent: 1,
    ...props,
  });
  const original: Element[] = [
    listed({ listId: 'b', listType: 'bulleted', type: 'paragraph' }, 'Bullet'),
    listed(
      {
        listId: 'b',
        listStyle: 'circle',
        listType: 'bulleted',
        type: 'paragraph',
      },
      'Circle'
    ),
    listed(
      { level: 2, listId: 'c', listType: 'bulleted', type: 'heading' },
      'BH'
    ),
    listed(
      { level: 2, listId: 'd', listType: 'numbered', type: 'heading' },
      'NH'
    ),
    listed(
      {
        checked: true,
        level: 2,
        listId: 'e',
        listType: 'task',
        type: 'heading',
      },
      'TH'
    ),
    listed({ listId: 'f', listType: 'numbered', type: 'codeBlock' }, 'code'),
    {
      children: [
        listed(
          { level: 2, listId: 'g', listType: 'numbered', type: 'heading' },
          'QH'
        ),
      ],
      type: 'blockquote',
    },
  ];

  const describeBlocks = (value: readonly Element[]) => {
    const aliasByListId = new Map<unknown, string>();
    const describe = (nodes: readonly Element[]): unknown[] =>
      nodes.map((node) => {
        if (node.listId !== undefined && !aliasByListId.has(node.listId)) {
          aliasByListId.set(
            node.listId,
            String.fromCodePoint(97 + aliasByListId.size)
          );
        }

        return [
          node.type,
          NodeApi.string(node),
          node.listType ?? null,
          node.listStyle ?? null,
          node.indent ?? null,
          node.checked ?? null,
          aliasByListId.get(node.listId) ?? null,
          node.type === 'blockquote'
            ? describe(node.children as Element[])
            : null,
        ];
      });

    return describe(value);
  };

  it('reads back each list kind on the block that holds it', async () => {
    const editor = createEditor({
      initialValue: original,
      plugins: BaseEditorKit,
    });
    const { data } = await renderStaticHtml(editor);
    const parsed = editor.api.html.parse(data);

    if (!parsed.ok) throw new Error('Expected decoded HTML');

    expect(describeBlocks(parsed.document.children as Element[])).toEqual(
      describeBlocks(original)
    );
  });

  const blockTypes = (html: string) => {
    const editor = createEditor({ plugins: BaseEditorKit });
    const parsed = editor.api.html.parse(html);

    if (!parsed.ok) throw new Error('Expected decoded HTML');

    return parsed.document.children.flatMap((block) => [
      block.type,
      ...Array.from(NodeApi.elements(block), ([node]) => node.type),
    ]);
  };
  const listHtml =
    '<ul data-list-id="L"><li data-indent="1" data-list-type="bulleted">Item</li></ul>';

  it('keeps a rule beside a list drawn inside its quote', () => {
    expect(blockTypes(`<blockquote><hr>${listHtml}</blockquote>`)).toContain(
      'horizontalRule'
    );
  });

  it('keeps a list drawn inside a table cell in its cell', () => {
    expect(
      blockTypes(`<table><tbody><tr><td>${listHtml}</td></tr></tbody></table>`)
    ).toContain('tableCell');
  });
});
