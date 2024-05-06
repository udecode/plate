/** @jsx jsx */

import { type PlateEditor, createPlateEditor } from '@udecode/plate-common';
import { createIndentPlugin } from '@udecode/plate-indent';
import { jsx } from '@udecode/plate-test-utils';

import { indentListPluginPage } from '../__tests__/indentListPluginPage';
import { createIndentListPlugin } from '../createIndentListPlugin';
import { toggleIndentList } from './toggleIndentList';

jsx;

describe('toggleIndentList', () => {
  describe('when listStyleType is not defined', () => {
    it('should set listStyleType', async () => {
      const input = (
        <editor>
          <hp indent={3}>
            1<cursor />
          </hp>
        </editor>
      ) as any as PlateEditor;

      const output = (
        <editor>
          <hp indent={4} listStyleType="disc">
            1<cursor />
          </hp>
        </editor>
      ) as any as PlateEditor;

      const editor = createPlateEditor({
        editor: input,
        plugins: [createIndentListPlugin(), createIndentPlugin()],
      });

      toggleIndentList(editor, { listStyleType: 'disc' });

      expect(editor.children).toEqual(output.children);
    });

    describe('when indent is not set', () => {
      it('should set indent 1', async () => {
        const input = (
          <editor>
            <hp>
              1<cursor />
            </hp>
          </editor>
        ) as any as PlateEditor;

        const output = (
          <editor>
            <hp indent={1} listStyleType="disc">
              1<cursor />
            </hp>
          </editor>
        ) as any as PlateEditor;

        const editor = createPlateEditor({
          editor: input,
          plugins: [createIndentListPlugin(), createIndentPlugin()],
        });

        toggleIndentList(editor, { listStyleType: 'disc' });

        expect(editor.children).toEqual(output.children);
      });
    });
  });

  describe('when listStyleType is defined', () => {
    it('should unset listStyleType', async () => {
      const input = (
        <editor>
          <hp indent={1} listStyleType="disc">
            1<cursor />
          </hp>
        </editor>
      ) as any as PlateEditor;

      const output = (
        <editor>
          <hp>
            1<cursor />
          </hp>
        </editor>
      ) as any as PlateEditor;

      const editor = createPlateEditor({
        editor: input,
        plugins: [createIndentListPlugin(), createIndentPlugin()],
      });

      toggleIndentList(editor, { listStyleType: 'disc' });

      expect(editor.children).toEqual(output.children);
    });
  });

  describe('when there is sibling items', () => {
    it('should set listStyleType on', async () => {
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
      ) as any as PlateEditor;

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
      ) as any as PlateEditor;

      const editor = createPlateEditor({
        editor: input,
        plugins: [createIndentListPlugin(), createIndentPlugin()],
      });

      toggleIndentList(editor, { listStyleType: 'decimal' });

      expect(editor.children).toEqual(output.children);
    });
  });

  describe('when selection is expanded', () => {
    describe('when blocks have no listStyleType', () => {
      it('should set listStyleType', async () => {
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
        ) as any as PlateEditor;

        const output = (
          <editor>
            <hp indent={1} listStyleType="disc">
              1
              <anchor />
            </hp>
            <hp indent={1} listStart={2} listStyleType="disc">
              1
            </hp>
            <hp indent={1} listStart={3} listStyleType="disc">
              1
              <focus />
            </hp>
          </editor>
        ) as any as PlateEditor;

        const editor = createPlateEditor({
          editor: input,
          plugins: [createIndentListPlugin(), createIndentPlugin()],
        });

        toggleIndentList(editor, { listStyleType: 'disc' });

        expect(editor.children).toEqual(output.children);
      });
    });

    describe('when blocks have (different) listStyleType except one block without', () => {
      it('should set listStyleType', async () => {
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
        ) as any as PlateEditor;

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
        ) as any as PlateEditor;

        const editor = createPlateEditor({
          editor: input,
          plugins: [createIndentListPlugin(), createIndentPlugin()],
        });

        toggleIndentList(editor, { listStyleType: 'decimal' });

        expect(editor.children).toEqual(output.children);
      });
    });

    describe('when blocks have eq listStyleType', () => {
      it('should outdent', async () => {
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
        ) as any as PlateEditor;

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
        ) as any as PlateEditor;

        const editor = createPlateEditor({
          editor: input,
          plugins: [createIndentListPlugin(), createIndentPlugin()],
        });

        toggleIndentList(editor, { listStyleType: 'disc' });

        expect(editor.children).toEqual(output.children);
      });
    });

    describe('when across pages', () => {
      it('should toggle', async () => {
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
        ) as any as PlateEditor;

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
        ) as any as PlateEditor;

        const editor = createPlateEditor({
          editor: input,
          plugins: [
            createIndentListPlugin(indentListPluginPage),
            createIndentPlugin(),
          ],
        });

        toggleIndentList(editor, { listStyleType: 'decimal' });

        expect(editor.children).toEqual(output.children);
      });
    });
  });
});
