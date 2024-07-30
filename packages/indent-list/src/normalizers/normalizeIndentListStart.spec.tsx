/** @jsx jsx */

import { type PlateEditor, createPlateEditor } from '@udecode/plate-common';
import { createIndentPlugin } from '@udecode/plate-indent';
import { createParagraphPlugin } from '@udecode/plate-paragraph';
import { jsx } from '@udecode/plate-test-utils';

import { indentListPluginPage } from '../__tests__/indentListPluginPage';
import { createIndentListPlugin } from '../IndentListPlugin';

jsx;

describe('normalizeIndentListStart', () => {
  describe('when all cases', () => {
    const input = (
      <editor>
        <hp indent={1} listStyleType="decimal">
          11
        </hp>
        <hp indent={1} listStyleType="decimal">
          12
        </hp>
        <hp indent={2} listStyleType="lower-alpha">
          2a
        </hp>
        <hp indent={2} listStyleType="lower-alpha">
          2b
        </hp>
        <hp indent={1} listStyleType="disc">
          11
        </hp>
        <hp indent={1} listStyleType="disc">
          12
        </hp>
        <hp indent={2} listStyleType="disc">
          21
        </hp>
        <hp indent={3} listStyleType="disc">
          31
        </hp>
        <hp indent={3}>31</hp>
        <hp indent={1} listStyleType="disc">
          13
        </hp>
        <hp indent={1} listStyleType="disc">
          14
        </hp>
      </editor>
    ) as any as PlateEditor;

    const output = (
      <editor>
        <hp indent={1} listStyleType="decimal">
          11
        </hp>
        <hp indent={1} listStart={2} listStyleType="decimal">
          12
        </hp>
        <hp indent={2} listStyleType="lower-alpha">
          2a
        </hp>
        <hp indent={2} listStart={2} listStyleType="lower-alpha">
          2b
        </hp>
        <hp indent={1} listStyleType="disc">
          11
        </hp>
        <hp indent={1} listStart={2} listStyleType="disc">
          12
        </hp>
        <hp indent={2} listStyleType="disc">
          21
        </hp>
        <hp indent={3} listStyleType="disc">
          31
        </hp>
        <hp indent={3}>31</hp>
        <hp indent={1} listStart={3} listStyleType="disc">
          13
        </hp>
        <hp indent={1} listStart={4} listStyleType="disc">
          14
        </hp>
      </editor>
    ) as any as PlateEditor;

    it('should be', async () => {
      const editor = createPlateEditor({
        editor: input,
        normalizeInitialValue: true,
        plugins: [
          createParagraphPlugin(),
          createIndentPlugin(),
          createIndentListPlugin(),
        ],
      });

      expect(editor.children).toEqual(output.children);
    });
  });

  describe('when options', () => {
    const input = (
      <editor>
        <element type="page">
          <hp indent={1} listStyleType="decimal">
            11
          </hp>
          <hp indent={1} listStyleType="decimal">
            12
          </hp>
        </element>
        <element type="page">
          <hp indent={1} listStyleType="decimal">
            13
            <cursor />
          </hp>
        </element>
        <element type="page">
          <hp indent={1} listStyleType="decimal">
            14
          </hp>
        </element>
      </editor>
    ) as any as PlateEditor;

    const output = (
      <editor>
        <element type="page">
          <hp indent={1} listStyleType="decimal">
            11
          </hp>
          <hp indent={1} listStart={2} listStyleType="decimal">
            12
          </hp>
        </element>
        <element type="page">
          <hp indent={1} listStart={3} listStyleType="decimal">
            13
          </hp>
        </element>
        <element type="page">
          <hp indent={1} listStart={4} listStyleType="decimal">
            14
          </hp>
        </element>
      </editor>
    ) as any as PlateEditor;

    it('should be', async () => {
      const editor = createPlateEditor({
        editor: input,
        normalizeInitialValue: true,
        plugins: [
          createParagraphPlugin(),
          createIndentPlugin(),
          createIndentListPlugin(indentListPluginPage),
        ],
      }) as any;

      expect(editor.children).toEqual(output.children);
    });
  });

  describe('with restart', () => {
    const input = (
      <editor>
        <element type="page">
          <hp indent={1} listStyleType="decimal">
            1
          </hp>
          <hp indent={1} listStyleType="decimal">
            2
          </hp>
        </element>
        <element type="page">
          <hp indent={1} listRestart={1} listStart={2} listStyleType="decimal">
            2
          </hp>
        </element>
      </editor>
    ) as any as PlateEditor;

    const output = (
      <editor>
        <element type="page">
          <hp indent={1} listStyleType="decimal">
            1
          </hp>
          <hp indent={1} listStart={2} listStyleType="decimal">
            2
          </hp>
        </element>
        <element type="page">
          <hp indent={1} listRestart={1} listStart={1} listStyleType="decimal">
            2
          </hp>
        </element>
      </editor>
    ) as any as PlateEditor;

    it('should be', async () => {
      const editor = createPlateEditor({
        editor: input,
        normalizeInitialValue: true,
        plugins: [
          createParagraphPlugin(),
          createIndentPlugin(),
          createIndentListPlugin(indentListPluginPage),
        ],
      }) as any;

      expect(editor.children).toEqual(output.children);
    });
  });
});
