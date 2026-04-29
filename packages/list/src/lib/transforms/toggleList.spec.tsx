/** @jsx jsxt */

import { type SlateEditor, createSlateEditor } from 'platejs';

import { BaseIndentPlugin } from '@platejs/indent';
import { jsxt } from '@platejs/test-utils';

import { listPluginPage } from '../../__tests__/listPluginPage';
import { BaseListPlugin } from '../BaseListPlugin';
import { toggleList } from './toggleList';

jsxt;

const getToggledEditor = ({
  input,
  options,
  plugins = [BaseListPlugin, BaseIndentPlugin],
}: {
  input: SlateEditor;
  options: Parameters<typeof toggleList>[1];
  plugins?: any[];
}) => {
  const editor = createSlateEditor({
    plugins,
    selection: input.selection,
    value: input.children,
  });

  toggleList(editor, options);

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
        ) as any as SlateEditor;

        const output = (
          <editor>
            <hp indent={4} listStyleType="disc">
              1<cursor />
            </hp>
          </editor>
        ) as any as SlateEditor;

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
          ) as any as SlateEditor;

          const output = (
            <editor>
              <hp indent={1} listStyleType="disc">
                1<cursor />
              </hp>
            </editor>
          ) as any as SlateEditor;

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
        ) as any as SlateEditor;

        const output = (
          <editor>
            <hp>
              1<cursor />
            </hp>
          </editor>
        ) as any as SlateEditor;

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
        ) as any as SlateEditor;

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
        ) as any as SlateEditor;

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
        ) as any as SlateEditor;

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
        ) as any as SlateEditor;

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
          ) as any as SlateEditor;

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
          ) as any as SlateEditor;

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
                <cursor />3
              </hp>
            </editor>
          ) as any as SlateEditor;

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
          ) as any as SlateEditor;

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
        ) as any as SlateEditor;

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
        ) as any as SlateEditor;

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
        ) as any as SlateEditor;

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
        ) as any as SlateEditor;

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
        ) as any as SlateEditor;

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
        ) as any as SlateEditor;

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
        ) as any as SlateEditor;

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
        ) as any as SlateEditor;

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
        ) as any as SlateEditor;

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
        ) as any as SlateEditor;

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
          ) as any as SlateEditor;

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
          ) as any as SlateEditor;

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
          ) as any as SlateEditor;

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
          ) as any as SlateEditor;

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
