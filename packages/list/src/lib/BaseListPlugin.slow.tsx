/** @jsx jsxt */

import {
  BaseParagraphPlugin,
  createBaseEditor,
  createBasePlugin,
  type BaseEditor,
} from '@platejs/core';
import { BaseIndentPlugin } from '@platejs/indent';
import {
  DocumentChange,
  ElementApi,
  PathApi,
  property,
  schema,
  target,
  type Element,
  type Value,
} from '@platejs/plite';
import { jsxt, type TestEditor } from '@platejs/test-utils';
import { KEYS } from '@platejs/utils';
import { omit } from 'lodash';

import { BaseListPlugin, type ToggleListOptions } from './BaseListPlugin';

jsxt;

const listPluginPage = BaseListPlugin.configure({
  options: {
    getSiblingListOptions: {
      getNextEntry: ([, path], state) => {
        const nodes = state?.nodes;
        if (!nodes) return;

        const nextPath = PathApi.next(path);
        const nextNode = nodes.get<Element>(nextPath)?.[0];

        if (!nextNode) {
          const nextPagePath = [path[0] + 1];
          const nextPageNode = nodes.get<Element>(nextPagePath)?.[0];
          const nextPageChild = nextPageNode?.children[0];

          if (!nextPageChild || !ElementApi.isElement(nextPageChild)) return;

          return [nextPageChild, nextPagePath.concat([0])];
        }

        return [nextNode, nextPath];
      },
      getPreviousEntry: ([, path], state) => {
        const nodes = state?.nodes;
        if (!nodes) return;

        const prevPath = PathApi.hasPrevious(path)
          ? PathApi.previous(path)
          : undefined;

        if (!prevPath) {
          if (path[0] === 0) return;

          const prevPagePath = [path[0] - 1];
          const node = nodes.get<Element>(prevPagePath)?.[0];

          if (!node) return;

          const lastNode = node.children.at(-1);

          if (!lastNode || !ElementApi.isElement(lastNode)) return;

          return [lastNode, prevPagePath.concat(node.children.length - 1)];
        }

        const prevNode = nodes.get<Element>(prevPath)?.[0];

        if (!prevNode) return;

        return [prevNode, prevPath];
      },
    },
  },
});

describe('BaseListPlugin toggle behavior', () => {
  const CUSTOM_H1 = 'heading-one';

  const H1Plugin = createBasePlugin({
    key: KEYS.h1,
    schema: {
      element: {
        content: schema.content.text({ default: 'text', min: 1 }),
      },
    },
  });

  const CustomH1Plugin = H1Plugin.extend({
    type: CUSTOM_H1,
  });

  const BlockquotePlugin = createBasePlugin({
    key: KEYS.blockquote,
    schema: {
      element: {
        content: schema.content.text({ default: 'text', min: 1 }),
      },
    },
  });

  const PagePlugin = createBasePlugin({
    key: 'page',
    schema: ({ plugins }) => ({
      element: {
        content: plugins.blockContent({
          default: { type: plugins.elementType(BaseParagraphPlugin) },
          min: 1,
        }),
      },
    }),
  });

  const headingListPlugins = [
    H1Plugin,
    BlockquotePlugin,
    BaseListPlugin.configure({
      targetPluginKeys: [KEYS.blockquote, KEYS.h1, KEYS.p],
    }),
    BaseIndentPlugin.configure({
      targetPluginKeys: [KEYS.blockquote, KEYS.h1, KEYS.p],
    }),
  ];

  const customHeadingListPlugins = [
    CustomH1Plugin,
    BlockquotePlugin,
    BaseListPlugin.configure({
      targetPluginKeys: [KEYS.blockquote, KEYS.h1, KEYS.p],
    }),
    BaseIndentPlugin.configure({
      targetPluginKeys: [KEYS.blockquote, KEYS.h1, KEYS.p],
    }),
  ];

  const getToggledEditor = ({
    input,
    options,
    plugins = [BaseListPlugin],
  }: {
    input: TestEditor;
    options: ToggleListOptions;
    plugins?: any[];
  }) => {
    const editor = createBaseEditor({
      plugins,
      selection: input.selection,
      initialValue: input.children,
    });

    editor.plugin(BaseListPlugin).update.toggle(options);

    return editor;
  };

  describe('toggleList', () => {
    it('uses a selection written earlier in the same transaction', () => {
      const editor = createBaseEditor({
        plugins: [BaseListPlugin],
        initialValue: [{ children: [{ text: 'Item' }], type: KEYS.p }],
      });

      editor.update((tx) => {
        tx.selection.set({
          kind: 'text',
          anchor: { offset: 0, path: [0, 0] },
          focus: { offset: 0, path: [0, 0] },
        });
        tx.list.toggle({ listStyleType: 'disc' });
      });

      expect(editor.read.children()[0]).toMatchObject({
        indent: 1,
        listStyleType: 'disc',
      });
    });

    it('targets one path without moving selection', () => {
      const selection = {
        kind: 'text' as const,
        anchor: { offset: 0, path: [1, 0] },
        focus: { offset: 0, path: [1, 0] },
      };
      const editor = createBaseEditor({
        plugins: [BaseListPlugin],
        selection,
        initialValue: [
          { children: [{ text: 'First' }], type: KEYS.p },
          { children: [{ text: 'Second' }], type: KEYS.p },
        ],
      });

      editor
        .plugin(BaseListPlugin)
        .update.toggle({ at: [0], listStyleType: 'disc' });

      expect(editor.read.children()[0]).toMatchObject({
        indent: 1,
        listStyleType: 'disc',
      });
      expect(editor.read.children()[1]).not.toHaveProperty('listStyleType');
      expect(editor.read.selection()).toEqual(selection);
    });

    it('targets one point and every block in a range', () => {
      const value = [
        { children: [{ text: 'First' }], type: KEYS.p },
        { children: [{ text: 'Second' }], type: KEYS.p },
        { children: [{ text: 'Third' }], type: KEYS.p },
      ];
      const pointEditor = createBaseEditor({
        plugins: [BaseListPlugin],
        initialValue: value,
      });

      pointEditor.plugin(BaseListPlugin).update.toggle({
        at: { offset: 2, path: [1, 0] },
        listStyleType: 'circle',
      });

      expect(pointEditor.read.children()[0]).not.toHaveProperty(
        'listStyleType'
      );
      expect(pointEditor.read.children()[1]).toMatchObject({
        listStyleType: 'circle',
      });
      expect(pointEditor.read.children()[2]).not.toHaveProperty(
        'listStyleType'
      );

      const rangeEditor = createBaseEditor({
        plugins: [BaseListPlugin],
        initialValue: value,
      });

      rangeEditor.plugin(BaseListPlugin).update.toggle({
        at: {
          anchor: { offset: 1, path: [0, 0] },
          focus: { offset: 1, path: [1, 0] },
        },
        listStyleType: 'decimal',
      });

      expect(rangeEditor.read.children()[0]).toMatchObject({
        listStyleType: 'decimal',
      });
      expect(rangeEditor.read.children()[1]).toMatchObject({
        listStyleType: 'decimal',
      });
      expect(rangeEditor.read.children()[2]).not.toHaveProperty(
        'listStyleType'
      );
    });

    it('does nothing for the root path', () => {
      const editor = createBaseEditor({
        plugins: [BaseListPlugin],
        initialValue: [{ children: [{ text: 'Item' }], type: KEYS.p }],
      });
      const before = editor.read.children();

      editor
        .plugin(BaseListPlugin)
        .update.toggle({ at: [], listStyleType: 'disc' });

      expect(editor.read.children()).toEqual(before);
    });

    it('applies restart metadata to the explicit target', () => {
      const editor = createBaseEditor({
        plugins: [BaseListPlugin],
        initialValue: [
          {
            children: [{ text: 'First' }],
            indent: 1,
            listStyleType: 'decimal',
            type: KEYS.p,
          },
          { children: [{ text: 'Second' }], type: KEYS.p },
        ],
      });

      editor.plugin(BaseListPlugin).update.toggle({
        at: [1],
        listRestart: 4,
        listStyleType: 'decimal',
      });

      expect(editor.read.children()[0]).not.toHaveProperty('listRestart');
      expect(editor.read.children()[1]).toMatchObject({
        listRestart: 4,
        listStyleType: 'decimal',
      });
    });

    describe('when selection is collapsed', () => {
      describe('when listStyleType is not defined', () => {
        it('set listStyleType', async () => {
          const input = (
            <editor>
              <hp indent={3}>
                1<cursor />
              </hp>
            </editor>
          ) as TestEditor;

          const output = (
            <editor>
              <hp indent={4} listStyleType="disc">
                1<cursor />
              </hp>
            </editor>
          ) as TestEditor;

          const editor = getToggledEditor({
            input,
            options: { listStyleType: 'disc' },
          });

          expect(editor.read.children()).toEqual(output.children);
        });

        describe('when indent is not set', () => {
          it('set indent 1', async () => {
            const input = (
              <editor>
                <hp>
                  1<cursor />
                </hp>
              </editor>
            ) as TestEditor;

            const output = (
              <editor>
                <hp indent={1} listStyleType="disc">
                  1<cursor />
                </hp>
              </editor>
            ) as TestEditor;

            const editor = getToggledEditor({
              input,
              options: { listStyleType: 'disc' },
            });

            expect(editor.read.children()).toEqual(output.children);
          });
        });
      });

      describe('when listStyleType is defined', () => {
        it('unset listStyleType', async () => {
          const input = (
            <editor>
              <hp indent={1} listStyleType="disc">
                1<cursor />
              </hp>
            </editor>
          ) as TestEditor;

          const output = (
            <editor>
              <hp>
                1<cursor />
              </hp>
            </editor>
          ) as TestEditor;

          const editor = getToggledEditor({
            input,
            options: { listStyleType: 'disc' },
          });

          expect(editor.read.children()).toEqual(output.children);
        });
      });

      describe('when there is sibling items', () => {
        it('set listStyleType on', async () => {
          const input = (
            <editor>
              <hp indent={2} listStyleType="disc">
                21
              </hp>
              <hp indent={1} listStyleType="disc">
                11
              </hp>
              <hp indent={2} listStyleType="disc">
                21
              </hp>
              <hp indent={2} listStyleType="disc">
                22
                <cursor />
              </hp>
              <hp indent={3} listStyleType="decimal">
                31
              </hp>
              <hp indent={2} listStyleType="disc">
                23
              </hp>
              <hp indent={2} listStyleType="decimal">
                21
              </hp>
              <hp indent={1} listStyleType="disc">
                12
              </hp>
              <hp indent={2} listStyleType="decimal">
                21
              </hp>
            </editor>
          ) as TestEditor;

          const output = (
            <editor>
              <hp indent={2} listStyleType="disc">
                21
              </hp>
              <hp indent={1} listStyleType="disc">
                11
              </hp>
              <hp indent={2} listStyleType="decimal">
                21
              </hp>
              <hp indent={2} listStart={2} listStyleType="decimal">
                22
                <cursor />
              </hp>
              <hp indent={3} listStyleType="decimal">
                31
              </hp>
              <hp indent={2} listStart={3} listStyleType="decimal">
                23
              </hp>
              <hp indent={2} listStart={4} listStyleType="decimal">
                21
              </hp>
              <hp indent={1} listStyleType="disc">
                12
              </hp>
              <hp indent={2} listStyleType="decimal">
                21
              </hp>
            </editor>
          ) as TestEditor;

          const editor = getToggledEditor({
            input,
            options: { listStyleType: 'decimal' },
          });

          expect(editor.read.children()).toEqual(output.children);
        });
      });

      describe('with listRestart option', () => {
        it('adds listRestart to the selected block', () => {
          const input = (
            <editor>
              <hp indent={1} listStyleType="decimal">
                1
              </hp>
              <hp indent={1} listStart={2} listStyleType="decimal">
                2
              </hp>
              <hp>
                <cursor />3
              </hp>
            </editor>
          ) as TestEditor;

          const output = (
            <editor>
              <hp indent={1} listStyleType="decimal">
                1
              </hp>
              <hp indent={1} listStart={2} listStyleType="decimal">
                2
              </hp>
              <hp
                indent={1}
                listRestart={5}
                listStart={5}
                listStyleType="decimal"
              >
                3
              </hp>
            </editor>
          ) as TestEditor;

          const editor = getToggledEditor({
            input,
            options: { listRestart: 5, listStyleType: 'decimal' },
          });

          expect(editor.read.children()).toEqual(output.children);
        });
      });

      describe('with listRestartPolite option', () => {
        describe('when there is no previous list item', () => {
          it('adds listRestartPolite to the selected block', () => {
            const input = (
              <editor>
                <hp>
                  <cursor />1
                </hp>
              </editor>
            ) as TestEditor;

            const output = (
              <editor>
                <hp
                  indent={1}
                  listRestartPolite={5}
                  listStart={5}
                  listStyleType="decimal"
                >
                  1
                </hp>
              </editor>
            ) as TestEditor;

            const editor = getToggledEditor({
              input,
              options: {
                listRestartPolite: 5,
                listStyleType: 'decimal',
              },
            });

            expect(editor.read.children()).toEqual(output.children);
          });

          it('adds listRestartPolite after a numbered heading', () => {
            const input = (
              <editor>
                <element indent={1} listStyleType="decimal" type="h1">
                  Heading one
                </element>
                <element
                  indent={1}
                  listStart={2}
                  listStyleType="decimal"
                  type="h1"
                >
                  Heading two
                </element>
                <hp>
                  <cursor />3
                </hp>
              </editor>
            ) as TestEditor;

            const output = (
              <editor>
                <element indent={1} listStyleType="decimal" type="h1">
                  Heading one
                </element>
                <element
                  indent={1}
                  listStart={2}
                  listStyleType="decimal"
                  type="h1"
                >
                  Heading two
                </element>
                <hp
                  indent={1}
                  listRestartPolite={3}
                  listStart={3}
                  listStyleType="decimal"
                >
                  3
                </hp>
              </editor>
            ) as TestEditor;

            const editor = getToggledEditor({
              input,
              options: {
                listRestartPolite: 3,
                listStyleType: 'decimal',
              },
              plugins: headingListPlugins,
            });

            expect(editor.read.children()).toEqual(output.children);
          });

          it('adds listRestartPolite after a numbered heading with an earlier paragraph list', () => {
            const input = (
              <editor>
                <hp indent={1} listStyleType="decimal">
                  Earlier paragraph
                </hp>
                <element indent={1} listStyleType="decimal" type="h1">
                  Heading one
                </element>
                <hp>
                  <cursor />3
                </hp>
              </editor>
            ) as TestEditor;

            const output = (
              <editor>
                <hp indent={1} listStyleType="decimal">
                  Earlier paragraph
                </hp>
                <element indent={1} listStyleType="decimal" type="h1">
                  Heading one
                </element>
                <hp
                  indent={1}
                  listRestartPolite={3}
                  listStart={3}
                  listStyleType="decimal"
                >
                  3
                </hp>
              </editor>
            ) as TestEditor;

            const editor = getToggledEditor({
              input,
              options: {
                listRestartPolite: 3,
                listStyleType: 'decimal',
              },
              plugins: headingListPlugins,
            });

            expect(editor.read.children()).toEqual(output.children);
          });

          it('adds listRestartPolite after a configured heading node type', () => {
            const input = (
              <editor>
                <element indent={1} listStyleType="decimal" type={CUSTOM_H1}>
                  Heading one
                </element>
                <element
                  indent={1}
                  listStart={2}
                  listStyleType="decimal"
                  type={CUSTOM_H1}
                >
                  Heading two
                </element>
                <hp>
                  <cursor />3
                </hp>
              </editor>
            ) as TestEditor;

            const output = (
              <editor>
                <element indent={1} listStyleType="decimal" type={CUSTOM_H1}>
                  Heading one
                </element>
                <element
                  indent={1}
                  listStart={2}
                  listStyleType="decimal"
                  type={CUSTOM_H1}
                >
                  Heading two
                </element>
                <hp
                  indent={1}
                  listRestartPolite={3}
                  listStart={3}
                  listStyleType="decimal"
                >
                  3
                </hp>
              </editor>
            ) as TestEditor;

            const editor = getToggledEditor({
              input,
              options: {
                listRestartPolite: 3,
                listStyleType: 'decimal',
              },
              plugins: customHeadingListPlugins,
            });

            expect(editor.read.children()).toEqual(output.children);
          });
        });

        describe('when there is a previous list item', () => {
          it('does not add listRestartPolite', () => {
            const input = (
              <editor>
                <hp indent={1} listStyleType="decimal">
                  1
                </hp>
                <hp indent={1} listStart={2} listStyleType="decimal">
                  2
                </hp>
                <hp>
                  <cursor />3
                </hp>
              </editor>
            ) as TestEditor;

            const output = (
              <editor>
                <hp indent={1} listStyleType="decimal">
                  1
                </hp>
                <hp indent={1} listStart={2} listStyleType="decimal">
                  2
                </hp>
                <hp indent={1} listStart={3} listStyleType="decimal">
                  3
                </hp>
              </editor>
            ) as TestEditor;

            const editor = getToggledEditor({
              input,
              options: {
                listRestartPolite: 5,
                listStyleType: 'decimal',
              },
            });

            expect(editor.read.children()).toEqual(output.children);
          });

          it('does not add listRestartPolite after a nested numbered heading', () => {
            const input = (
              <editor>
                <hp indent={1} listStyleType="decimal">
                  1
                </hp>
                <element indent={2} listStyleType="decimal" type="h1">
                  Nested heading
                </element>
                <hp>
                  <cursor />2
                </hp>
              </editor>
            ) as TestEditor;

            const output = (
              <editor>
                <hp indent={1} listStyleType="decimal">
                  1
                </hp>
                <element indent={2} listStyleType="decimal" type="h1">
                  Nested heading
                </element>
                <hp indent={1} listStart={2} listStyleType="decimal">
                  2
                </hp>
              </editor>
            ) as TestEditor;

            const editor = getToggledEditor({
              input,
              options: {
                listRestartPolite: 5,
                listStyleType: 'decimal',
              },
              plugins: headingListPlugins,
            });

            expect(editor.read.children()).toEqual(output.children);
          });

          it('does not add listRestartPolite after non-numbered headings', () => {
            const input = (
              <editor>
                <hp indent={1} listStyleType="decimal">
                  1
                </hp>
                <element indent={1} type="h1">
                  Plain heading
                </element>
                <element indent={1} listStyleType="disc" type="h1">
                  Bullet heading
                </element>
                <hp>
                  <cursor />2
                </hp>
              </editor>
            ) as TestEditor;

            const output = (
              <editor>
                <hp indent={1} listStyleType="decimal">
                  1
                </hp>
                <element indent={1} type="h1">
                  Plain heading
                </element>
                <element indent={1} listStyleType="disc" type="h1">
                  Bullet heading
                </element>
                <hp indent={1} listStart={2} listStyleType="decimal">
                  2
                </hp>
              </editor>
            ) as TestEditor;

            const editor = getToggledEditor({
              input,
              options: {
                listRestartPolite: 5,
                listStyleType: 'decimal',
              },
              plugins: headingListPlugins,
            });

            expect(editor.read.children()).toEqual(output.children);
          });

          it('does not add listRestartPolite after a numbered blockquote', () => {
            const input = (
              <editor>
                <hblockquote indent={1} listStyleType="decimal">
                  1
                </hblockquote>
                <hp>
                  <cursor />2
                </hp>
              </editor>
            ) as TestEditor;

            const output = (
              <editor>
                <hblockquote indent={1} listStyleType="decimal">
                  1
                </hblockquote>
                <hp indent={1} listStart={2} listStyleType="decimal">
                  2
                </hp>
              </editor>
            ) as TestEditor;

            const editor = getToggledEditor({
              input,
              options: {
                listRestartPolite: 5,
                listStyleType: 'decimal',
              },
              plugins: headingListPlugins,
            });

            expect(editor.read.children()).toEqual(output.children);
          });
        });
      });
    });

    describe('when selection is expanded', () => {
      describe('when blocks have no listStyleType', () => {
        it('set listStyleType', async () => {
          const input = (
            <editor>
              <hp>
                1
                <anchor />
              </hp>
              <hp>1</hp>
              <hp>
                1
                <focus />
              </hp>
            </editor>
          ) as TestEditor;

          const output = (
            <editor>
              <hp indent={1} listStyleType="disc">
                1
                <anchor />
              </hp>
              <hp indent={1} listStyleType="disc">
                1
              </hp>
              <hp indent={1} listStyleType="disc">
                1
                <focus />
              </hp>
            </editor>
          ) as TestEditor;

          const editor = getToggledEditor({
            input,
            options: { listStyleType: 'disc' },
          });

          expect(editor.read.children()).toEqual(output.children);
        });
      });

      describe('when blocks have (different) listStyleType except one block without', () => {
        it('set listStyleType', async () => {
          const input = (
            <editor>
              <hp indent={1} listStyleType="disc">
                1
                <anchor />
              </hp>
              <hp>1</hp>
              <hp indent={1} listStyleType="disc">
                1
                <focus />
              </hp>
            </editor>
          ) as TestEditor;

          const output = (
            <editor>
              <hp indent={1} listStyleType="decimal">
                1
                <anchor />
              </hp>
              <hp indent={1} listStart={2} listStyleType="decimal">
                1
              </hp>
              <hp indent={1} listStart={3} listStyleType="decimal">
                1
                <focus />
              </hp>
            </editor>
          ) as TestEditor;

          const editor = getToggledEditor({
            input,
            options: { listStyleType: 'decimal' },
          });

          expect(editor.read.children()).toEqual(output.children);
        });
      });

      describe('when blocks have eq listStyleType', () => {
        it('outdent', async () => {
          const input = (
            <editor>
              <hp indent={1} listStyleType="disc">
                1
                <anchor />
              </hp>
              <hp indent={1} listStyleType="disc">
                1
              </hp>
              <hp indent={1} listStyleType="disc">
                1
                <focus />
              </hp>
            </editor>
          ) as TestEditor;

          const output = (
            <editor>
              <hp>
                1
                <anchor />
              </hp>
              <hp>1</hp>
              <hp>
                1
                <focus />
              </hp>
            </editor>
          ) as TestEditor;

          const editor = getToggledEditor({
            input,
            options: { listStyleType: 'disc' },
          });

          expect(editor.read.children()).toEqual(output.children);
        });
      });

      describe('when across pages', () => {
        it('toggle', async () => {
          const input = (
            <editor>
              <element type="page">
                <hp indent={1} listStyleType="disc">
                  1
                  <cursor />
                </hp>
              </element>
              <element type="page">
                <hp indent={1} listStyleType="disc">
                  2
                </hp>
              </element>
            </editor>
          ) as TestEditor;

          const output = (
            <editor>
              <element type="page">
                <hp indent={1} listStyleType="decimal">
                  1
                  <cursor />
                </hp>
              </element>
              <element type="page">
                <hp indent={1} listStart={2} listStyleType="decimal">
                  2
                </hp>
              </element>
            </editor>
          ) as TestEditor;

          const editor = getToggledEditor({
            input,
            options: { listStyleType: 'decimal' },
            plugins: [listPluginPage, BaseIndentPlugin, PagePlugin],
          });

          expect(editor.read.children()).toEqual(output.children);
        });
      });

      describe('with listRestart option', () => {
        it('adds listRestart to the first selected block', () => {
          const input = (
            <editor>
              <hp indent={1} listStyleType="decimal">
                1
              </hp>
              <hp indent={1} listStart={2} listStyleType="decimal">
                2
              </hp>
              <hp>
                <anchor />3
              </hp>
              <hp>4</hp>
              <hp>
                5<focus />
              </hp>
            </editor>
          ) as TestEditor;

          const output = (
            <editor>
              <hp indent={1} listStyleType="decimal">
                1
              </hp>
              <hp indent={1} listStart={2} listStyleType="decimal">
                2
              </hp>
              <hp
                indent={1}
                listRestart={5}
                listStart={5}
                listStyleType="decimal"
              >
                3
              </hp>
              <hp indent={1} listStart={6} listStyleType="decimal">
                4
              </hp>
              <hp indent={1} listStart={7} listStyleType="decimal">
                5
              </hp>
            </editor>
          ) as TestEditor;

          const editor = getToggledEditor({
            input,
            options: { listRestart: 5, listStyleType: 'decimal' },
          });

          expect(editor.read.children()).toEqual(output.children);
        });
      });

      describe('with listRestartPolite option', () => {
        describe('when there is no previous list item', () => {
          it('adds listRestartPolite to the first selected block', () => {
            const input = (
              <editor>
                <hp>
                  <anchor />1
                </hp>
                <hp>2</hp>
                <hp>
                  3<focus />
                </hp>
              </editor>
            ) as TestEditor;

            const output = (
              <editor>
                <hp
                  indent={1}
                  listRestartPolite={5}
                  listStart={5}
                  listStyleType="decimal"
                >
                  1
                </hp>
                <hp indent={1} listStart={6} listStyleType="decimal">
                  2
                </hp>
                <hp indent={1} listStart={7} listStyleType="decimal">
                  3
                </hp>
              </editor>
            ) as TestEditor;

            const editor = getToggledEditor({
              input,
              options: {
                listRestartPolite: 5,
                listStyleType: 'decimal',
              },
            });

            expect(editor.read.children()).toEqual(output.children);
          });
        });

        describe('when there is a previous list item', () => {
          it('does not add listRestartPolite', () => {
            const input = (
              <editor>
                <hp indent={1} listStyleType="decimal">
                  1
                </hp>
                <hp indent={1} listStart={2} listStyleType="decimal">
                  2
                </hp>
                <hp>
                  <anchor />3
                </hp>
                <hp>4</hp>
                <hp>
                  5<focus />
                </hp>
              </editor>
            ) as TestEditor;

            const output = (
              <editor>
                <hp indent={1} listStyleType="decimal">
                  1
                </hp>
                <hp indent={1} listStart={2} listStyleType="decimal">
                  2
                </hp>
                <hp indent={1} listStart={3} listStyleType="decimal">
                  3
                </hp>
                <hp indent={1} listStart={4} listStyleType="decimal">
                  4
                </hp>
                <hp indent={1} listStart={5} listStyleType="decimal">
                  5
                </hp>
              </editor>
            ) as TestEditor;

            const editor = getToggledEditor({
              input,
              options: {
                listRestartPolite: 5,
                listStyleType: 'decimal',
              },
            });

            expect(editor.read.children()).toEqual(output.children);
          });
        });
      });
    });
  });
});

describe('BaseListPlugin numbering behavior', () => {
  const CUSTOM_H1 = 'heading-one';

  const H1Plugin = createBasePlugin({
    key: KEYS.h1,
    schema: {
      element: {
        content: schema.content.text({ default: 'text', min: 1 }),
      },
    },
  });

  const CustomH1Plugin = H1Plugin.extend({
    type: CUSTOM_H1,
  });

  const BlockquotePlugin = createBasePlugin({
    key: KEYS.blockquote,
    schema: {
      element: {
        content: schema.content.text({ default: 'text', min: 1 }),
      },
    },
  });

  const PagePlugin = createBasePlugin({
    key: 'page',
    schema: ({ plugins }) => ({
      element: {
        content: plugins.blockContent({
          default: { type: plugins.elementType(BaseParagraphPlugin) },
          min: 1,
        }),
      },
    }),
  });

  const VisitedPlugin = createBasePlugin({
    key: 'visited',
    schema: {
      properties: [
        schema.elementProperty('visited', property.boolean(), {
          target: target.group('block'),
        }),
      ],
    },
  });

  const createEditor = ({
    headingPlugin = H1Plugin,
    normalizeInitial = false,
    pages = false,
    targetPluginKeys = [KEYS.p],
    value,
  }: {
    value: Value;
    headingPlugin?: any;
    normalizeInitial?: boolean;
    pages?: boolean;
    targetPluginKeys?: readonly string[];
  }) =>
    createBaseEditor({
      plugins: [
        BaseParagraphPlugin,
        headingPlugin,
        BlockquotePlugin,
        PagePlugin,
        BaseIndentPlugin.configure({
          targetPluginKeys,
        }),
        pages
          ? listPluginPage
          : BaseListPlugin.configure({
              targetPluginKeys,
            }),
      ],
      shouldNormalizeEditor: normalizeInitial,
      initialValue: value,
    });

  const createItem = (
    text: string,
    {
      indent = 1,
      listRestart,
      listRestartPolite,
      listStart,
      listStyleType = 'decimal',
    }: {
      indent?: number;
      listRestart?: number;
      listRestartPolite?: number;
      listStart?: number;
      listStyleType?: string;
    } = {}
  ) => ({
    children: [{ text }],
    indent,
    type: KEYS.p,
    ...(listRestart === undefined ? {} : { listRestart }),
    ...(listRestartPolite === undefined ? {} : { listRestartPolite }),
    ...(listStart === undefined ? {} : { listStart }),
    ...(listStyleType === undefined ? {} : { listStyleType }),
  });

  const createHeadingItem = (
    text: string,
    options: {
      indent?: number;
      listStart?: number;
      listStyleType?: string;
      type?: string;
    } = {}
  ) => {
    const { indent = 1, listStart, type = KEYS.h1 } = options;
    const listStyleType =
      'listStyleType' in options ? options.listStyleType : 'decimal';

    return {
      children: [{ text }],
      indent,
      ...(listStart === undefined ? {} : { listStart }),
      ...(listStyleType === undefined ? {} : { listStyleType }),
      type,
    };
  };

  const createBlockquoteItem = (
    text: string,
    {
      indent = 1,
      listStart,
      listStyleType = 'decimal',
    }: {
      indent?: number;
      listStart?: number;
      listStyleType?: string;
    } = {}
  ) => ({
    children: [{ text }],
    indent,
    ...(listStart === undefined ? {} : { listStart }),
    ...(listStyleType === undefined ? {} : { listStyleType }),
    type: KEYS.blockquote,
  });

  const expectAlreadyNormalized = (editor: BaseEditor) => {
    const before = editor.read.children();
    editor.update.value.repair();
    expect(editor.read.children()).toBe(before);
  };

  describe('normalizeListStart', () => {
    describe('when normalizing initial value', () => {
      it('assigns listStart to items according to their indent', () => {
        const input = [
          createItem('11'),
          createItem('12'),
          createItem('2a', { indent: 2, listStyleType: 'lower-alpha' }),
          createItem('2b', { indent: 2, listStyleType: 'lower-alpha' }),
          createItem('11', { listStyleType: 'disc' }),
          createItem('12', { listStyleType: 'disc' }),
          createItem('21', { indent: 2, listStyleType: 'disc' }),
          createItem('31', { indent: 3, listStyleType: 'disc' }),
          createItem('31', { indent: 3, listStyleType: undefined }),
          createItem('13', { listStyleType: 'disc' }),
          createItem('14', { listStyleType: 'disc' }),
        ];

        const output = [
          createItem('11'),
          createItem('12', { listStart: 2 }),
          createItem('2a', { indent: 2, listStyleType: 'lower-alpha' }),
          createItem('2b', {
            indent: 2,
            listStart: 2,
            listStyleType: 'lower-alpha',
          }),
          createItem('11', { listStyleType: 'disc' }),
          createItem('12', { listStyleType: 'disc' }),
          createItem('21', { indent: 2, listStyleType: 'disc' }),
          createItem('31', { indent: 3, listStyleType: 'disc' }),
          createItem('31', { indent: 3, listStyleType: undefined }),
          createItem('13', { listStyleType: 'disc' }),
          createItem('14', { listStyleType: 'disc' }),
        ];

        const editor = createEditor({
          normalizeInitial: true,
          value: input,
        });

        expect(editor.read.children()).toEqual(output);
      });

      it('does not assign listStart to unordered list items', () => {
        const input = [
          createItem('one', { listStyleType: 'disc' }),
          createItem('two', { listStyleType: 'disc' }),
          createItem('three', { listStyleType: 'circle' }),
          createItem('four', { listStyleType: 'square' }),
        ];

        const editor = createEditor({
          normalizeInitial: true,
          value: input,
        });

        expect(editor.read.children()).toEqual(input);
      });

      it('strips previously-assigned listStart from unordered list items', () => {
        const input = [
          createItem('one', { listStart: 1, listStyleType: 'disc' }),
          createItem('two', { listStart: 2, listStyleType: 'disc' }),
        ];

        const output = [
          createItem('one', { listStyleType: 'disc' }),
          createItem('two', { listStyleType: 'disc' }),
        ];

        const editor = createEditor({
          normalizeInitial: true,
          value: input,
        });

        expect(editor.read.children()).toEqual(output);
      });

      it('resumes ordered numbering after an unordered interruption', () => {
        const input = [
          createItem('one'),
          createItem('two'),
          createItem('bullet', { listStyleType: 'disc' }),
          createItem('three'),
        ];

        const output = [
          createItem('one'),
          createItem('two', { listStart: 2 }),
          createItem('bullet', { listStyleType: 'disc' }),
          createItem('three', { listStart: 3 }),
        ];

        const editor = createEditor({
          normalizeInitial: true,
          value: input,
        });

        expect(editor.read.children()).toEqual(output);
      });

      it('starts paragraph numbering independently after numbered headings', () => {
        const input = [
          createHeadingItem('heading one'),
          createHeadingItem('heading two'),
          createItem('paragraph one'),
          createItem('paragraph two'),
        ];

        const output = [
          createHeadingItem('heading one'),
          createHeadingItem('heading two', { listStart: 2 }),
          createItem('paragraph one'),
          createItem('paragraph two', { listStart: 2 }),
        ];

        const editor = createEditor({
          normalizeInitial: true,
          targetPluginKeys: [KEYS.h1, KEYS.p],
          value: input,
        });

        expect(editor.read.children()).toEqual(output);
      });

      it('does not resume paragraph numbering across numbered headings', () => {
        const input = [
          createItem('paragraph before'),
          createHeadingItem('heading one'),
          createItem('paragraph after'),
        ];

        const output = [
          createItem('paragraph before'),
          createHeadingItem('heading one'),
          createItem('paragraph after'),
        ];

        const editor = createEditor({
          normalizeInitial: true,
          targetPluginKeys: [KEYS.h1, KEYS.p],
          value: input,
        });

        expect(editor.read.children()).toEqual(output);
      });

      it('continues paragraph numbering across nested numbered headings', () => {
        const input = [
          createItem('paragraph one'),
          createHeadingItem('nested heading', { indent: 2 }),
          createItem('paragraph two'),
        ];

        const output = [
          createItem('paragraph one'),
          createHeadingItem('nested heading', { indent: 2 }),
          createItem('paragraph two', { listStart: 2 }),
        ];

        const editor = createEditor({
          normalizeInitial: true,
          targetPluginKeys: [KEYS.h1, KEYS.p],
          value: input,
        });

        expect(editor.read.children()).toEqual(output);
      });

      it('continues paragraph numbering across non-numbered headings', () => {
        const input = [
          createItem('paragraph one'),
          createHeadingItem('plain heading', { listStyleType: undefined }),
          createHeadingItem('bullet heading', { listStyleType: 'disc' }),
          createItem('paragraph two'),
        ];

        const output = [
          createItem('paragraph one'),
          createHeadingItem('plain heading', { listStyleType: undefined }),
          createHeadingItem('bullet heading', { listStyleType: 'disc' }),
          createItem('paragraph two', { listStart: 2 }),
        ];

        const editor = createEditor({
          normalizeInitial: true,
          targetPluginKeys: [KEYS.h1, KEYS.p],
          value: input,
        });

        expect(editor.read.children()).toEqual(output);
      });

      it('uses configured heading node types for heading sequence boundaries', () => {
        const input = [
          createHeadingItem('heading one', { type: CUSTOM_H1 }),
          createHeadingItem('heading two', { type: CUSTOM_H1 }),
          createItem('paragraph one'),
        ];

        const output = [
          createHeadingItem('heading one', { type: CUSTOM_H1 }),
          createHeadingItem('heading two', { listStart: 2, type: CUSTOM_H1 }),
          createItem('paragraph one'),
        ];

        const editor = createEditor({
          headingPlugin: CustomH1Plugin,
          normalizeInitial: true,
          targetPluginKeys: [KEYS.h1, KEYS.p],
          value: input,
        });

        expect(editor.read.children()).toEqual(output);
      });

      it('continues paragraph numbering across non-heading list blocks', () => {
        const input = [
          createItem('one'),
          createBlockquoteItem('two'),
          createItem('three'),
        ];

        const output = [
          createItem('one'),
          createBlockquoteItem('two', { listStart: 2 }),
          createItem('three', { listStart: 3 }),
        ];

        const editor = createEditor({
          normalizeInitial: true,
          targetPluginKeys: [KEYS.blockquote, KEYS.p],
          value: input,
        });

        expect(editor.read.children()).toEqual(output);
      });

      it('honors listRestart on an ordered item following an unordered interruption', () => {
        const input = [
          createItem('one'),
          createItem('two'),
          createItem('bullet', { listStyleType: 'disc' }),
          createItem('five', { listRestart: 5 }),
          createItem('six'),
        ];

        const output = [
          createItem('one'),
          createItem('two', { listStart: 2 }),
          createItem('bullet', { listStyleType: 'disc' }),
          createItem('five', { listRestart: 5, listStart: 5 }),
          createItem('six', { listStart: 6 }),
        ];

        const editor = createEditor({
          normalizeInitial: true,
          value: input,
        });

        expect(editor.read.children()).toEqual(output);
      });

      it('removes listStart from the first items', () => {
        const input = [
          createItem('one', { listStart: 1 }),
          createItem('two'),
          createItem('three > one', { indent: 2, listStart: 1 }),
          createItem('four > two', { indent: 2 }),
          <hp>-</hp>,
          createItem('one 2', { listStart: 1 }),
        ];

        const output = [
          createItem('one'),
          createItem('two', { listStart: 2 }),
          createItem('three > one', { indent: 2 }),
          createItem('four > two', { indent: 2, listStart: 2 }),
          <hp>-</hp>,
          createItem('one 2'),
        ];

        const editor = createEditor({
          normalizeInitial: true,
          value: input,
        });

        expect(editor.read.children()).toEqual(output);
      });

      it('restarts listStart when encountering listRestart', () => {
        const input = [
          createItem('three', { listRestart: 3 }),
          createItem('four'),
          createItem('four > one', { indent: 2 }),
          createItem('four > three', { indent: 2, listRestart: 3 }),
          createItem('four > one', { indent: 2, listRestart: 1 }),
          createItem('five'),
        ];

        const output = [
          createItem('three', { listRestart: 3, listStart: 3 }),
          createItem('four', { listStart: 4 }),
          createItem('four > one', { indent: 2 }),
          createItem('four > three', {
            indent: 2,
            listRestart: 3,
            listStart: 3,
          }),
          createItem('four > one', { indent: 2, listRestart: 1 }),
          createItem('five', { listStart: 5 }),
        ];

        const editor = createEditor({
          normalizeInitial: true,
          value: input,
        });

        expect(editor.read.children()).toEqual(output);
      });

      it('restarts listStart when encountering listRestartPolite at the start of a list', () => {
        const input = [
          createItem('three', { listRestartPolite: 3 }),
          createItem('four', { listRestartPolite: 1000 }),
          createItem('four > five', { indent: 2, listRestartPolite: 5 }),
          createItem('four > six', { indent: 2 }),
          createItem('four > seven', { indent: 2, listRestartPolite: 1 }),
          createItem('five'),
        ];

        const output = [
          createItem('three', { listRestartPolite: 3, listStart: 3 }),
          createItem('four', { listRestartPolite: 1000, listStart: 4 }),
          createItem('four > five', {
            indent: 2,
            listRestartPolite: 5,
            listStart: 5,
          }),
          createItem('four > six', { indent: 2, listStart: 6 }),
          createItem('four > seven', {
            indent: 2,
            listRestartPolite: 1,
            listStart: 7,
          }),
          createItem('five', { listStart: 5 }),
        ];

        const editor = createEditor({
          normalizeInitial: true,
          value: input,
        });

        expect(editor.read.children()).toEqual(output);
      });

      describe('when configured to continue lists across multiple pages', () => {
        it('does so', () => {
          const input = [
            <element type="page">
              {createItem('11')}
              {createItem('12')}
            </element>,
            <element type="page">
              {createItem('13')}
              {createItem('14')}
            </element>,
          ];

          const output = [
            <element type="page">
              {createItem('11')}
              {createItem('12', { listStart: 2 })}
            </element>,
            <element type="page">
              {createItem('13', { listStart: 3 })}
              {createItem('14', { listStart: 4 })}
            </element>,
          ];

          const editor = createEditor({
            normalizeInitial: true,
            pages: true,
            value: input,
          });

          expect(editor.read.children()).toEqual(output);
        });

        it('respects listRestart', () => {
          const input = [
            <element type="page">
              {createItem('1')}
              {createItem('2')}
            </element>,
            <element type="page">
              {createItem('1', { listRestart: 1, listStart: 2 })}
            </element>,
          ];

          const output = [
            <element type="page">
              {createItem('1')}
              {createItem('2', { listStart: 2 })}
            </element>,
            <element type="page">
              {createItem('1', { listRestart: 1 })}
            </element>,
          ];

          const editor = createEditor({
            normalizeInitial: true,
            pages: true,
            value: input,
          });

          expect(editor.read.children()).toEqual(output);
        });
      });
    });

    describe('when normalizing after operations', () => {
      describe('insert_node', () => {
        it('inserts at the start', () => {
          const input = [
            createItem('1'),
            createItem('2', { listStart: 2 }),
            createItem('3', { indent: 2 }),
            createItem('4', { listStart: 3 }),
            createItem('5', { listStart: 4 }),
          ];

          const output = [
            createItem('x'),
            createItem('1', { listStart: 2 }),
            createItem('2', { listStart: 3 }),
            createItem('3', { indent: 2 }),
            createItem('4', { listStart: 4 }),
            createItem('5', { listStart: 5 }),
          ];

          const editor = createEditor({ value: input });
          expectAlreadyNormalized(editor);

          editor.update.nodes.insert(createItem('x'), {
            at: [0],
          });

          expect(editor.read.children()).toEqual(output);
          expectAlreadyNormalized(editor);
        });

        it('inserts in the middle', () => {
          const input = [
            <element type="page">
              {createItem('1')}
              {createItem('2', { listStart: 2 })}
              {createItem('3', { indent: 2 })}
              {createItem('4', { listStart: 3 })}
              {createItem('5', { listStart: 4 })}
            </element>,
            <element type="page">{createItem('5', { listStart: 5 })}</element>,
          ];

          const output = [
            <element type="page">
              {createItem('1')}
              {createItem('2', { listStart: 2 })}
              {createItem('x', { listStart: 3 })}
              {createItem('3', { indent: 2 })}
              {createItem('4', { listStart: 4 })}
              {createItem('5', { listStart: 5 })}
            </element>,
            <element type="page">{createItem('5', { listStart: 6 })}</element>,
          ];

          const editor = createEditor({ pages: true, value: input });
          expectAlreadyNormalized(editor);

          editor.update.nodes.insert(createItem('x'), {
            at: [0, 2],
          });

          expect(editor.read.children()).toEqual(output);
          expectAlreadyNormalized(editor);
        });

        it('splits a list', () => {
          const input = [
            createItem('1'),
            createItem('2', { listStart: 2 }),
            createItem('3', { indent: 2 }),
            createItem('4', { listStart: 3 }),
            createItem('5', { listStart: 4 }),
          ];

          const output = [
            createItem('1'),
            createItem('2', { listStart: 2 }),
            createItem('3', { indent: 2 }),
            <hp>x</hp>,
            createItem('4'),
            createItem('5', { listStart: 2 }),
          ];

          const editor = createEditor({ value: input });
          expectAlreadyNormalized(editor);

          editor.update.nodes.insert(<hp>x</hp>, { at: [3] });

          expect(editor.read.children()).toEqual(output);
          expectAlreadyNormalized(editor);
        });
      });

      describe('remove_node', () => {
        it('removes from the start', () => {
          const input = [
            createItem('1'),
            createItem('2', { listStart: 2 }),
            createItem('3', { indent: 2 }),
            createItem('4', { listStart: 3 }),
            createItem('5', { listStart: 4 }),
          ];

          const output = [
            createItem('2'),
            createItem('3', { indent: 2 }),
            createItem('4', { listStart: 2 }),
            createItem('5', { listStart: 3 }),
          ];

          const editor = createEditor({ value: input });
          expectAlreadyNormalized(editor);

          editor.update.nodes.remove({ at: [0] });

          expect(editor.read.children()).toEqual(output);
          expectAlreadyNormalized(editor);
        });

        it('removes from the middle', () => {
          const input = [
            createItem('1'),
            createItem('2', { listStart: 2 }),
            createItem('3', { indent: 2 }),
            createItem('4', { listStart: 3 }),
            createItem('5', { listStart: 4 }),
          ];

          const output = [
            createItem('1'),
            createItem('2', { listStart: 2 }),
            createItem('3', { indent: 2 }),
            createItem('5', { listStart: 3 }),
          ];

          const editor = createEditor({ value: input });
          expectAlreadyNormalized(editor);

          editor.update.nodes.remove({ at: [3] });

          expect(editor.read.children()).toEqual(output);
          expectAlreadyNormalized(editor);
        });

        it('merges two previously separate lists', () => {
          const input = [
            createItem('1'),
            createItem('2', { listStart: 2 }),
            <hp>-</hp>,
            createItem('3'),
            createItem('4', { listStart: 2 }),
          ];

          const output = [
            createItem('1'),
            createItem('2', { listStart: 2 }),
            createItem('3', { listStart: 3 }),
            createItem('4', { listStart: 4 }),
          ];

          const editor = createEditor({ value: input });
          expectAlreadyNormalized(editor);

          editor.update.nodes.remove({ at: [2] });

          expect(editor.read.children()).toEqual(output);
          expectAlreadyNormalized(editor);
        });
      });

      describe('move_node', () => {
        it('moves from the outside to start', () => {
          const input = [
            createItem('x'),
            <hp>-</hp>,
            createItem('1'),
            createItem('2', { listStart: 2 }),
            createItem('3', { indent: 2 }),
            createItem('4', { listStart: 3 }),
            createItem('5', { listStart: 4 }),
          ];

          const output = [
            <hp>-</hp>,
            createItem('x'),
            createItem('1', { listStart: 2 }),
            createItem('2', { listStart: 3 }),
            createItem('3', { indent: 2 }),
            createItem('4', { listStart: 4 }),
            createItem('5', { listStart: 5 }),
          ];

          const editor = createEditor({ value: input });
          expectAlreadyNormalized(editor);

          editor.update.nodes.move({
            at: [0],
            to: [1],
          });

          expect(editor.read.children()).toEqual(output);
          expectAlreadyNormalized(editor);
        });

        it('moves from the start to out', () => {
          const input = [
            <hp>-</hp>,
            createItem('1'),
            createItem('2', { listStart: 2 }),
            createItem('3', { indent: 2 }),
            createItem('4', { listStart: 3 }),
            createItem('5', { listStart: 4 }),
          ];

          const output = [
            createItem('1'),
            <hp>-</hp>,
            createItem('2'),
            createItem('3', { indent: 2 }),
            createItem('4', { listStart: 2 }),
            createItem('5', { listStart: 3 }),
          ];

          const editor = createEditor({ value: input });
          expectAlreadyNormalized(editor);

          editor.update.nodes.move({
            at: [1],
            to: [0],
          });

          expect(editor.read.children()).toEqual(output);
          expectAlreadyNormalized(editor);
        });

        it('moves from the start down', () => {
          const input = [
            createItem('1'),
            createItem('2', { listStart: 2 }),
            createItem('3', { indent: 2 }),
            createItem('4', { listStart: 3 }),
            createItem('5', { listStart: 4 }),
          ];

          const output = [
            createItem('2'),
            createItem('3', { indent: 2 }),
            createItem('1', { listStart: 2 }),
            createItem('4', { listStart: 3 }),
            createItem('5', { listStart: 4 }),
          ];

          const editor = createEditor({ value: input });
          expectAlreadyNormalized(editor);

          editor.update.nodes.move({
            at: [0],
            to: [2],
          });

          expect(editor.read.children()).toEqual(output);
          expectAlreadyNormalized(editor);
        });

        it('moves from the middle to start', () => {
          const input = [
            createItem('1'),
            createItem('2', { listStart: 2 }),
            createItem('3', { indent: 2 }),
            createItem('4', { listStart: 3 }),
            createItem('5', { listStart: 4 }),
          ];

          const output = [
            createItem('4'),
            createItem('1', { listStart: 2 }),
            createItem('2', { listStart: 3 }),
            createItem('3', { indent: 2 }),
            createItem('5', { listStart: 4 }),
          ];

          const editor = createEditor({ value: input });
          expectAlreadyNormalized(editor);

          editor.update.nodes.move({
            at: [3],
            to: [0],
          });

          expect(editor.read.children()).toEqual(output);
          expectAlreadyNormalized(editor);
        });

        it('merges two previously separate lists', () => {
          const input = [
            createItem('1'),
            createItem('2', { listStart: 2 }),
            <hp>-</hp>,
            createItem('3'),
            createItem('4', { listStart: 2 }),
          ];

          const output = [
            <hp>-</hp>,
            createItem('1'),
            createItem('2', { listStart: 2 }),
            createItem('3', { listStart: 3 }),
            createItem('4', { listStart: 4 }),
          ];

          const editor = createEditor({ value: input });
          expectAlreadyNormalized(editor);

          editor.update.nodes.move({
            at: [2],
            to: [0],
          });

          expect(editor.read.children()).toEqual(output);
          expectAlreadyNormalized(editor);
        });

        it('splits a list', () => {
          const input = [
            <hp>-</hp>,
            createItem('1'),
            createItem('2', { listStart: 2 }),
            createItem('3', { listStart: 3 }),
            createItem('4', { listStart: 4 }),
          ];

          const output = [
            createItem('1'),
            createItem('2', { listStart: 2 }),
            <hp>-</hp>,
            createItem('3'),
            createItem('4', { listStart: 2 }),
          ];

          const editor = createEditor({ value: input });
          expectAlreadyNormalized(editor);

          editor.update.nodes.move({
            at: [0],
            to: [2],
          });

          expect(editor.read.children()).toEqual(output);
          expectAlreadyNormalized(editor);
        });
      });

      describe('set_node', () => {
        it('increases indent', () => {
          const input = [
            createItem('1'),
            createItem('2', { listStart: 2 }),
            createItem('3', { listStart: 3 }),
            createItem('4', { listStart: 4 }),
          ];

          const output = [
            createItem('1'),
            createItem('2', { indent: 2 }),
            createItem('3', { listStart: 2 }),
            createItem('4', { listStart: 3 }),
          ];

          const editor = createEditor({ value: input });
          expectAlreadyNormalized(editor);

          editor.update.nodes.set({ indent: 2 }, { at: [1] });

          expect(editor.read.children()).toEqual(output);
          expectAlreadyNormalized(editor);
        });

        it('decreases indent', () => {
          const input = [
            createItem('1'),
            createItem('2', { indent: 2 }),
            createItem('3', { listStart: 2 }),
            createItem('4', { listStart: 3 }),
          ];

          const output = [
            createItem('1'),
            createItem('2', { listStart: 2 }),
            createItem('3', { listStart: 3 }),
            createItem('4', { listStart: 4 }),
          ];

          const editor = createEditor({ value: input });
          expectAlreadyNormalized(editor);

          editor.update.nodes.set({ indent: 1 }, { at: [1] });

          expect(editor.read.children()).toEqual(output);
          expectAlreadyNormalized(editor);
        });

        it('merges two previously separate lists', () => {
          const input = [
            createItem('1'),
            createItem('2', { listStart: 2 }),
            <hp>x</hp>,
            createItem('3'),
            createItem('4', { listStart: 2 }),
          ];

          const output = [
            createItem('1'),
            createItem('2', { listStart: 2 }),
            createItem('x', { listStart: 3 }),
            createItem('3', { listStart: 4 }),
            createItem('4', { listStart: 5 }),
          ];

          const editor = createEditor({ value: input });
          expectAlreadyNormalized(editor);

          const itemProps = omit(createItem(''), ['type', 'children']);
          editor.update.nodes.set(itemProps, { at: [2] });

          expect(editor.read.children()).toEqual(output);
          expectAlreadyNormalized(editor);
        });

        it('splits a list', () => {
          const input = [
            createItem('1'),
            createItem('2', { listStart: 2 }),
            createItem('x', { listStart: 3 }),
            createItem('3', { listStart: 4 }),
            createItem('4', { listStart: 5 }),
          ];

          const output = [
            createItem('1'),
            createItem('2', { listStart: 2 }),
            <hp>x</hp>,
            createItem('3'),
            createItem('4', { listStart: 2 }),
          ];

          const editor = createEditor({ value: input });
          expectAlreadyNormalized(editor);

          editor.update.nodes.set(
            { indent: undefined, listStyleType: undefined },
            { at: [2] }
          );

          expect(editor.read.children()).toEqual(output);
          expectAlreadyNormalized(editor);
        });
      });

      describe('merge_node', () => {
        it('merges in the middle of a list', () => {
          const input = [
            createItem('1'),
            createItem('2', { listStart: 2 }),
            createItem('3', { listStart: 3 }),
            createItem('4', { listStart: 4 }),
          ];

          const output = [
            createItem('1'),
            createItem('23', { listStart: 2 }),
            createItem('4', { listStart: 3 }),
          ];

          const editor = createEditor({ value: input });
          expectAlreadyNormalized(editor);

          editor.update.nodes.merge({
            at: [2],
          });

          const committedChange = editor.read.lastCommit()?.changes;

          expect(committedChange).toBeDefined();

          const change = DocumentChange.fromJSON(
            JSON.parse(JSON.stringify(committedChange!.toJSON()))
          );
          expect(change.primaryClassification).toBeNull();

          expect(editor.read.children()).toEqual(output);
          expect(editor.read.text.string([1])).toBe('23');

          const replayEditor = createEditor({ value: input });

          replayEditor.update((tx) => tx.changes.apply(change));
          expect(replayEditor.read.children()).toEqual(output);

          editor.update.history.undo();
          expect(editor.read.children()).toEqual(input);
          editor.update.history.redo();
          expect(editor.read.children()).toEqual(output);
        });

        it('merges at the start of a list', () => {
          const input = [
            <hp>0</hp>,
            createItem('1'),
            createItem('2', { listStart: 2 }),
            createItem('3', { listStart: 3 }),
            createItem('4', { listStart: 4 }),
          ];

          const output = [
            <hp>01</hp>,
            createItem('2'),
            createItem('3', { listStart: 2 }),
            createItem('4', { listStart: 3 }),
          ];

          const editor = createEditor({ value: input });
          expectAlreadyNormalized(editor);

          editor.update.nodes.merge({
            at: [1],
          });

          expect(editor.read.children()).toEqual(output);
          expect(editor.read.text.string([0])).toBe('01');
        });

        it('merges two previously separate lists', () => {
          const input = [
            createItem('1'),
            createItem('2', { listStart: 2 }),
            <hp>-</hp>,
            createItem('3'),
            createItem('4', { listStart: 2 }),
          ];

          const output = [
            createItem('1'),
            createItem('2-', { listStart: 2 }),
            createItem('3', { listStart: 3 }),
            createItem('4', { listStart: 4 }),
          ];

          const editor = createEditor({ value: input });
          expectAlreadyNormalized(editor);

          editor.update.nodes.merge({
            at: [2],
          });

          expect(editor.read.children()).toEqual(output);
          expect(editor.read.text.string([1])).toBe('2-');
        });
      });

      describe('split_node', () => {
        it('splits in the middle of a list', () => {
          const input = [
            createItem('1'),
            createItem('2', { listStart: 2 }),
            createItem('34', { listStart: 3 }),
            createItem('5', { listStart: 4 }),
          ];

          const output = [
            createItem('1'),
            createItem('2', { listStart: 2 }),
            createItem('3', { listStart: 3 }),
            createItem('4', { listStart: 4 }),
            createItem('5', { listStart: 5 }),
          ];

          const editor = createEditor({ value: input });
          expectAlreadyNormalized(editor);

          editor.update.nodes.split({
            at: { offset: 1, path: [2, 0] },
          });

          expect(editor.read.children()).toEqual(output);
          expectAlreadyNormalized(editor);
        });
      });

      it.each([
        1000, 10_000,
      ])('renumbers a %i-item suffix with a compact canonical change', (size) => {
        const value = Array.from({ length: size }, (_, index) =>
          createItem(String(index + 1), {
            listStart: index === 0 ? undefined : index + 1,
          })
        );
        const editor = createBaseEditor({
          plugins: [BaseParagraphPlugin, BaseListPlugin, VisitedPlugin],
          shouldNormalizeEditor: false,
          initialValue: value,
        });

        editor.update.nodes.set({ visited: true }, { at: [0] });

        const mainChange = editor.read.lastCommit()?.changes.primary;

        expect(mainChange).toBeDefined();
        expect(mainChange!.data.length).toBeLessThanOrEqual(2);
        expect(editor.read.children()[size - 1]).toMatchObject({
          listStart: size,
        });
      }, 30_000);
    });
  });
});
