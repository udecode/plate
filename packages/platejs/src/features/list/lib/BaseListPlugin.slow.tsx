import {
  BaseParagraphPlugin,
  createEditor,
  defineBasePlugin,
  ElementApi,
  PathApi,
  schema,
} from '../../../core';
import { BaseListPlugin, ListType } from './BaseListPlugin';

const PagePlugin = defineBasePlugin('page', {
  schema: ({ plugins }) => ({
    element: {
      content: plugins.blockContent({ default: BaseParagraphPlugin, min: 1 }),
    },
  }),
});

const pagedListPlugin = BaseListPlugin.configure({
  initialState: {
    getSiblingListOptions: {
      getNextEntry: ([, path], state) => {
        const nextPath = PathApi.next(path);
        const next = state.nodes.get(nextPath, {
          match: ElementApi.isElement,
        });

        if (next) return next;

        const page = state.nodes.get([path[0] + 1], {
          match: ElementApi.isElement,
        })?.[0];
        const child = page?.children[0];

        return child && ElementApi.isElement(child)
          ? [child, [path[0] + 1, 0]]
          : undefined;
      },
      getPreviousEntry: ([, path], state) => {
        if (PathApi.hasPrevious(path)) {
          return state.nodes.get(PathApi.previous(path), {
            match: ElementApi.isElement,
          });
        }
        if (path[0] === 0) return undefined;

        const pagePath = [path[0] - 1];
        const page = state.nodes.get(pagePath, {
          match: ElementApi.isElement,
        })?.[0];
        const child = page?.children.at(-1);

        return child && ElementApi.isElement(child)
          ? [child, [...pagePath, (page?.children.length ?? 1) - 1]]
          : undefined;
      },
    },
  },
});

describe('BaseListPlugin scale and custom sibling traversal', () => {
  it('does not write derived ordinals across a large numbered list', () => {
    const editor = createEditor({
      plugins: [BaseListPlugin],
      initialValue: Array.from({ length: 500 }, (_, index) => ({
        children: [{ text: `Item ${index + 1}` }],
        indent: 1,
        ...(index === 0 ? { listStart: 8 } : {}),
        listType: 'numbered' as const,
        type: 'paragraph',
      })),
    });

    editor.update.text.insert('!', {
      at: { offset: 6, path: [250, 0] },
    });

    expect(
      editor.read.children().filter((node) => 'listStart' in node)
    ).toHaveLength(1);
  });

  it('caches derived ordinals across a large render pass', () => {
    let traversals = 0;
    const plugin = BaseListPlugin.configure({
      initialState: {
        getSiblingListOptions: {
          getPreviousEntry: ([, path], state) => {
            traversals += 1;
            if (!PathApi.hasPrevious(path)) return undefined;

            return state.nodes.get(PathApi.previous(path), {
              match: ElementApi.isElement,
            });
          },
        },
      },
    });
    const editor = createEditor({
      plugins: [plugin],
      initialValue: Array.from({ length: 10_000 }, (_, index) => ({
        children: [{ text: `Item ${index + 1}` }],
        indent: 1,
        listType: 'numbered' as const,
        type: 'paragraph',
      })),
    });
    const children = editor.read.children();

    expect(editor.read.list.ordinal(children[9999])).toBe(10_000);
    children.forEach((element) => {
      editor.read.list.ordinal(element);
    });
    expect(traversals).toBeLessThan(20_000);
  });

  it('switches one logical sequence across configured page boundaries', () => {
    const editor = createEditor({
      plugins: [PagePlugin, pagedListPlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [0, 0, 0] },
        focus: { offset: 3, path: [0, 0, 0] },
      },
      initialValue: [
        {
          children: [
            {
              children: [{ text: 'One' }],
              indent: 1,
              listType: 'bulleted',
              type: 'paragraph',
            },
          ],
          type: 'page',
        },
        {
          children: [
            {
              children: [{ text: 'Two' }],
              indent: 1,
              listType: 'bulleted',
              type: 'paragraph',
            },
          ],
          type: 'page',
        },
      ],
    });

    editor.update.list.toggle({ type: ListType.Numbered });

    expect(editor.read.children()).toMatchObject([
      { children: [{ listType: 'numbered' }] },
      { children: [{ listType: 'numbered' }] },
    ]);
    const first = editor.read.children()[0].children[0];
    const second = editor.read.children()[1].children[0];

    if (!ElementApi.isElement(first) || !ElementApi.isElement(second)) {
      throw new TypeError('Expected page list elements');
    }

    expect(editor.read.list.ordinal(first)).toBe(1);
    expect(editor.read.list.ordinal(second)).toBe(2);
  });

  it('expands nested flat-list descendants without duplicates', () => {
    const editor = createEditor({
      plugins: [BaseListPlugin],
      initialValue: [
        {
          children: [{ text: 'Parent' }],
          indent: 1,
          listType: 'bulleted',
          type: 'paragraph',
        },
        {
          children: [{ text: 'Child' }],
          indent: 2,
          listType: 'bulleted',
          type: 'paragraph',
        },
        {
          children: [{ text: 'Sibling' }],
          indent: 1,
          listType: 'bulleted',
          type: 'paragraph',
        },
      ],
    });
    const parent = editor.read.nodes.get([0], {
      match: ElementApi.isElement,
    });

    expect(parent).toBeDefined();
    expect(
      editor.read.list
        .expandItemsWithChildren([parent!])
        .map(([, path]) => path)
    ).toEqual([[0], [1]]);
  });

  it('expands children from a root item with an omitted indent', () => {
    const editor = createEditor({
      plugins: [BaseListPlugin],
      initialValue: [
        {
          children: [{ text: 'Parent' }],
          listType: 'bulleted',
          type: 'paragraph',
        },
        {
          children: [{ text: 'Child' }],
          indent: 2,
          listType: 'bulleted',
          type: 'paragraph',
        },
      ],
    });
    const parent = editor.read.nodes.get([0], {
      match: ElementApi.isElement,
    });

    if (!parent) throw new TypeError('Expected root list item');

    expect(editor.read.list.expandItemsWithChildren([parent])).toHaveLength(2);
  });
});

void schema;
