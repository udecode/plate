/** @jsxRuntime classic */
/** @jsx jsxt */

import {
  BaseParagraphPlugin,
  createEditor,
  createEditorView,
  definePlugin,
  property,
  schema,
} from 'platejs';

import { jsxt, type TestEditor } from '../../testing';
import { fixtureSchemaPlugins, normalizeRoot } from './__tests__/normalizeRoot';
import { TrailingBlockPlugin } from './TrailingBlockPlugin';

jsxt;

describe('TrailingBlockPlugin', () => {
  it('uses the editor paragraph type as the default trailing block type', () => {
    const editor = createEditor({
      plugins: [...fixtureSchemaPlugins, TrailingBlockPlugin],
      initialValue: [{ type: 'h1', children: [{ text: 'x' }] }],
    });

    expect(editor.plugin(TrailingBlockPlugin).initialState.type).toBe(
      editor.plugin(BaseParagraphPlugin).schema.type
    );
  });

  it('creates the trailing block through its schema', () => {
    const RequiredTrailingPlugin = definePlugin('requiredTrailing', {
      schema: {
        element: {
          ...schema.element.textBlock(),
          properties: {
            tone: property.string({
              default: 'neutral',
              omitDefault: false,
            }),
          },
        },
      },
    });
    const normalized = normalizeRoot({
      plugins: [
        RequiredTrailingPlugin,
        TrailingBlockPlugin.configure({
          initialState: {
            type: RequiredTrailingPlugin.name,
          },
        }),
      ],
      value: [{ type: 'h1', children: [{ text: 'x' }] }],
    });

    expect(normalized.children[1]).toEqual({
      children: [{ text: '' }],
      tone: 'neutral',
      type: 'requiredTrailing',
    });
  });

  it('repairs the changed nested parent at the configured depth', () => {
    const editor = createEditor({
      plugins: [
        ...fixtureSchemaPlugins,
        TrailingBlockPlugin.configure({
          initialState: {
            level: 1,
            type: 'paragraph',
          },
        }),
      ],
      initialValue: [
        {
          type: 'element',
          children: [
            { type: 'h1', children: [{ text: 'first' }] },
            { type: 'paragraph', children: [{ text: '' }] },
          ],
        },
      ],
    });

    editor.update.nodes.insert(
      { type: 'h1', children: [{ text: 'second' }] },
      { at: [0, 2] }
    );

    expect(editor.read.children()).toEqual([
      {
        type: 'element',
        children: [
          { type: 'h1', children: [{ text: 'first' }] },
          { type: 'paragraph', children: [{ text: '' }] },
          { type: 'h1', children: [{ text: 'second' }] },
          { type: 'paragraph', children: [{ text: '' }] },
        ],
      },
    ]);
  });

  it('repairs the changed named root without touching the main root', () => {
    const RootHolderPlugin = definePlugin('trailingRootHolder', {
      schema: {
        element: {
          blockContent: true,
          contentRoots: {
            body: {
              content: schema.content.types(['paragraph', 'h1'], {
                default: { type: BaseParagraphPlugin.name },
                min: 1,
              }),
              ownership: 'exclusive',
            },
          },
          void: 'block',
        },
      },
    });
    const editor = createEditor({
      plugins: [...fixtureSchemaPlugins, RootHolderPlugin, TrailingBlockPlugin],
      initialValue: {
        children: [
          {
            childRoots: { body: 'header' },
            children: [{ text: '' }],
            type: RootHolderPlugin.name,
          },
        ],
        roots: {
          header: [{ type: 'paragraph', children: [{ text: '' }] }],
        },
      },
    });
    const header = createEditorView(editor, { root: 'header' });

    header.update.nodes.insert(
      { type: 'h1', children: [{ text: 'heading' }] },
      { at: [1] }
    );

    expect(editor.read.children()).toHaveLength(1);
    expect(header.read.children()).toEqual([
      { type: 'paragraph', children: [{ text: '' }] },
      { type: 'h1', children: [{ text: 'heading' }] },
      { type: 'paragraph', children: [{ text: '' }] },
    ]);
  });

  it.each([
    {
      input: (
        <editor>
          <element type="h1">test</element>
          <element type="h1">test2</element>
        </editor>
      ) as TestEditor,
      output: (
        <editor>
          <element type="h1">test</element>
          <element type="h1">test2</element>
          <hdefault>
            <htext />
          </hdefault>
        </editor>
      ) as TestEditor,
      plugins: [
        TrailingBlockPlugin.configure({
          initialState: {
            level: 0,
            type: 'paragraph',
          },
        }),
      ],
      title:
        'appends a trailing block at the root when the last node is invalid',
    },
    {
      input: (
        <editor>
          <element type="element">
            <element type="h1">test</element>
            <element type="h1">test2</element>
          </element>
        </editor>
      ) as TestEditor,
      output: (
        <editor>
          <element type="element">
            <element type="h1">test</element>
            <element type="h1">test2</element>
            <hdefault>
              <htext />
            </hdefault>
          </element>
        </editor>
      ) as TestEditor,
      plugins: [
        TrailingBlockPlugin.configure({
          initialState: {
            level: 1,
            type: 'paragraph',
          },
        }),
      ],
      title: 'appends the trailing block at the configured depth',
    },
    {
      input: (
        <editor>
          <element type="h1">test</element>
          <element type="h1">test2</element>
        </editor>
      ) as TestEditor,
      output: (
        <editor>
          <element type="h1">test</element>
          <element type="h1">test2</element>
        </editor>
      ) as TestEditor,
      plugins: [
        TrailingBlockPlugin.configure({
          initialState: {
            level: 0,
            match: (node) => !('type' in node) || node.type !== 'h1',
            type: 'paragraph',
          },
        }),
      ],
      title: 'skips insertion when the last node is excluded by the query',
    },
    {
      input: (
        <editor>
          <element type="h1">test</element>
          <element type="h1">test2</element>
          <hdefault>default</hdefault>
        </editor>
      ) as TestEditor,
      output: (
        <editor>
          <element type="h1">test</element>
          <element type="h1">test2</element>
          <hdefault>default</hdefault>
        </editor>
      ) as TestEditor,
      plugins: [TrailingBlockPlugin],
      title: 'keeps an existing trailing block unchanged',
    },
    {
      input: (<editor />) as TestEditor,
      output: (
        <editor>
          <hdefault>
            <htext />
          </hdefault>
        </editor>
      ) as TestEditor,
      plugins: [TrailingBlockPlugin],
      title: 'inserts a trailing block into an empty editor',
    },
  ])('$title', ({ input, output, plugins }) => {
    const normalized = normalizeRoot({
      plugins,
      selection: input.selection,
      value: input.children,
    });

    expect(normalized.children).toEqual(output.children);
  });
});
