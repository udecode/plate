/** @jsx jsxt */

import type { Value } from '@platejs/plite';
import { type BasePlateEditor, createEditorPlugin, KEYS } from 'platejs';

import { BaseIndentPlugin } from '@platejs/indent';
import { jsxt } from '@platejs/test-utils';

import { BaseParagraphPlugin } from '../../../../core/src/lib/plugins/paragraph/BaseParagraphPlugin';
import { createPlateRuntimeEditor } from '../../../../core/src/react/editor/createPlateRuntimeEditor';
import { listPluginPage } from '../../__tests__/listPluginPage';
import { BaseListPlugin } from '../BaseListPlugin';
import { toggleList } from './toggleList';

jsxt;

const CUSTOM_H1 = 'heading-one';

const H1Plugin = createEditorPlugin({
  key: KEYS.h1,
});

const CustomH1Plugin = H1Plugin.extend({
  node: { type: CUSTOM_H1 },
});

const BlockquotePlugin = createEditorPlugin({
  key: KEYS.blockquote,
});

const headingListPlugins = [
  H1Plugin,
  BlockquotePlugin,
  BaseListPlugin.configure({
    inject: {
      targetPlugins: [KEYS.blockquote, KEYS.h1, KEYS.p],
    },
  }),
  BaseIndentPlugin.configure({
    inject: {
      targetPlugins: [KEYS.blockquote, KEYS.h1, KEYS.p],
    },
  }),
];

const customHeadingListPlugins = [
  CustomH1Plugin,
  BlockquotePlugin,
  BaseListPlugin.configure({
    inject: {
      targetPlugins: [KEYS.blockquote, KEYS.h1, KEYS.p],
    },
  }),
  BaseIndentPlugin.configure({
    inject: {
      targetPlugins: [KEYS.blockquote, KEYS.h1, KEYS.p],
    },
  }),
];

const getToggledEditor = ({
  input,
  options,
  plugins = [BaseListPlugin, BaseIndentPlugin],
}: {
  input: BasePlateEditor;
  options: Parameters<typeof toggleList>[1];
  plugins?: any[];
}) => {
  const editor = createPlateRuntimeEditor<Value>({
    plugins: [BaseParagraphPlugin, ...plugins],
    initialSelection: input.selection,
    initialValue: input.children,
  });

  toggleList(editor as unknown as BasePlateEditor, options);

  return editor;
};

describe('toggleList', () => {
  describe('when selection is collapsed', () => {
    describe('when listStyleType is not defined', () => {
      it('set listStyleType', async () => {
        const input = (
          <editor>
            <hp indent={3}>
              1<cursor />
            </hp>
          </editor>
        ) as any as BasePlateEditor;

        const output = (
          <editor>
            <hp indent={4} listStyleType="disc">
              1<cursor />
            </hp>
          </editor>
        ) as any as BasePlateEditor;

        const editor = getToggledEditor({
          input,
          options: { listStyleType: 'disc' },
        });

        expect(editor.children).toEqual(output.children);
      });

      describe('when indent is not set', () => {
        it('set indent 1', async () => {
          const input = (
            <editor>
              <hp>
                1<cursor />
              </hp>
            </editor>
          ) as any as BasePlateEditor;

          const output = (
            <editor>
              <hp indent={1} listStyleType="disc">
                1<cursor />
              </hp>
            </editor>
          ) as any as BasePlateEditor;

          const editor = getToggledEditor({
            input,
            options: { listStyleType: 'disc' },
          });

          expect(editor.children).toEqual(output.children);
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
        ) as any as BasePlateEditor;

        const output = (
          <editor>
            <hp>
              1<cursor />
            </hp>
          </editor>
        ) as any as BasePlateEditor;

        const editor = getToggledEditor({
          input,
          options: { listStyleType: 'disc' },
        });

        expect(editor.children).toEqual(output.children);
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
        ) as any as BasePlateEditor;

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
        ) as any as BasePlateEditor;

        const editor = getToggledEditor({
          input,
          options: { listStyleType: 'decimal' },
        });

        expect(editor.children).toEqual(output.children);
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
        ) as any as BasePlateEditor;

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
        ) as any as BasePlateEditor;

        const editor = getToggledEditor({
          input,
          options: { listRestart: 5, listStyleType: 'decimal' },
        });

        expect(editor.children).toEqual(output.children);
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
          ) as any as BasePlateEditor;

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
          ) as any as BasePlateEditor;

          const editor = getToggledEditor({
            input,
            options: {
              listRestartPolite: 5,
              listStyleType: 'decimal',
            },
          });

          expect(editor.children).toEqual(output.children);
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
          ) as any as BasePlateEditor;

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
          ) as any as BasePlateEditor;

          const editor = getToggledEditor({
            input,
            options: {
              listRestartPolite: 3,
              listStyleType: 'decimal',
            },
            plugins: headingListPlugins,
          });

          expect(editor.children).toEqual(output.children);
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
          ) as any as BasePlateEditor;

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
          ) as any as BasePlateEditor;

          const editor = getToggledEditor({
            input,
            options: {
              listRestartPolite: 3,
              listStyleType: 'decimal',
            },
            plugins: headingListPlugins,
          });

          expect(editor.children).toEqual(output.children);
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
          ) as any as BasePlateEditor;

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
          ) as any as BasePlateEditor;

          const editor = getToggledEditor({
            input,
            options: {
              listRestartPolite: 3,
              listStyleType: 'decimal',
            },
            plugins: customHeadingListPlugins,
          });

          expect(editor.children).toEqual(output.children);
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
          ) as any as BasePlateEditor;

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
          ) as any as BasePlateEditor;

          const editor = getToggledEditor({
            input,
            options: {
              listRestartPolite: 5,
              listStyleType: 'decimal',
            },
          });

          expect(editor.children).toEqual(output.children);
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
          ) as any as BasePlateEditor;

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
          ) as any as BasePlateEditor;

          const editor = getToggledEditor({
            input,
            options: {
              listRestartPolite: 5,
              listStyleType: 'decimal',
            },
            plugins: headingListPlugins,
          });

          expect(editor.children).toEqual(output.children);
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
          ) as any as BasePlateEditor;

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
          ) as any as BasePlateEditor;

          const editor = getToggledEditor({
            input,
            options: {
              listRestartPolite: 5,
              listStyleType: 'decimal',
            },
            plugins: headingListPlugins,
          });

          expect(editor.children).toEqual(output.children);
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
          ) as any as BasePlateEditor;

          const output = (
            <editor>
              <hblockquote indent={1} listStyleType="decimal">
                1
              </hblockquote>
              <hp indent={1} listStart={2} listStyleType="decimal">
                2
              </hp>
            </editor>
          ) as any as BasePlateEditor;

          const editor = getToggledEditor({
            input,
            options: {
              listRestartPolite: 5,
              listStyleType: 'decimal',
            },
            plugins: headingListPlugins,
          });

          expect(editor.children).toEqual(output.children);
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
        ) as any as BasePlateEditor;

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
        ) as any as BasePlateEditor;

        const editor = getToggledEditor({
          input,
          options: { listStyleType: 'disc' },
        });

        expect(editor.children).toEqual(output.children);
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
        ) as any as BasePlateEditor;

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
        ) as any as BasePlateEditor;

        const editor = getToggledEditor({
          input,
          options: { listStyleType: 'decimal' },
        });

        expect(editor.children).toEqual(output.children);
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
        ) as any as BasePlateEditor;

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
        ) as any as BasePlateEditor;

        const editor = getToggledEditor({
          input,
          options: { listStyleType: 'disc' },
        });

        expect(editor.children).toEqual(output.children);
      });
    });

    describe('when across pages', () => {
      it('toggle', async () => {
        const input = (
          <editor>
            <element>
              <hp indent={1} listStyleType="disc">
                1
                <cursor />
              </hp>
            </element>
            <element>
              <hp indent={1} listStyleType="disc">
                2
              </hp>
            </element>
          </editor>
        ) as any as BasePlateEditor;

        const output = (
          <editor>
            <element>
              <hp indent={1} listStyleType="decimal">
                1
                <cursor />
              </hp>
            </element>
            <element>
              <hp indent={1} listStart={2} listStyleType="decimal">
                2
              </hp>
            </element>
          </editor>
        ) as any as BasePlateEditor;

        const editor = getToggledEditor({
          input,
          options: { listStyleType: 'decimal' },
          plugins: [listPluginPage, BaseIndentPlugin],
        });

        expect(editor.children).toEqual(output.children);
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
        ) as any as BasePlateEditor;

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
        ) as any as BasePlateEditor;

        const editor = getToggledEditor({
          input,
          options: { listRestart: 5, listStyleType: 'decimal' },
        });

        expect(editor.children).toEqual(output.children);
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
          ) as any as BasePlateEditor;

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
          ) as any as BasePlateEditor;

          const editor = getToggledEditor({
            input,
            options: {
              listRestartPolite: 5,
              listStyleType: 'decimal',
            },
          });

          expect(editor.children).toEqual(output.children);
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
          ) as any as BasePlateEditor;

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
          ) as any as BasePlateEditor;

          const editor = getToggledEditor({
            input,
            options: {
              listRestartPolite: 5,
              listStyleType: 'decimal',
            },
          });

          expect(editor.children).toEqual(output.children);
        });
      });
    });
  });
});
