/** @jsx jsxt */

import {
  BaseParagraphPlugin,
  createBaseEditor as createTypedBaseEditor,
  defineBasePlugin,
  type BaseEditorOptions,
  type BasePluginInput,
  type PluginReference,
} from '@platejs/core';
import type { AnyBasePlugin } from '@platejs/core/internal';
import {
  ContentSlice,
  createEditor as createPliteEditor,
  type Descendant,
  defineExtension,
  editorCommands,
  ElementApi,
  type InitialValue,
  property,
  schema,
  SelectionApi,
  type Value,
} from '@platejs/plite';
import {
  jsxt,
  projectTestSelectionRange,
  type TestEditor,
  type TestEditorFixture,
} from '@platejs/test-utils';
import { PLUGINS } from '@platejs/utils';

import {
  BaseBulletedListPlugin,
  BaseListItemContentPlugin,
  BaseListItemPlugin,
  BaseListPlugin,
  BaseNumberedListPlugin,
  BaseTaskListPlugin,
  BulletedListRules,
  OrderedListRules,
  TaskListRules,
} from './BaseListPlugin';

const createBaseEditor = <const P extends readonly BasePluginInput[]>(
  options: Omit<BaseEditorOptions, 'plugins'> & {
    initialValue?: InitialValue<Value>;
    plugins: P;
  }
) =>
  createTypedBaseEditor({
    ...options,
    editor: createPliteEditor<Value>(),
  });

const CodeLineFixturePlugin = defineBasePlugin(PLUGINS.codeLine, {
  schema: {
    element: {
      blockContent: false,
      content: schema.content.text({ default: 'text', min: 1 }),
    },
  },
});

const CodeBlockFixturePlugin = defineBasePlugin(PLUGINS.codeBlock, {
  dependencies: [CodeLineFixturePlugin],
  schema: () => ({
    element: {
      content: schema.content.element(CodeLineFixturePlugin, {
        default: { type: 'codeLine' },
        min: 1,
      }),
    },
  }),
});

describe('input rules', () => {
  jsxt;

  describe('BaseListPlugin input rules', () => {
    it('stays literal until markdown groups are explicitly enabled', () => {
      const editor = createBaseEditor({
        plugins: [BaseListPlugin],
        selection: {
          kind: 'text',
          anchor: { offset: 1, path: [0, 0] },
          focus: { offset: 1, path: [0, 0] },
        },
        initialValue: [{ children: [{ text: '-hello' }], type: 'paragraph' }],
      });

      editor.update.text.insert(' ');

      expect(editor.read.children()).toEqual([
        { children: [{ text: '- hello' }], type: 'paragraph' },
      ]);
    });

    it.each([
      {
        input: [{ children: [{ text: '-hello' }], type: 'paragraph' }],
        selection: {
          kind: 'text',
          anchor: { offset: 1, path: [0, 0] },
          focus: { offset: 1, path: [0, 0] },
        },
        title: 'formats bullet shorthand',
      },
      {
        input: [{ children: [{ text: '1.hello' }], type: 'paragraph' }],
        selection: {
          kind: 'text',
          anchor: { offset: 2, path: [0, 0] },
          focus: { offset: 2, path: [0, 0] },
        },
        title: 'formats ordered shorthand',
      },
    ])('$title', ({ input, selection, title }) => {
      const editor = createBaseEditor({
        plugins: [
          BaseListPlugin.configure({
            inputRules: [
              BulletedListRules.markdown({ variant: '-' }),
              BulletedListRules.markdown({ variant: '*' }),
              OrderedListRules.markdown({ variant: '.' }),
              OrderedListRules.markdown({ variant: ')' }),
              TaskListRules.markdown({ checked: false }),
              TaskListRules.markdown({ checked: true }),
            ],
          }),
        ],
        selection,
        initialValue: input,
      });

      editor.update.text.insert(' ');

      expect(editor.read.children()).toEqual([
        {
          children: [
            {
              children: [
                {
                  children: [{ text: 'hello' }],
                  type: editor.plugin(PLUGINS.listItemContent).schema.type,
                },
              ],
              type: editor.plugin(PLUGINS.listItem).schema.type,
            },
          ],
          type:
            title === 'formats bullet shorthand'
              ? editor.plugin(PLUGINS.bulletedList).schema.type
              : editor.plugin(PLUGINS.numberedList).schema.type,
        },
      ]);
    });

    it.each([
      {
        checked: false,
        input: [
          {
            children: [{ text: '[]hello' }],
            type: 'paragraph',
          },
        ],
        selection: {
          kind: 'text',
          anchor: { offset: 2, path: [0, 0] },
          focus: { offset: 2, path: [0, 0] },
        },
        title: 'formats unchecked task shorthand',
      },
      {
        checked: true,
        input: [
          {
            children: [{ text: '[x]hello' }],
            type: 'paragraph',
          },
        ],
        selection: {
          kind: 'text',
          anchor: { offset: 3, path: [0, 0] },
          focus: { offset: 3, path: [0, 0] },
        },
        title: 'formats checked task shorthand',
      },
    ])('$title', ({ checked, input, selection }) => {
      const editor = createBaseEditor({
        plugins: [
          BaseListPlugin.configure({
            inputRules: [
              BulletedListRules.markdown({ variant: '-' }),
              BulletedListRules.markdown({ variant: '*' }),
              OrderedListRules.markdown({ variant: '.' }),
              OrderedListRules.markdown({ variant: ')' }),
              TaskListRules.markdown({ checked: false }),
              TaskListRules.markdown({ checked: true }),
            ],
          }),
        ],
        selection,
        initialValue: input,
      });

      editor.update.text.insert(' ');

      expect(editor.read.children()).toEqual([
        {
          children: [
            {
              checked,
              children: [
                { children: [{ text: 'hello' }], type: 'listItemContent' },
              ],
              type: 'listItem',
            },
          ],
          type: 'taskList',
        },
      ]);
    });

    it('keeps list shorthand literal inside code blocks', () => {
      const editor = createBaseEditor({
        plugins: [
          CodeBlockFixturePlugin,
          BaseListPlugin.configure({
            inputRules: [
              BulletedListRules.markdown({ variant: '-' }),
              BulletedListRules.markdown({ variant: '*' }),
              OrderedListRules.markdown({ variant: '.' }),
              OrderedListRules.markdown({ variant: ')' }),
              TaskListRules.markdown({ checked: false }),
              TaskListRules.markdown({ checked: true }),
            ],
          }),
        ],
        selection: {
          kind: 'text',
          anchor: { offset: 1, path: [0, 0, 0] },
          focus: { offset: 1, path: [0, 0, 0] },
        },
        initialValue: [
          {
            children: [
              {
                children: [{ text: '-code' }],
                type: 'codeLine',
              },
            ],
            type: 'codeBlock',
          },
        ],
      });

      editor.update.text.insert(' ');

      expect(editor.read.children()).toEqual([
        {
          children: [
            {
              children: [{ text: '- code' }],
              type: editor.plugin(PLUGINS.codeLine).schema.type,
            },
          ],
          type: editor.plugin(PLUGINS.codeBlock).schema.type,
        },
      ]);
    });
  });
});

describe('schema', () => {
  describe('BaseListPlugin schema', () => {
    it('constructs and validates the list root, item, and content grammar', () => {
      const editor = createBaseEditor({
        plugins: [BaseListPlugin],
      });
      const list = editor.read.schema.create(BaseBulletedListPlugin);

      if (!ElementApi.isElement(list)) {
        throw new Error(
          'Expected the list schema to construct a list element.'
        );
      }

      const listItem = list.children[0];

      if (!ElementApi.isElement(listItem)) {
        throw new Error('Expected the list schema to construct a list item.');
      }

      const listItemContent = listItem.children[0];

      if (!ElementApi.isElement(listItemContent)) {
        throw new Error('Expected the list schema to construct list elements.');
      }

      expect(list).toEqual({
        children: [
          {
            children: [{ children: [{ text: '' }], type: 'listItemContent' }],
            type: 'listItem',
          },
        ],
        type: 'bulletedList',
      });
      expect(editor.read.schema.getElementSlicePolicy(list)).toEqual({
        preserveContext: true,
        replaceWhenCovered: false,
      });
      expect(
        editor.read.schema.element(BaseBulletedListPlugin)?.groups
      ).toContain('block');
      expect(editor.read.schema.element(BaseListItemPlugin)?.groups).toContain(
        'block'
      );
      expect(
        editor.read.schema.element(BaseListItemContentPlugin)?.groups
      ).toContain('block');
      for (const dependency of [
        BaseBulletedListPlugin,
        BaseNumberedListPlugin,
        BaseTaskListPlugin,
        BaseListItemPlugin,
        BaseListItemContentPlugin,
      ]) {
        expect(editor.plugin(dependency)).toBeDefined();
      }
      expect(() => editor.read.schema.assertFragment([list])).not.toThrow();
      expect(() =>
        editor.read.schema.assertDocument({ children: [listItem] })
      ).toThrow(/root.*cannot contain|cannot contain.*root/i);
      expect(() =>
        editor.read.schema.assertDocument({
          children: [listItemContent],
        })
      ).toThrow(/root.*cannot contain|cannot contain.*root/i);
      expect(() =>
        editor.read.schema.assertFragment([
          {
            children: [{ children: [{ text: '' }], type: 'paragraph' }],
            type: 'bulletedList',
          },
        ])
      ).toThrow(/cannot contain/i);
    });

    it('restricts checked state to task-list items', () => {
      const editor = createBaseEditor({
        plugins: [BaseListPlugin],
      });
      const item = {
        checked: true,
        children: [{ children: [{ text: '' }], type: 'listItemContent' }],
        type: 'listItem',
      };

      expect(() =>
        editor.read.schema.assertFragment([
          { children: [item], type: 'taskList' },
        ])
      ).not.toThrow();
      expect(() =>
        editor.read.schema.assertFragment([
          { children: [item], type: 'bulletedList' },
        ])
      ).toThrow(/property "checked" cannot target element "listItem"/i);
      const taskList = editor.read.schema.create(BaseTaskListPlugin);

      expect(taskList).toMatchObject({
        children: [
          {
            children: [{ children: [{ text: '' }], type: 'listItemContent' }],
            type: 'listItem',
          },
        ],
        type: 'taskList',
      });
      expect(Reflect.get(taskList.children[0], 'checked')).toBe(false);
    });

    it('resolves valid list-item child plugin names', () => {
      const EmbedPlugin = defineBasePlugin('embed', {
        schema: {
          element: {
            content: schema.content.text({ default: 'text', min: 1 }),
          },
        },
      });
      const editor = createBaseEditor({
        plugins: [
          EmbedPlugin,
          BaseListPlugin,
          BaseListItemPlugin.configure({
            initialState: { validLiChildren: [EmbedPlugin] },
          }),
        ],
      });

      expect(() =>
        editor.read.schema.assertFragment([
          {
            children: [
              {
                children: [
                  {
                    children: [{ text: '' }],
                    type: 'embed',
                  },
                ],
                type: 'listItem',
              },
            ],
            type: 'bulletedList',
          },
        ])
      ).not.toThrow();
    });

    it('rejects disabling a required list descriptor', () => {
      expect(() =>
        createBaseEditor({
          plugins: [
            BaseListPlugin,
            BaseListItemPlugin.configure({ enabled: false }),
          ],
        })
      ).toThrow(/listClassic.*requires disabled plugin.*li/i);
    });
  });
});

describe('list toggling', () => {
  jsxt;

  const BaseImagePlugin = defineBasePlugin(PLUGINS.image, {
    schema: {
      element: {
        void: 'block',
      },
    },
  });

  const runToggleList = (
    input: TestEditor,
    plugins: any[] = [BaseListPlugin],
    plugin: PluginReference | string = PLUGINS.bulletedList
  ) => {
    const editor = createBaseEditor({
      plugins,
      selection: input.selection,
      initialValue: input.children,
    });

    editor.plugin(BaseListPlugin).update.toggle({
      type: editor.plugin(plugin).schema.type,
    });

    return editor;
  };

  describe('toggleList', () => {
    it('does nothing when the editor has no selection', () => {
      const editor = createBaseEditor({
        plugins: [BaseListPlugin],
        initialValue: [{ children: [{ text: 'plain' }], type: 'paragraph' }],
      });

      const before = JSON.stringify(editor.read.children());

      editor.plugin(BaseListPlugin).update.toggle({
        type: editor.plugin(PLUGINS.bulletedList).schema.type,
      });

      expect(JSON.stringify(editor.read.children())).toBe(before);
    });

    describe('turning paragraphs into lists', () => {
      it('wraps a collapsed paragraph in a bulleted list', () => {
        const input = (
          <editor>
            <hp>
              1<cursor />
            </hp>
          </editor>
        ) as TestEditor;

        const editor = runToggleList(input);

        expect(editor.read.children()).toEqual(
          (
            <editor>
              <hul>
                <hli>
                  <hlic>1</hlic>
                </hli>
              </hul>
            </editor>
          ).children
        );
      });

      it('preserves block order across a multi-block range selection', () => {
        const input = (
          <editor>
            <hp>
              <anchor />
              AAA
            </hp>
            <hp>BBB</hp>
            <hp>CCC</hp>
            <hp>
              DDD
              <focus />
            </hp>
          </editor>
        ) as TestEditor;

        const editor = runToggleList(input);

        expect(editor.read.children()).toEqual(
          (
            <editor>
              <hul>
                <hli>
                  <hlic>AAA</hlic>
                </hli>
                <hli>
                  <hlic>BBB</hlic>
                </hli>
                <hli>
                  <hlic>CCC</hlic>
                </hli>
                <hli>
                  <hlic>DDD</hlic>
                </hli>
              </hul>
            </editor>
          ).children
        );
      });

      it('wraps only exact node selection members', () => {
        const editor = createBaseEditor({
          plugins: [BaseListPlugin],
          selection: SelectionApi.nodes([[0], [2]]),
          initialValue: [
            { children: [{ text: 'AAA' }], type: 'paragraph' },
            { children: [{ text: 'BBB' }], type: 'paragraph' },
            { children: [{ text: 'CCC' }], type: 'paragraph' },
          ],
        });

        editor.plugin(BaseListPlugin).update.toggle({
          type: editor.plugin(PLUGINS.bulletedList).schema.type,
        });

        expect(editor.read.children()).toEqual([
          {
            children: [
              {
                children: [
                  {
                    children: [{ text: 'AAA' }],
                    type: 'listItemContent',
                  },
                ],
                type: 'listItem',
              },
            ],
            type: 'bulletedList',
          },
          { children: [{ text: 'BBB' }], type: 'paragraph' },
          {
            children: [
              {
                children: [
                  {
                    children: [{ text: 'CCC' }],
                    type: 'listItemContent',
                  },
                ],
                type: 'listItem',
              },
            ],
            type: 'bulletedList',
          },
        ]);
      });

      it('keeps configured valid list-item children at the list item root', () => {
        const input = (
          <editor>
            <himg>
              <htext>
                <cursor />
              </htext>
            </himg>
          </editor>
        ) as TestEditor;

        const editor = runToggleList(input, [
          BaseImagePlugin,
          BaseListPlugin,
          BaseListItemPlugin.configure({
            initialState: {
              validLiChildren: [BaseImagePlugin],
            },
          }),
        ]);

        expect(editor.read.children()).toEqual(
          (
            <editor>
              <hul>
                <hli>
                  <himg>
                    <htext />
                  </himg>
                </hli>
              </hul>
            </editor>
          ).children
        );
      });

      it('creates checked task-list items through the task-list wrapper', () => {
        const input = (
          <editor>
            <hp>
              task
              <cursor />
            </hp>
          </editor>
        ) as TestEditor;
        const editor = createBaseEditor({
          plugins: [BaseListPlugin],
          selection: input.selection,
          initialValue: input.children,
        });

        editor.plugin(BaseListPlugin).update.toggle({
          checked: true,
          type: editor.plugin(PLUGINS.taskList).schema.type,
        });

        expect(editor.read.children()).toMatchObject([
          {
            children: [
              {
                checked: true,
                children: [
                  { children: [{ text: 'task' }], type: 'listItemContent' },
                ],
                type: 'listItem',
              },
            ],
            type: 'taskList',
          },
        ]);
      });

      it('drops checked when switching a task list to a bulleted list', () => {
        const input = {
          children: [
            {
              children: [
                {
                  checked: true,
                  children: [
                    { children: [{ text: 'task' }], type: 'listItemContent' },
                  ],
                  type: 'listItem',
                },
              ],
              type: 'taskList',
            },
          ],
          selection: {
            kind: 'text' as const,
            anchor: { offset: 4, path: [0, 0, 0, 0] },
            focus: { offset: 4, path: [0, 0, 0, 0] },
          },
        } as TestEditor;

        const editor = runToggleList(input);

        expect(editor.read.children()).toEqual(
          (
            <editor>
              <hul>
                <hli>
                  <hlic>task</hlic>
                </hli>
              </hul>
            </editor>
          ).children
        );
      });
    });

    describe('turning lists off', () => {
      it('unwraps a selected list range into paragraphs', () => {
        const input = (
          <editor>
            <hul>
              <hli>
                <hlic>
                  <anchor />1
                </hlic>
              </hli>
              <hli>
                <hlic>2</hlic>
              </hli>
              <hli>
                <hlic>
                  3<focus />
                </hlic>
              </hli>
            </hul>
          </editor>
        ) as TestEditor;

        const editor = runToggleList(input);

        expect(editor.read.children()).toEqual(
          (
            <editor>
              <hp>1</hp>
              <hp>2</hp>
              <hp>3</hp>
            </editor>
          ).children
        );
      });

      it('splits a list around the current item when toggled from inside the list', () => {
        const input = (
          <editor>
            <hul>
              <hli>
                <hlic>1</hlic>
              </hli>
              <hli>
                <hlic>
                  2
                  <cursor />
                </hlic>
              </hli>
              <hli>
                <hlic>3</hlic>
              </hli>
            </hul>
          </editor>
        ) as TestEditor;

        const editor = runToggleList(input);

        expect(editor.read.children()).toEqual(
          (
            <editor>
              <hul>
                <hli>
                  <hlic>1</hlic>
                </hli>
              </hul>
              <hp>2</hp>
              <hul>
                <hli>
                  <hlic>3</hlic>
                </hli>
              </hul>
            </editor>
          ).children
        );
      });

      it('unwraps a nested single-item list across an expanded selection', () => {
        const input = (
          <editor>
            <hul>
              <hli>
                <hlic>
                  <anchor />1
                </hlic>
                <hul>
                  <hli>
                    <hlic>11</hlic>
                    <hlic>
                      12
                      <focus />
                    </hlic>
                  </hli>
                </hul>
              </hli>
            </hul>
          </editor>
        ) as TestEditor;

        const editor = runToggleList(input);

        expect(editor.read.children()).toEqual(
          (
            <editor>
              <hp>1</hp>
              <hp>11</hp>
              <hp>12</hp>
            </editor>
          ).children
        );
      });

      it('unwraps the first item and preserves the remaining list', () => {
        const input = (
          <editor>
            <hul>
              <hli>
                <hlic>
                  <cursor />1
                </hlic>
              </hli>
              <hli>
                <hlic>2</hlic>
              </hli>
            </hul>
          </editor>
        ) as TestEditor;

        const editor = runToggleList(input);

        expect(editor.read.children()).toEqual(
          (
            <editor>
              <hp>1</hp>
              <hul>
                <hli>
                  <hlic>2</hlic>
                </hli>
              </hul>
            </editor>
          ).children
        );
      });

      it('unwraps nested content across multiple list items', () => {
        const input = (
          <editor>
            <hul>
              <hli>
                <hlic>
                  <anchor />1
                </hlic>
                <hul>
                  <hli>
                    <hlic>11</hlic>
                  </hli>
                </hul>
              </hli>
              <hli>
                <hlic>
                  2
                  <focus />
                </hlic>
              </hli>
            </hul>
          </editor>
        ) as TestEditor;

        const editor = runToggleList(input);

        expect(editor.read.children()).toEqual(
          (
            <editor>
              <hp>1</hp>
              <hp>11</hp>
              <hp>2</hp>
            </editor>
          ).children
        );
      });

      it('promotes nested content when unwrapping the first item', () => {
        const input = (
          <editor>
            <hul>
              <hli>
                <hlic>
                  <cursor />1
                </hlic>
                <hul>
                  <hli>
                    <hlic>11</hlic>
                  </hli>
                </hul>
              </hli>
              <hli>
                <hlic>2</hlic>
              </hli>
            </hul>
          </editor>
        ) as TestEditor;

        const editor = runToggleList(input);

        expect(editor.read.children()).toEqual(
          (
            <editor>
              <hp>1</hp>
              <hul>
                <hli>
                  <hlic>11</hlic>
                </hli>
                <hli>
                  <hlic>2</hlic>
                </hli>
              </hul>
            </editor>
          ).children
        );
      });
    });

    describe('switching list types', () => {
      it('switches only the targeted nested list when the selection is inside it', () => {
        const input = (
          <editor>
            <hul>
              <hli>
                <hlic>1</hlic>
                <hul>
                  <hli>
                    <hlic>
                      11
                      <cursor />
                    </hlic>
                  </hli>
                </hul>
              </hli>
            </hul>
          </editor>
        ) as TestEditor;

        const editor = runToggleList(
          input,
          [BaseListPlugin],
          PLUGINS.numberedList
        );

        expect(editor.read.children()).toEqual(
          (
            <editor>
              <hul>
                <hli>
                  <hlic>1</hlic>
                  <hol>
                    <hli>
                      <hlic>11</hlic>
                    </hli>
                  </hol>
                </hli>
              </hul>
            </editor>
          ).children
        );
      });

      it('retypes a selected list range that stays inside the list', () => {
        const input = (
          <editor>
            <hul>
              <hli>
                <hlic>
                  <anchor />1
                </hlic>
              </hli>
              <hli>
                <hlic>
                  2<focus />
                </hlic>
              </hli>
            </hul>
          </editor>
        ) as TestEditor;

        const editor = runToggleList(
          input,
          [BaseListPlugin],
          PLUGINS.numberedList
        );

        expect(editor.read.children()).toEqual(
          (
            <editor>
              <hol>
                <hli>
                  <hlic>1</hlic>
                </hli>
                <hli>
                  <hlic>2</hlic>
                </hli>
              </hol>
            </editor>
          ).children
        );
      });

      it('retypes the full selected range when the selection spans list content and paragraphs', () => {
        const input = (
          <editor>
            <hul>
              <hli>
                <hlic>
                  <anchor />1
                </hlic>
                <hul>
                  <hli>
                    <hlic>11</hlic>
                  </hli>
                </hul>
              </hli>
            </hul>
            <hp>
              body
              <focus />
            </hp>
          </editor>
        ) as TestEditor;

        const editor = runToggleList(
          input,
          [BaseListPlugin],
          PLUGINS.numberedList
        );

        expect(editor.read.children()).toEqual(
          (
            <editor>
              <hol>
                <hli>
                  <hlic>1</hlic>
                  <hol>
                    <hli>
                      <hlic>11</hlic>
                    </hli>
                  </hol>
                </hli>
                <hli>
                  <hlic>body</hlic>
                </hli>
              </hol>
            </editor>
          ).children
        );
      });
    });
  });
});

describe('backward deletion', () => {
  jsxt;

  const BaseBoldPlugin = defineBasePlugin('bold', {
    schema: {
      mark: property.boolean({ default: false, omitDefault: true }),
    },
  });

  describe('li > lic * 2 with selection at second child start', () => {
    it('merge the children', () => {
      const input = (
        <editor>
          <hul>
            <hli>
              <hlic>one</hlic>
              <hlic>
                <cursor />
                two
              </hlic>
            </hli>
          </hul>
        </editor>
      ) as TestEditor;

      const expected = (
        <editor>
          <hul>
            <hli>
              <hlic>onetwo</hlic>
            </hli>
          </hul>
        </editor>
      ) as TestEditor;

      const editor = createBaseEditor({
        plugins: [BaseBoldPlugin, BaseListPlugin],
        selection: input.selection,
        initialValue: input.children,
      });

      editor.update.text.deleteBackward();

      expect(editor.read.children()).toEqual(expected.children);
    });
  });

  describe('li with selection at start', () => {
    it('remove the list item', () => {
      const input = (
        <editor>
          <hul>
            <hli>
              <hlic>
                <cursor />
                one
              </hlic>
            </hli>
            <hli>
              <hlic>two</hlic>
            </hli>
          </hul>
        </editor>
      ) as TestEditor;

      const expected = (
        <editor>
          <hp>one</hp>
          <hul>
            <hli>
              <hlic>two</hlic>
            </hli>
          </hul>
        </editor>
      ) as TestEditor;

      const editor = createBaseEditor({
        plugins: [BaseBoldPlugin, BaseListPlugin],
        selection: input.selection,
        initialValue: input.children,
      });

      editor.update.text.deleteBackward();

      expect(editor.read.children()).toEqual(expected.children);
    });
  });

  describe('list + sublist where second item has multiple children', () => {
    it('merge all text into first sublist item', () => {
      const input = (
        <editor>
          <hul>
            <hli>
              <hlic>one</hlic>
              <hul>
                <hli>
                  <hlic>
                    <htext />
                  </hlic>
                </hli>
                <hli>
                  <hlic>
                    <htext>
                      <cursor />
                      two
                    </htext>
                    <htext bold>three</htext>
                  </hlic>
                </hli>
              </hul>
            </hli>
          </hul>
        </editor>
      ) as TestEditor;

      const expected = (
        <editor>
          <hul>
            <hli>
              <hlic>one</hlic>
              <hul>
                <hli>
                  <hlic>
                    <htext>
                      <cursor />
                      two
                    </htext>
                    <htext bold>three</htext>
                  </hlic>
                </hli>
              </hul>
            </hli>
          </hul>
        </editor>
      ) as TestEditor;

      const editor = createBaseEditor({
        plugins: [BaseBoldPlugin, BaseListPlugin],
        selection: input.selection,
        initialValue: input.children,
      });

      editor.update.text.deleteBackward();

      expect(editor.read.children()).toEqual(expected.children);
    });
  });
});

describe('forward deletion', () => {
  jsxt;

  const BaseBoldPlugin = defineBasePlugin('bold', {
    schema: {
      mark: property.boolean({ default: false, omitDefault: true }),
    },
  });

  describe('p (empty) + list when selection not in list', () => {
    it('remove the p', () => {
      const input = (
        <editor>
          <hp>
            <cursor />
          </hp>
          <hul>
            <hli>
              <hlic>two</hlic>
            </hli>
          </hul>
        </editor>
      ) as TestEditor;

      const expected = (
        <editor>
          <hul>
            <hli>
              <hlic>two</hlic>
            </hli>
          </hul>
        </editor>
      ) as TestEditor;

      const editor = createBaseEditor({
        plugins: [BaseBoldPlugin, BaseListPlugin],
        selection: input.selection,
        initialValue: input.children,
      });

      editor.update.text.deleteForward();

      expect(editor.read.children()).toEqual(expected.children);
    });
  });

  describe('p /w text + list when selection not in list', () => {
    it('merge the texts', () => {
      const input = (
        <editor>
          <hp>
            one
            <cursor />
          </hp>
          <hul>
            <hli>
              <hlic>two</hlic>
            </hli>
          </hul>
        </editor>
      ) as TestEditor;

      const expected = (
        <editor>
          <hp>onetwo</hp>
        </editor>
      ) as TestEditor;

      const editor = createBaseEditor({
        plugins: [BaseBoldPlugin, BaseListPlugin],
        selection: input.selection,
        initialValue: input.children,
      });

      editor.update.text.deleteForward();

      expect(editor.read.children()).toEqual(expected.children);
    });

    it('merge the texts but keep the rest of the list', () => {
      const input = (
        <editor>
          <hp>
            one
            <cursor />
          </hp>
          <hul>
            <hli>
              <hlic>two</hlic>
            </hli>
            <hli>
              <hlic>three</hlic>
            </hli>
          </hul>
        </editor>
      ) as TestEditor;

      const expected = (
        <editor>
          <hp>onetwo</hp>
          <hul>
            <hli>
              <hlic>three</hlic>
            </hli>
          </hul>
        </editor>
      ) as TestEditor;

      const editor = createBaseEditor({
        plugins: [BaseBoldPlugin, BaseListPlugin],
        selection: input.selection,
        initialValue: input.children,
      });

      editor.update.text.deleteForward();

      expect(editor.read.children()).toEqual(expected.children);
    });

    it('merge the texts and move up its first child', () => {
      const input = (
        <editor>
          <hp>
            one
            <cursor />
          </hp>
          <hul>
            <hli>
              <hlic>two</hlic>
              <hul>
                <hli>
                  <hlic>twoone</hlic>
                </hli>
                <hli>
                  <hlic>twotwo</hlic>
                </hli>
              </hul>
            </hli>
            <hli>
              <hlic>three</hlic>
            </hli>
          </hul>
        </editor>
      ) as TestEditor;

      const expected = (
        <editor>
          <hp>onetwo</hp>
          <hul>
            <hli>
              <hlic>twoone</hlic>
              <hul>
                <hli>
                  <hlic>twotwo</hlic>
                </hli>
              </hul>
            </hli>
            <hli>
              <hlic>three</hlic>
            </hli>
          </hul>
        </editor>
      ) as TestEditor;

      const editor = createBaseEditor({
        plugins: [BaseBoldPlugin, BaseListPlugin],
        selection: input.selection,
        initialValue: input.children,
      });

      editor.update.text.deleteForward();

      expect(editor.read.children()).toEqual(expected.children);
    });
  });

  describe('list + list when selection is at the end of the first list', () => {
    it('merges the next item after adjacent lists normalize', () => {
      const input = (
        <editor>
          <hul>
            <hli>
              <hlic>oneone</hlic>
            </hli>
            <hli>
              <hlic>
                onetwo
                <cursor />
              </hlic>
            </hli>
          </hul>
          <hul>
            <hli>
              <hlic>twoone</hlic>
            </hli>
            <hli>
              <hlic>twotwo</hlic>
            </hli>
          </hul>
        </editor>
      ) as TestEditor;

      const expected = (
        <editor>
          <hul>
            <hli>
              <hlic>oneone</hlic>
            </hli>
            <hli>
              <hlic>onetwotwoone</hlic>
            </hli>
            <hli>
              <hlic>twotwo</hlic>
            </hli>
          </hul>
        </editor>
      ) as TestEditor;

      const editor = createBaseEditor({
        plugins: [BaseBoldPlugin, BaseListPlugin],
        selection: input.selection,
        initialValue: input.children,
      });

      editor.update.text.deleteForward();

      expect(editor.read.children()).toEqual(expected.children);
    });
  });

  describe('list where second item has multiple children', () => {
    it('merge all text into first list item', () => {
      const input = (
        <editor>
          <hul>
            <hli>
              <hlic>
                <htext />
                <cursor />
              </hlic>
            </hli>
            <hli>
              <hlic>
                <htext>one</htext>
                <htext bold>two</htext>
              </hlic>
            </hli>
          </hul>
        </editor>
      ) as TestEditor;

      const expected = (
        <editor>
          <hul>
            <hli>
              <hlic>
                <htext>
                  <cursor />
                  one
                </htext>
                <htext bold>two</htext>
              </hlic>
            </hli>
          </hul>
        </editor>
      ) as TestEditor;

      const editor = createBaseEditor({
        plugins: [BaseBoldPlugin, BaseListPlugin],
        selection: input.selection,
        initialValue: input.children,
      });

      editor.update.text.deleteForward();

      expect(editor.read.children()).toEqual(expected.children);
    });
  });

  describe('list + sublist where second item has multiple children', () => {
    it('merge all text into first sublist item', () => {
      const input = (
        <editor>
          <hul>
            <hli>
              <hlic>one</hlic>
              <hul>
                <hli>
                  <hlic>
                    <htext />
                    <cursor />
                  </hlic>
                  <hul>
                    <hli>
                      <hlic>
                        <htext>two</htext>
                        <htext bold>three</htext>
                      </hlic>
                    </hli>
                  </hul>
                </hli>
              </hul>
            </hli>
          </hul>
        </editor>
      ) as TestEditor;

      const expected = (
        <editor>
          <hul>
            <hli>
              <hlic>one</hlic>
              <hul>
                <hli>
                  <hlic>
                    <htext>
                      <cursor />
                      two
                    </htext>
                    <htext bold>three</htext>
                  </hlic>
                </hli>
              </hul>
            </hli>
          </hul>
        </editor>
      ) as TestEditor;

      const editor = createBaseEditor({
        plugins: [BaseBoldPlugin, BaseListPlugin],
        selection: input.selection,
        initialValue: input.children,
      });

      editor.update.text.deleteForward();

      expect(editor.read.children()).toEqual(expected.children);
    });
  });
});

describe('fragment deletion', () => {
  jsxt;

  const createListEditor = (input: TestEditor) =>
    createBaseEditor({
      plugins: [BaseListPlugin],
      selection: input.selection,
      initialValue: input.children,
    });

  describe('cross-list selections', () => {
    it('falls back to normal deleteFragment when the selection is not across list items', () => {
      const input = (
        <editor>
          <hp>
            a<anchor />
            bc
            <focus />d
          </hp>
        </editor>
      ) as TestEditor;
      const expected = (
        <editor>
          <hp>ad</hp>
        </editor>
      ) as TestEditor;

      const editor = createListEditor(input);

      editor.update.fragment.delete();

      expect(editor.read.children()).toEqual(expected.children);
    });

    it('uses an explicit named-root target instead of the ambient list selection', () => {
      const input = (
        <editor>
          <hul>
            <hli>
              <hlic>
                one
                <anchor />
              </hlic>
            </hli>
            <hli>
              <hlic>
                <focus />
                two
              </hlic>
            </hli>
          </hul>
        </editor>
      ) as TestEditor;
      const targetRoot = 'list-explicit-target';
      const rootOwner = {
        childRoots: { body: targetRoot },
        children: [{ text: '' }],
        type: 'listTestRootOwner',
      };
      const RootOwnerPlugin = defineBasePlugin('listTestRootOwner', {
        schema: {
          element: {
            content: schema.content.text({ default: 'text', min: 1 }),
            contentRoots: {
              body: schema.content.type('paragraph', { min: 1 }),
            },
          },
        },
      });
      const editor = createBaseEditor({
        plugins: [BaseListPlugin, RootOwnerPlugin] as AnyBasePlugin[],
        selection: input.selection,
        initialValue: input.children,
      });
      editor.update((tx) => {
        tx.nodes.insert(rootOwner, { at: [1] });
        tx.roots.create(targetRoot, [
          { children: [{ text: 'target' }], type: 'paragraph' },
        ]);
      });
      editor.update.fragment.delete({
        at: {
          anchor: { offset: 1, path: [0, 0], root: targetRoot },
          focus: { offset: 4, path: [0, 0], root: targetRoot },
        },
      });

      expect(editor.read.children()).toEqual([...input.children, rootOwner]);
      expect(editor.read.root(targetRoot)).toEqual([
        { children: [{ text: 'tet' }], type: 'paragraph' },
      ]);
    });

    it('merges sibling list items and removes the emptied end item', () => {
      const input = (
        <editor>
          <hul>
            <hli>
              <hlic>
                one
                <anchor />
              </hlic>
            </hli>
            <hli>
              <hlic>
                <focus />
                two
              </hlic>
            </hli>
            <hli>
              <hlic>three</hlic>
            </hli>
          </hul>
        </editor>
      ) as TestEditor;
      const expected = (
        <editor>
          <hul>
            <hli>
              <hlic>onetwo</hlic>
            </hli>
            <hli>
              <hlic>three</hlic>
            </hli>
          </hul>
        </editor>
      ) as TestEditor;

      const editor = createListEditor(input);

      editor.update.fragment.delete();

      expect(editor.read.children()).toEqual(expected.children);
    });

    it('removes only the emptied nested list when the outer start list is protected', () => {
      const input = (
        <editor>
          <hul>
            <hli>
              <hlic>
                one
                <anchor />
              </hlic>
              <hul>
                <hli>
                  <hlic>
                    <focus />
                    two
                  </hlic>
                </hli>
              </hul>
            </hli>
            <hli>
              <hlic>three</hlic>
            </hli>
          </hul>
        </editor>
      ) as TestEditor;
      const expected = (
        <editor>
          <hul>
            <hli>
              <hlic>onetwo</hlic>
            </hli>
            <hli>
              <hlic>three</hlic>
            </hli>
          </hul>
        </editor>
      ) as TestEditor;

      const editor = createListEditor(input);

      editor.update.fragment.delete();

      expect(editor.read.children()).toEqual(expected.children);
    });
  });
});

describe('line breaks', () => {
  jsxt;

  const createListEditor = (input: TestEditor) =>
    createBaseEditor({
      plugins: [BaseListPlugin],
      selection: input.selection,
      initialValue: input.children,
    });

  describe('list-item insertion', () => {
    it('moves an empty list item up and exits the list', () => {
      const input = (
        <editor>
          <hul>
            <hli>
              <hlic>
                <cursor />
              </hlic>
            </hli>
          </hul>
        </editor>
      ) as TestEditor;
      const expected = (
        <editor>
          <hp>
            <cursor />
          </hp>
        </editor>
      ) as TestEditor;

      const editor = createListEditor(input);

      editor.update.break.insert();

      expect(editor.read.children()).toEqual(expected.children);
      expect(editor.read.selection()).toEqual(
        projectTestSelectionRange(expected.selection!)
      );
    });

    it('inserts a sibling list item for non-empty content', () => {
      const input = (
        <editor>
          <hul>
            <hli>
              <hlic>
                one
                <cursor />
              </hlic>
            </hli>
          </hul>
        </editor>
      ) as TestEditor;
      const expected = (
        <editor>
          <hul>
            <hli>
              <hlic>one</hlic>
            </hli>
            <hli>
              <hlic>
                <cursor />
              </hlic>
            </hli>
          </hul>
        </editor>
      ) as TestEditor;

      const editor = createListEditor(input);

      editor.update.break.insert();

      expect(editor.read.children()).toEqual(expected.children);
      expect(editor.read.selection()).toEqual(
        projectTestSelectionRange(expected.selection!)
      );
    });

    it('inherits task state when inserting before a task item', () => {
      const editor = createBaseEditor({
        plugins: [
          BaseListPlugin.configure({
            initialState: { inheritCheckStateOnLineStartBreak: true },
          }),
        ],
        selection: {
          kind: 'text',
          anchor: { offset: 0, path: [0, 0, 0, 0] },
          focus: { offset: 0, path: [0, 0, 0, 0] },
        },
        initialValue: [
          {
            children: [
              {
                checked: true,
                children: [
                  {
                    children: [{ text: 'one' }],
                    type: 'listItemContent',
                  },
                ],
                type: 'listItem',
              },
            ],
            type: 'taskList',
          },
        ],
      });

      editor.update.break.insert();

      expect(editor.read.children()[0]).toMatchObject({
        children: [
          { checked: true, children: [{ children: [{ text: '' }] }] },
          { checked: true, children: [{ children: [{ text: 'one' }] }] },
        ],
      });
    });

    it('inherits task state when inserting after a task item', () => {
      const editor = createBaseEditor({
        plugins: [
          BaseListPlugin.configure({
            initialState: { inheritCheckStateOnLineEndBreak: true },
          }),
        ],
        selection: {
          kind: 'text',
          anchor: { offset: 3, path: [0, 0, 0, 0] },
          focus: { offset: 3, path: [0, 0, 0, 0] },
        },
        initialValue: [
          {
            children: [
              {
                checked: true,
                children: [
                  {
                    children: [{ text: 'one' }],
                    type: 'listItemContent',
                  },
                ],
                type: 'listItem',
              },
            ],
            type: 'taskList',
          },
        ],
      });

      editor.update.break.insert();

      expect(editor.read.children()[0]).toMatchObject({
        children: [
          { checked: true, children: [{ children: [{ text: 'one' }] }] },
          { checked: true, children: [{ children: [{ text: '' }] }] },
        ],
      });
      const selection = editor.read.selection();

      expect(selection?.anchor.path).toEqual([0, 1, 0, 0]);
    });

    it('falls back to normal insertBreak outside lists', () => {
      const input = (
        <editor>
          <hp>
            o<cursor />
            ne
          </hp>
        </editor>
      ) as TestEditor;
      const expected = (
        <editor>
          <hp>o</hp>
          <hp>
            <cursor />
            ne
          </hp>
        </editor>
      ) as TestEditor;

      const editor = createListEditor(input);

      editor.update.break.insert();

      expect(editor.read.children()).toEqual(expected.children);
      expect(editor.read.selection()).toEqual(
        projectTestSelectionRange(expected.selection!)
      );
    });
  });
});

describe('pasting', () => {
  jsxt;

  const editorTest = (input: any, fragment: any, expected: any) => {
    const editor = createBaseEditor({
      plugins: [BaseListPlugin],
      selection: input.selection,
      initialValue: input.children,
    });

    editor.update.fragment.replace(fragment);

    expect(editor.read.children()).toEqual(expected.children);
  };

  describe('when pasting ul > 2 li fragment', () => {
    describe('when selection in li', () => {
      it('insert lis next to the lowest li', () => {
        const input = (
          <editor>
            <hul>
              <hli>
                <hlic>one</hlic>
                <hul>
                  <hli>
                    <hlic>
                      two
                      <cursor />
                    </hlic>
                  </hli>
                </hul>
              </hli>
              <hli>
                <hlic>five</hlic>
              </hli>
            </hul>
          </editor>
        ) as TestEditor;

        const fragment = (
          <fragment>
            <hul>
              <hli>
                <hlic>three</hlic>
              </hli>
              <hli>
                <hlic>four</hlic>
              </hli>
            </hul>
          </fragment>
        ) as any as Descendant[];

        const expected = (
          <editor>
            <hul>
              <hli>
                <hlic>one</hlic>
                <hul>
                  <hli>
                    <hlic>two</hlic>
                  </hli>
                  <hli>
                    <hlic>three</hlic>
                  </hli>
                  <hli>
                    <hlic>four</hlic>
                  </hli>
                </hul>
              </hli>
              <hli>
                <hlic>five</hlic>
              </hli>
            </hul>
          </editor>
        ) as TestEditor;

        editorTest(input, fragment, expected);
      });

      it('insert nested lis next to the lowest li, without the leading empty lis', () => {
        const input = (
          <editor>
            <hul>
              <hli>
                <hlic>one</hlic>
                <hul>
                  <hli>
                    <hlic>
                      two
                      <cursor />
                    </hlic>
                  </hli>
                </hul>
              </hli>
              <hli>
                <hlic>four</hlic>
              </hli>
            </hul>
          </editor>
        ) as TestEditor;

        const fragment = (
          <fragment>
            <hul>
              <hli>
                <hlic>three</hlic>
                <hul>
                  <hli>
                    <hlic>five</hlic>
                  </hli>
                </hul>
              </hli>
            </hul>
          </fragment>
        ) as any as Descendant[];

        const expected = (
          <editor>
            <hul>
              <hli>
                <hlic>one</hlic>
                <hul>
                  <hli>
                    <hlic>two</hlic>
                  </hli>
                  <hli>
                    <hlic>three</hlic>
                    <hul>
                      <hli>
                        <hlic>five</hlic>
                      </hli>
                    </hul>
                  </hli>
                </hul>
              </hli>
              <hli>
                <hlic>four</hlic>
              </hli>
            </hul>
          </editor>
        ) as TestEditor;

        editorTest(input, fragment, expected);
      });

      it('insert nested lis with selected lic being an empty node and with nested lis', () => {
        const input = (
          <editor>
            <hul>
              <hli>
                <hlic>one</hlic>
                <hul>
                  <hli>
                    <hlic>
                      <cursor />
                    </hlic>
                    <hul>
                      <hli>
                        <hlic>two</hlic>
                      </hli>
                    </hul>
                  </hli>
                </hul>
              </hli>
              <hli>
                <hlic>four</hlic>
              </hli>
            </hul>
          </editor>
        ) as TestEditor;

        const fragment = (
          <fragment>
            <hul>
              <hli>
                <hlic>three</hlic>
                <hul>
                  <hli>
                    <hlic>five</hlic>
                  </hli>
                </hul>
              </hli>
            </hul>
          </fragment>
        ) as any as Descendant[];

        const expected = (
          <editor>
            <hul>
              <hli>
                <hlic>one</hlic>
                <hul>
                  <hli>
                    <hlic>three</hlic>
                    <hul>
                      <hli>
                        <hlic>five</hlic>
                      </hli>
                      <hli>
                        <hlic>two</hlic>
                      </hli>
                    </hul>
                  </hli>
                </hul>
              </hli>
              <hli>
                <hlic>four</hlic>
              </hli>
            </hul>
          </editor>
        ) as TestEditor;

        editorTest(input, fragment, expected);
      });

      it('insert nested lis with selected lic being an empty node', () => {
        const input = (
          <editor>
            <hul>
              <hli>
                <hlic>one</hlic>
                <hul>
                  <hli>
                    <hlic>
                      <cursor />
                    </hlic>
                  </hli>
                </hul>
              </hli>
              <hli>
                <hlic>four</hlic>
              </hli>
            </hul>
          </editor>
        ) as TestEditor;

        const fragment = (
          <fragment>
            <hul>
              <hli>
                <hlic>three</hlic>
                <hul>
                  <hli>
                    <hlic>five</hlic>
                  </hli>
                </hul>
              </hli>
            </hul>
          </fragment>
        ) as any as Descendant[];

        const expected = (
          <editor>
            <hul>
              <hli>
                <hlic>one</hlic>
                <hul>
                  <hli>
                    <hlic>three</hlic>
                    <hul>
                      <hli>
                        <hlic>five</hlic>
                      </hli>
                    </hul>
                  </hli>
                </hul>
              </hli>
              <hli>
                <hlic>four</hlic>
              </hli>
            </hul>
          </editor>
        ) as TestEditor;

        editorTest(input, fragment, expected);
      });

      it('insert lis with missing lics due to copying lis at different levels', () => {
        const input = (
          <editor>
            <hul>
              <hli>
                <hlic>one</hlic>
                <hul>
                  <hli>
                    <hlic>
                      two
                      <cursor />
                    </hlic>
                  </hli>
                </hul>
              </hli>
              <hli>
                <hlic>four</hlic>
              </hli>
            </hul>
          </editor>
        ) as TestEditor;

        const fragment = (
          <fragment>
            <hul>
              <hli>
                <hul>
                  <hli>
                    <hlic>five</hlic>
                  </hli>
                  <hli>
                    <hlic>six</hlic>
                  </hli>
                </hul>
              </hli>
            </hul>
          </fragment>
        ) as any as Descendant[];

        const expected = (
          <editor>
            <hul>
              <hli>
                <hlic>one</hlic>
                <hul>
                  <hli>
                    <hlic>two</hlic>
                  </hli>
                  <hli>
                    <hlic>five</hlic>
                  </hli>
                  <hli>
                    <hlic>six</hlic>
                  </hli>
                </hul>
              </hli>
              <hli>
                <hlic>four</hlic>
              </hli>
            </hul>
          </editor>
        ) as TestEditor;

        editorTest(input, fragment, expected);
      });

      it('insert a single li as text', () => {
        const input = (
          <editor>
            <hul>
              <hli>
                <hlic>one</hlic>
              </hli>
              <hli>
                <hlic>
                  two
                  <cursor />
                </hlic>
              </hli>
              <hli>
                <hlic>four</hlic>
              </hli>
            </hul>
          </editor>
        ) as TestEditor;

        const fragment = (
          <fragment>
            <hul>
              <hli>
                <hlic>three</hlic>
              </hli>
            </hul>
          </fragment>
        ) as any as Descendant[];

        const expected = (
          <editor>
            <hul>
              <hli>
                <hlic>one</hlic>
              </hli>
              <hli>
                <hlic>
                  twothree
                  <cursor />
                </hlic>
              </hli>
              <hli>
                <hlic>four</hlic>
              </hli>
            </hul>
          </editor>
        ) as TestEditor;

        editorTest(input, fragment, expected);
      });

      it('insert a paragraph and a list', () => {
        const input = (
          <editor>
            <hul>
              <hli>
                <hlic>one</hlic>
              </hli>
              <hli>
                <hlic>
                  two
                  <cursor />
                </hlic>
              </hli>
              <hli>
                <hlic>five</hlic>
              </hli>
            </hul>
          </editor>
        ) as TestEditor;

        const fragment = (
          <fragment>
            <hp>three</hp>
            <hul>
              <hli>
                <hlic>four</hlic>
              </hli>
            </hul>
          </fragment>
        ) as any as Descendant[];

        const expected = (
          <editor>
            <hul>
              <hli>
                <hlic>one</hlic>
              </hli>
              <hli>
                <hlic>twothree</hlic>
              </hli>
              <hli>
                <hlic>four</hlic>
              </hli>
              <hli>
                <hlic>
                  five
                  <cursor />
                </hlic>
              </hli>
            </hul>
          </editor>
        ) as TestEditor;

        editorTest(input, fragment, expected);
      });

      it('insert multiple paragraphs', () => {
        const input = (
          <editor>
            <hul>
              <hli>
                <hlic>one</hlic>
              </hli>
              <hli>
                <hlic>
                  two
                  <cursor />
                </hlic>
              </hli>
              <hli>
                <hlic>five</hlic>
              </hli>
            </hul>
          </editor>
        ) as TestEditor;

        const fragment = (
          <fragment>
            <hp>three</hp>
            <hp>four</hp>
          </fragment>
        ) as any as Descendant[];

        const expected = (
          <editor>
            <hul>
              <hli>
                <hlic>one</hlic>
              </hli>
              <hli>
                <hlic>twothree</hlic>
              </hli>
              <hli>
                <hlic>four</hlic>
              </hli>
              <hli>
                <hlic>
                  five
                  <cursor />
                </hlic>
              </hli>
            </hul>
          </editor>
        ) as TestEditor;

        editorTest(input, fragment, expected);
      });

      // Auto-correct generates a Paragraph node (in Chromium)
      it('insert autocorrect-inserted paragraph inside a list', () => {
        const input = (
          <editor>
            <hul>
              <hli>
                <hlic>one</hlic>
              </hli>
              <hli>
                <hlic>
                  two
                  <cursor />
                  four
                </hlic>
              </hli>
              <hli>
                <hlic>five</hlic>
              </hli>
            </hul>
          </editor>
        ) as TestEditor;

        const fragment = (
          <fragment>
            <hp>three</hp>
          </fragment>
        ) as any as Descendant[];

        const expected = (
          <editor>
            <hul>
              <hli>
                <hlic>one</hlic>
              </hli>
              <hli>
                <hlic>
                  twothreefour
                  <cursor />
                </hlic>
              </hli>
              <hli>
                <hlic>five</hlic>
              </hli>
            </hul>
          </editor>
        ) as TestEditor;

        editorTest(input, fragment, expected);
      });

      it('insert simple text inside a list with selection across multiple list items', () => {
        const input = (
          <editor>
            <hul>
              <hli>
                <hlic>one</hlic>
              </hli>
              <hli>
                <hlic>twofour</hlic>
              </hli>
              <hli>
                <hlic>five</hlic>
              </hli>
            </hul>
            <selection>
              <anchor offset={0} path={[0, 0, 0, 0]} />
              <focus offset={3} path={[0, 1, 0, 0]} />
            </selection>
          </editor>
        ) as TestEditor;

        const fragment = (
          <fragment>
            <hp>three</hp>
          </fragment>
        ) as any as Descendant[];

        const expected = (
          <editor>
            <hul>
              <hli>
                <hlic>
                  threefour
                  <cursor />
                </hlic>
              </hli>
              <hli>
                <hlic>five</hlic>
              </hli>
            </hul>
          </editor>
        ) as TestEditor;

        editorTest(input, fragment, expected);
      });

      it('insert nested lis with selected lic being an empty node after selection removed', () => {
        const input = (
          <editor>
            <hul>
              <hli>
                <hlic>one</hlic>
              </hli>
              <hli>
                <hlic>two</hlic>
              </hli>
              <hli>
                <hlic>three</hlic>
              </hli>
            </hul>
            <selection>
              <anchor offset={0} path={[0, 0, 0, 0]} />
              <focus offset={3} path={[0, 1, 0, 0]} />
            </selection>
          </editor>
        ) as TestEditor;

        const fragment = (
          <fragment>
            <hul>
              <hli>
                <hlic>four</hlic>
                <hul>
                  <hli>
                    <hlic>five</hlic>
                  </hli>
                </hul>
              </hli>
            </hul>
          </fragment>
        ) as any as Descendant[];

        const expected = (
          <editor>
            <hul>
              <hli>
                <hlic>four</hlic>
                <hul>
                  <hli>
                    <hlic>five</hlic>
                  </hli>
                </hul>
              </hli>
              <hli>
                <hlic>three</hlic>
              </hli>
            </hul>
          </editor>
        ) as TestEditor;

        editorTest(input, fragment, expected);
      });

      it('insert nested lis with selection across multiple lics', () => {
        const input = (
          <editor>
            <hul>
              <hli>
                <hlic>onetwo</hlic>
              </hli>
              <hli>
                <hlic>three</hlic>
              </hli>
              <hli>
                <hlic>four</hlic>
              </hli>
            </hul>
            <selection>
              <anchor offset={3} path={[0, 0, 0, 0]} />
              <focus offset={5} path={[0, 1, 0, 0]} />
            </selection>
          </editor>
        ) as TestEditor;

        const fragment = (
          <fragment>
            <hul>
              <hli>
                <hlic>five</hlic>
              </hli>
              <hli>
                <hlic>six</hlic>
                <hul>
                  <hli>
                    <hlic>seven</hlic>
                  </hli>
                </hul>
              </hli>
            </hul>
          </fragment>
        ) as any as Descendant[];

        const expected = (
          <editor>
            <hul>
              <hli>
                <hlic>one</hlic>
              </hli>
              <hli>
                <hlic>five</hlic>
              </hli>
              <hli>
                <hlic>six</hlic>
                <hul>
                  <hli>
                    <hlic>seven</hlic>
                  </hli>
                </hul>
              </hli>
              <hli>
                <hlic>four</hlic>
              </hli>
            </hul>
          </editor>
        ) as TestEditor;

        editorTest(input, fragment, expected);
      });
    });

    describe('when selection not in li', () => {
      for (const openDepth of [0, 1]) {
        it(`delegates an ${openDepth === 0 ? 'closed' : 'open'} list-root slice unchanged to one core fit`, () => {
          const input = (
            <editor>
              <hp>
                one
                <cursor />
              </hp>
            </editor>
          ) as TestEditor;
          const fragment = (
            <fragment>
              <hul>
                <hli>
                  <hlic>two</hlic>
                </hli>
              </hul>
            </fragment>
          ) as any as Descendant[];
          const editor = createBaseEditor({
            plugins: [BaseListPlugin],
            selection: input.selection,
            initialValue: input.children,
          });
          const seen: unknown[] = [];

          editor.install(
            defineExtension(`list-root-delegation-${openDepth}`, {
              commands: ({ handle }) => [
                handle(editorCommands.replaceSlice, ({ input: innerInput }) => {
                  seen.push(innerInput.slice);

                  return false;
                }),
              ],
            })
          );

          const slice = ContentSlice.fromJSON({
            content: fragment,
            openEnd: openDepth,
            openStart: openDepth,
          });
          const profilerGlobal = globalThis as typeof globalThis & {
            __PLITE_REACT_RENDER_PROFILER__?: {
              acceptsCoreDuration: (id: string) => boolean;
              record: (event: { id: string }) => void;
            };
          };
          const previous = profilerGlobal.__PLITE_REACT_RENDER_PROFILER__;
          const events: string[] = [];

          profilerGlobal.__PLITE_REACT_RENDER_PROFILER__ = {
            acceptsCoreDuration: (id) => id === 'slice-fit-input',
            record: ({ id }) => {
              if (id) events.push(id);
            },
          };

          try {
            editor.update.slice.replace(slice);
          } finally {
            profilerGlobal.__PLITE_REACT_RENDER_PROFILER__ = previous;
          }

          expect(seen).toEqual([slice]);
          expect(events).toEqual(['slice-fit-input']);
        });
      }

      it('paste the list', () => {
        const input = (
          <editor>
            <hp>
              one
              <cursor />
            </hp>
          </editor>
        ) as TestEditor;

        const fragment = (
          <fragment>
            <hul>
              <hli>
                <hlic>two</hlic>
              </hli>
            </hul>
          </fragment>
        ) as any as Descendant[];

        const expected = (
          <editor>
            <hp>
              one
              <cursor />
            </hp>
            <hul>
              <hli>
                <hlic>two</hlic>
              </hli>
            </hul>
          </editor>
        ) as TestEditor;

        editorTest(input, fragment, expected);
      });

      it('paste the list with multiple lis', () => {
        const input = (
          <editor>
            <hp>
              one
              <cursor />
            </hp>
          </editor>
        ) as TestEditor;

        const fragment = (
          <fragment>
            <hul>
              <hli>
                <hlic>two</hlic>
              </hli>
              <hli>
                <hlic>three</hlic>
              </hli>
            </hul>
          </fragment>
        ) as any as Descendant[];

        const expected = (
          <editor>
            <hp>
              one
              <cursor />
            </hp>
            <hul>
              <hli>
                <hlic>two</hlic>
              </hli>
              <hli>
                <hlic>three</hlic>
              </hli>
            </hul>
          </editor>
        ) as TestEditor;

        editorTest(input, fragment, expected);
      });
    });

    describe('when pasted lis not contain lic', () => {
      it('normalize li children', () => {
        const input = (
          <editor>
            <hp>
              P
              <cursor />
            </hp>
          </editor>
        ) as TestEditor;

        const fragment = (
          <fragment>
            <hul>
              <hli>
                <hp>one</hp>
              </hli>
              <hli>
                <hp>two</hp>
                <hul>
                  <hli>
                    <hp>three</hp>
                  </hli>
                </hul>
              </hli>
            </hul>
          </fragment>
        ) as any as Descendant[];

        const expected = (
          <editor>
            <hp>
              P
              <cursor />
            </hp>
            <hul>
              <hli>
                <hlic>one</hlic>
              </hli>
              <hli>
                <hlic>two</hlic>
                <hul>
                  <hli>
                    <hlic>three</hlic>
                  </hli>
                </hul>
              </hli>
            </hul>
          </editor>
        ) as TestEditor;

        editorTest(input, fragment, expected);
      });
    });
  });
});

describe('indentation', () => {
  jsxt;

  /*
  input:
  1. E1
  2. |E2

  output:
  1. E1
    1. |E2
  */
  it('indent single list item (start of item)', () => {
    const input = (
      <editor>
        <hul>
          <hli>
            <hlic>E1</hlic>
          </hli>
          <hli>
            <hlic>
              <cursor />
              E2
            </hlic>
          </hli>
        </hul>
      </editor>
    ) as any;

    const output = (
      <editor>
        <hul>
          <hli>
            <hlic>E1</hlic>
            <hul>
              <hli>
                <hlic>
                  <cursor />
                  E2
                </hlic>
              </hli>
            </hul>
          </hli>
        </hul>
      </editor>
    ) as any;

    const editor = createBaseEditor({
      plugins: [BaseListPlugin],
      selection: input.selection,
      initialValue: input.children,
    });

    editor.plugin(BaseListPlugin).update.indent();
    expect(editor.read.children()).toEqual(output.children);
  });

  /*
  input:
  1. E1
  2. E2|

  output:
  1. E1
    1. E2|
  */
  it('indent single list item (end of item)', () => {
    const input = (
      <editor>
        <hul>
          <hli>
            <hlic>E1</hlic>
          </hli>
          <hli>
            <hlic>
              E2
              <cursor />
            </hlic>
          </hli>
        </hul>
      </editor>
    ) as any;

    const output = (
      <editor>
        <hul>
          <hli>
            <hlic>E1</hlic>
            <hul>
              <hli>
                <hlic>
                  E2
                  <cursor />
                </hlic>
              </hli>
            </hul>
          </hli>
        </hul>
      </editor>
    ) as any;

    const editor = createBaseEditor({
      plugins: [BaseListPlugin],
      selection: input.selection,
      initialValue: input.children,
    });

    editor.plugin(BaseListPlugin).update.indent();
    expect(editor.read.children()).toEqual(output.children);
  });

  /*
  input:
  1. E1
  2. |E2
  3. E3|

  output:
  1. E1
    1. |E2
    2. E3|
  */
  it('indent multiple list items (start/end)', () => {
    const input = (
      <editor>
        <hul>
          <hli>
            <hlic>E1</hlic>
          </hli>
          <hli>
            <hlic>
              <focus />
              E2
            </hlic>
          </hli>
          <hli>
            <hlic>
              E3
              <anchor />
            </hlic>
          </hli>
        </hul>
      </editor>
    ) as any;

    const output = (
      <editor>
        <hul>
          <hli>
            <hlic>E1</hlic>
            <hul>
              <hli>
                <hlic>
                  <focus />
                  E2
                </hlic>
              </hli>
              <hli>
                <hlic>
                  E3
                  <anchor />
                </hlic>
              </hli>
            </hul>
          </hli>
        </hul>
      </editor>
    ) as any;

    const editor = createBaseEditor({
      plugins: [BaseListPlugin],
      selection: input.selection,
      initialValue: input.children,
    });

    editor.plugin(BaseListPlugin).update.indent();
    expect(editor.read.children()).toEqual(output.children);
  });

  /*
  input:
  1. E1
    1. |E2
    2. E3|

  output:
  1. E1
  2. |E2
  3. E3|
  */
  it('un-indent multiple list items (start/end)', () => {
    const input = (
      <editor>
        <hul>
          <hli>
            <hlic>E1</hlic>
            <hul>
              <hli>
                <hlic>
                  <focus />
                  E2
                </hlic>
              </hli>
              <hli>
                <hlic>
                  E3
                  <anchor />
                </hlic>
              </hli>
            </hul>
          </hli>
        </hul>
      </editor>
    ) as any;

    const output = (
      <editor>
        <hul>
          <hli>
            <hlic>E1</hlic>
          </hli>
          <hli>
            <hlic>
              <focus />
              E2
            </hlic>
          </hli>
          <hli>
            <hlic>
              E3
              <anchor />
            </hlic>
          </hli>
        </hul>
      </editor>
    ) as any;

    const editor = createBaseEditor({
      plugins: [BaseListPlugin],
      selection: input.selection,
      initialValue: input.children,
    });

    editor.plugin(BaseListPlugin).update.outdent();
    expect(editor.read.children()).toEqual(output.children);
  });

  /*
  input:
  1. E1
    1. |E2
    2. E3
  |

  output:
  1. E1
  2. |E2
  3. E3
  |
  */
  it('un-indent multiple list items (start/out)', () => {
    const input = (
      <editor>
        <hul>
          <hli>
            <hlic>E1</hlic>
            <hul>
              <hli>
                <hlic>
                  <focus />
                  E2
                </hlic>
              </hli>
              <hli>
                <hlic>
                  E3
                  <anchor />
                </hlic>
              </hli>
            </hul>
          </hli>
        </hul>
      </editor>
    ) as any;

    const output = (
      <editor>
        <hul>
          <hli>
            <hlic>E1</hlic>
          </hli>
          <hli>
            <hlic>
              <focus />
              E2
            </hlic>
          </hli>
          <hli>
            <hlic>
              E3
              <anchor />
            </hlic>
          </hli>
        </hul>
      </editor>
    ) as any;

    const editor = createBaseEditor({
      plugins: [BaseListPlugin],
      selection: input.selection,
      initialValue: input.children,
    });

    editor.plugin(BaseListPlugin).update.outdent();
    expect(editor.read.children()).toEqual(output.children);
  });

  it('unhang before indentation', () => {
    const input = (
      <editor>
        <hul>
          <hli>
            <hlic>E1</hlic>
          </hli>
          <hli>
            <hlic>
              <focus />
              E2
            </hlic>
          </hli>
          <hli>
            <hlic>E3</hlic>
          </hli>
        </hul>
        <hp>
          <htext>
            <anchor />
            paragraph
          </htext>
        </hp>
      </editor>
    ) as any;

    const output = (
      <editor>
        <hul>
          <hli>
            <hlic>E1</hlic>
            <hul>
              <hli>
                <hlic>
                  <focus />
                  E2
                </hlic>
              </hli>
              <hli>
                <hlic>E3</hlic>
              </hli>
            </hul>
          </hli>
        </hul>
        <hp>
          <htext>
            <anchor />
            paragraph
          </htext>
        </hp>
      </editor>
    ) as any;

    const editor = createBaseEditor({
      plugins: [BaseListPlugin],
      selection: input.selection,
      initialValue: input.children,
    });

    editor.plugin(BaseListPlugin).update.indent();
    expect(editor.read.children()).toEqual(output.children);
  });

  it('does not not adjust selection length when unhanging ranges', () => {
    const input = (
      <editor>
        <hp>
          Some Text <anchor />
          More Text
          <focus />
        </hp>
      </editor>
    ) as any;
    const editor = createBaseEditor({
      plugins: [BaseListPlugin],
      selection: input.selection,
      initialValue: input.children,
    });

    const selectionBefore = editor.read.selection();

    editor.plugin(BaseListPlugin).update.indent();
    expect(editor.read.selection()).toEqual(selectionBefore);

    // Do the same with shift tab.
    editor.plugin(BaseListPlugin).update.outdent();
    expect(editor.read.selection()).toEqual(selectionBefore);
  });

  it('convert top-level list item into body upon unindent if enableResetOnShiftTab is true', () => {
    const input = (
      <editor>
        <hul>
          <hli>
            <hlic>E1</hlic>
          </hli>
          <hli>
            <hlic>
              <cursor />
              E2
            </hlic>
          </hli>
          <hli>
            <hlic>E3</hlic>
          </hli>
        </hul>
      </editor>
    ) as any;

    const output = (
      <editor>
        <hul>
          <hli>
            <hlic>E1</hlic>
          </hli>
        </hul>
        <hp>
          <htext>E2</htext>
        </hp>
        <hul>
          <hli>
            <hlic>E3</hlic>
          </hli>
        </hul>
      </editor>
    ) as any;

    const editor = createBaseEditor({
      plugins: [
        BaseListPlugin.configure({
          initialState: { enableResetOnShiftTab: true },
        }),
      ],
      selection: input.selection,
      initialValue: input.children,
    });

    editor.plugin(BaseListPlugin).update.outdent();
    expect(editor.read.children()).toEqual(output.children);
  });

  it('convert top-level (first) list item into body upon unindent if enableResetOnShiftTab is true', () => {
    const input = (
      <editor>
        <hul>
          <hli>
            <hlic>
              <cursor />
              E1
            </hlic>
          </hli>
          <hli>
            <hlic>E2</hlic>
          </hli>
          <hli>
            <hlic>E3</hlic>
          </hli>
        </hul>
      </editor>
    ) as any;

    const output = (
      <editor>
        <hp>
          <htext>E1</htext>
        </hp>
        <hul>
          <hli>
            <hlic>E2</hlic>
          </hli>
          <hli>
            <hlic>E3</hlic>
          </hli>
        </hul>
      </editor>
    ) as any;

    const editor = createBaseEditor({
      plugins: [
        BaseListPlugin.configure({
          initialState: { enableResetOnShiftTab: true },
        }),
      ],
      selection: input.selection,
      initialValue: input.children,
    });

    editor.plugin(BaseListPlugin).update.outdent();
    expect(editor.read.children()).toEqual(output.children);
  });

  it('convert top-level (last) list item into body upon unindent if enableResetOnShiftTab is true', () => {
    const input = (
      <editor>
        <hul>
          <hli>
            <hlic>E1</hlic>
          </hli>
          <hli>
            <hlic>E2</hlic>
          </hli>
          <hli>
            <hlic>
              <cursor />
              E3
            </hlic>
          </hli>
        </hul>
      </editor>
    ) as any;

    const output = (
      <editor>
        <hul>
          <hli>
            <hlic>E1</hlic>
          </hli>
          <hli>
            <hlic>E2</hlic>
          </hli>
        </hul>
        <hp>
          <htext>E3</htext>
        </hp>
      </editor>
    ) as any;

    const editor = createBaseEditor({
      plugins: [
        BaseListPlugin.configure({
          initialState: { enableResetOnShiftTab: true },
        }),
      ],
      selection: input.selection,
      initialValue: input.children,
    });

    editor.plugin(BaseListPlugin).update.outdent();
    expect(editor.read.children()).toEqual(output.children);
  });

  it('does not convert top-level list item into body upon unindent if enableResetOnShiftTab is false', () => {
    const input = (
      <editor>
        <hul>
          <hli>
            <hlic>E1</hlic>
          </hli>
          <hli>
            <hlic>
              <cursor />
              E2
            </hlic>
          </hli>
          <hli>
            <hlic>E3</hlic>
          </hli>
        </hul>
      </editor>
    ) as any;

    const output = (
      <editor>
        <hul>
          <hli>
            <hlic>E1</hlic>
          </hli>
          <hli>
            <hlic>
              <cursor />
              E2
            </hlic>
          </hli>
          <hli>
            <hlic>E3</hlic>
          </hli>
        </hul>
      </editor>
    ) as any;

    const editor = createBaseEditor({
      plugins: [BaseListPlugin],
      selection: input.selection,
      initialValue: input.children,
    });

    editor.plugin(BaseListPlugin).update.outdent();
    expect(editor.read.children()).toEqual(output.children);
  });
});

describe('editing', () => {
  jsxt;

  const BaseBlockquotePlugin = defineBasePlugin('blockquote', {
    schema: {
      element: {
        content: schema.content.text({ default: 'text', min: 1 }),
      },
    },
  });

  const testInsertText = (
    input: any,
    expected: any,
    plugins: AnyBasePlugin[] = [BaseListPlugin]
  ) => {
    const editor = createBaseEditor({
      plugins: [BaseBlockquotePlugin, ...plugins],
      selection: input.selection,
      initialValue: input.children,
    });

    editor.update.text.insert('o');

    expect(editor.read.children()).toEqual(expected.children);
  };

  const testDeleteBackward = (input: any, expected: any) => {
    const editor = createBaseEditor({
      plugins: [BaseListPlugin],
      selection: input.selection,
      initialValue: input.children,
    });

    editor.update.text.deleteBackward();

    expect(editor.read.children()).toEqual(expected.children);
  };

  const testDeleteForward = (input: any, expected: any) => {
    const editor = createBaseEditor({
      plugins: [BaseListPlugin],
      selection: input.selection,
      initialValue: input.children,
    });

    editor.update.text.deleteForward();

    expect(editor.read.children()).toEqual(expected.children);
  };

  describe('delete behavior', () => {
    describe('normalizeList', () => {
      describe('when li contains a configured valid element', () => {
        it('keep the block untouched', () => {
          const input = (
            <editor>
              <hul>
                <hli>
                  <hp>world</hp>
                  <hul>
                    <hli>
                      <hblockquote>
                        hell
                        <cursor />
                      </hblockquote>
                    </hli>
                  </hul>
                </hli>
              </hul>
            </editor>
          ) as TestEditor;

          const expected = (
            <editor>
              <hul>
                <hli>
                  <hp>world</hp>
                  <hul>
                    <hli>
                      <hblockquote>hello</hblockquote>
                    </hli>
                  </hul>
                </hli>
              </hul>
            </editor>
          ) as TestEditor;

          testInsertText(input, expected, [
            BaseListPlugin,
            BaseListItemPlugin.configure({
              initialState: {
                validLiChildren: [BaseParagraphPlugin, BaseBlockquotePlugin],
              },
            }),
          ]);
        });
      });
    });

    describe('when deleteBackward at block start', () => {
      describe('when at first li', () => {
        it('unindents li children and unwraps the list', () => {
          const input = (
            <editor>
              <hp>test</hp>
              <hul>
                <hli>
                  <hlic>
                    <cursor />
                    hello
                  </hlic>
                  <hul>
                    <hli>
                      <hlic>world</hlic>
                    </hli>
                  </hul>
                </hli>
              </hul>
            </editor>
          ) as TestEditor;

          const expected = (
            <editor>
              <hp>test</hp>
              <hp>hello</hp>
              <hul>
                <hli>
                  <hlic>world</hlic>
                </hli>
              </hul>
            </editor>
          ) as TestEditor;

          testDeleteBackward(input, expected);
        });
      });

      describe('when at nested li without li children', () => {
        it('delete the li and merge the text nodes to the previous li', () => {
          const input = (
            <editor>
              <hp>test</hp>
              <hul>
                <hli>
                  <hlic>hello</hlic>
                  <hul>
                    <hli>
                      <hlic>
                        <cursor />
                        world
                      </hlic>
                    </hli>
                  </hul>
                </hli>
              </hul>
            </editor>
          ) as TestEditor;

          const expected = (
            <editor>
              <hp>test</hp>
              <hul>
                <hli>
                  <hlic>helloworld</hlic>
                </hli>
              </hul>
            </editor>
          ) as TestEditor;

          testDeleteBackward(input, expected);
        });
      });

      describe('when the list is not nested and li is not the first child', () => {
        it('move li up', () => {
          const input = (
            <editor>
              <hp>test</hp>
              <hul>
                <hli>
                  <hlic>hello</hlic>
                </hli>
                <hli>
                  <hlic>
                    <cursor />
                    world
                  </hlic>
                </hli>
              </hul>
            </editor>
          ) as TestEditor;

          const expected = (
            <editor>
              <hp>test</hp>
              <hul>
                <hli>
                  <hlic>hello</hlic>
                </hli>
              </hul>
              <hp>world</hp>
            </editor>
          ) as TestEditor;

          testDeleteBackward(input, expected);
        });
      });
    });

    describe('when the list is nested and its children list is not wrapped in li', () => {
      describe('when deleteForward at block end', () => {
        it('merge the next element when last child', () => {
          const input = (
            <editor>
              <hul>
                <hli>
                  <hlic>
                    level 1<cursor />
                  </hlic>
                </hli>
              </hul>
              <hp>level 2</hp>
            </editor>
          ) as TestEditor;

          const expected = (
            <editor>
              <hul>
                <hli>
                  <hlic>
                    level 1
                    <cursor />
                    level 2
                  </hlic>
                </hli>
              </hul>
            </editor>
          ) as TestEditor;

          testDeleteForward(input, expected);
        });

        it('merge next sibling li', () => {
          const input = (
            <editor>
              <hul>
                <hli>
                  <hlic>
                    level 1<cursor />
                  </hlic>
                </hli>
                <hli>
                  <hlic>level 2</hlic>
                </hli>
              </hul>
            </editor>
          ) as TestEditor;

          const expected = (
            <editor>
              <hul>
                <hli>
                  <hlic>
                    level 1
                    <cursor />
                    level 2
                  </hlic>
                </hli>
              </hul>
            </editor>
          ) as TestEditor;

          testDeleteForward(input, expected);
        });

        it('merge next li and shift one level up', () => {
          const input = (
            <editor>
              <hul>
                <hli>
                  <hlic>level 1</hlic>
                  <hul>
                    <hli>
                      <hlic>
                        level 2<cursor />
                      </hlic>
                    </hli>
                  </hul>
                </hli>
                <hli>
                  <hlic>level 3</hlic>
                  <hul>
                    <hli>
                      <hlic>level 4</hlic>
                    </hli>
                  </hul>
                </hli>
              </hul>
            </editor>
          ) as TestEditor;

          const expected = (
            <editor>
              <hul>
                <hli>
                  <hlic>level 1</hlic>
                  <hul>
                    <hli>
                      <hlic>level 2level 3</hlic>
                    </hli>
                    <hli>
                      <hlic>level 4</hlic>
                    </hli>
                  </hul>
                </hli>
              </hul>
            </editor>
          ) as TestEditor;

          testDeleteForward(input, expected);
        });

        it('shift all nested lists one level up', () => {
          const input = (
            <editor>
              <hul>
                <hli>
                  <hlic>
                    level 1<cursor />
                  </hlic>
                  <hul>
                    <hli>
                      <hlic>level 2</hlic>
                      <hul>
                        <hli>
                          <hlic>level 3</hlic>
                          <hul>
                            <hli>
                              <hlic>level 4</hlic>
                            </hli>
                          </hul>
                        </hli>
                        <hli>
                          <hlic>level 5</hlic>
                        </hli>
                      </hul>
                    </hli>
                  </hul>
                </hli>
                <hli>
                  <hlic>level 1</hlic>
                </hli>
              </hul>
            </editor>
          ) as TestEditor;

          const expected = (
            <editor>
              <hul>
                <hli>
                  <hlic>
                    level 1
                    <cursor />
                    level 2
                  </hlic>
                  <hul>
                    <hli>
                      <hlic>level 3</hlic>
                      <hul>
                        <hli>
                          <hlic>level 4</hlic>
                        </hli>
                      </hul>
                    </hli>
                    <hli>
                      <hlic>level 5</hlic>
                    </hli>
                  </hul>
                </hli>
                <hli>
                  <hlic>level 1</hlic>
                </hli>
              </hul>
            </editor>
          ) as TestEditor;

          testDeleteForward(input, expected);
        });
      });
    });
  });
});

describe('normalization', () => {
  jsxt;

  const testNormalize = (
    input: TestEditorFixture,
    output: TestEditorFixture
  ): void => {
    const editor = createBaseEditor({
      plugins: [BaseListPlugin],
      selection: input.selection,
      initialValue: input.children,
    });

    editor.update.value.repair();

    expect(editor.read.children()).toEqual(output.children);
  };

  describe('merge lists', () => {
    it('does not merge lists with different type', () => {
      const input = (
        <editor>
          <hul>
            <hli>
              <hlic>1</hlic>
            </hli>
          </hul>
          <hol>
            <hli>
              <hlic>2</hlic>
            </hli>
          </hol>
        </editor>
      ) as TestEditor;

      const output = (
        <editor>
          <hul>
            <hli>
              <hlic>1</hlic>
            </hli>
          </hul>
          <hol>
            <hli>
              <hlic>2</hlic>
            </hli>
          </hol>
        </editor>
      ) as TestEditor;

      testNormalize(input, output);
    });

    it('merge the next list if it has the same type', () => {
      const input = (
        <editor>
          <hul>
            <hli>
              <hlic>1</hlic>
            </hli>
          </hul>
          <hul>
            <hli>
              <hlic>2</hlic>
            </hli>
          </hul>
        </editor>
      ) as TestEditor;

      const output = (
        <editor>
          <hul>
            <hli>
              <hlic>1</hlic>
            </hli>
            <hli>
              <hlic>2</hlic>
            </hli>
          </hul>
        </editor>
      ) as TestEditor;

      testNormalize(input, output);
    });

    it('merge the previous list if it has the same type', () => {
      const input = (
        <editor>
          <hul>
            <hli>
              <hlic>1</hlic>
            </hli>
          </hul>
          <hul>
            <hli>
              <hlic>2</hlic>
            </hli>
          </hul>
        </editor>
      ) as TestEditor;

      const output = (
        <editor>
          <hul>
            <hli>
              <hlic>1</hlic>
            </hli>
            <hli>
              <hlic>2</hlic>
            </hli>
          </hul>
        </editor>
      ) as TestEditor;

      testNormalize(input, output);
    });
  });
});
