/** @jsx jsxt */

import type { SlateEditor } from 'platejs';

import { IndentPlugin } from '@platejs/indent/react';
import { jsxt } from '@platejs/test-utils';
import { createPlateEditor } from 'platejs/react';

import { BaseListPlugin } from './BaseListPlugin';

jsxt;

describe('normalizeList', () => {
  describe('when listStyleType without indent', () => {
    it('should remove listStyleType and listStart props', async () => {
      const input = (
        <editor>
          <hp indent={1} listStyleType="decimal">
            1
          </hp>
          <hp indent={1} listStart={2} listStyleType="decimal">
            <cursor />
          </hp>
          <hp indent={1} listStart={3} listStyleType="decimal">
            1
          </hp>
        </editor>
      ) as any as SlateEditor;

      const output = (
        <editor>
          <hp indent={1} listStyleType="decimal">
            1
          </hp>
          <hp>
            <cursor />
          </hp>
          <hp indent={1} listStyleType="decimal">
            1
          </hp>
        </editor>
      ) as any as SlateEditor;

      const editor = createPlateEditor({
        plugins: [BaseListPlugin, IndentPlugin],
        selection: input.selection,
        shouldNormalizeEditor: true,
        value: input.children,
      });

      editor.tf.deleteBackward();

      expect(editor.children).toEqual(output.children);
    });
  });

  describe('when deleting backward on empty paragraph between two lists', () => {
    it('should merge and renumber the lists', () => {
      const input = (
        <editor>
          <hp indent={1} listStyleType="decimal">
            1
          </hp>
          <hp indent={1} listStart={2} listStyleType="decimal">
            2
          </hp>
          <hp>
            <htext />
            <cursor />
          </hp>
          <hp indent={1} listStyleType="decimal">
            3
          </hp>
          <hp indent={1} listStart={2} listStyleType="decimal">
            4
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
        </editor>
      ) as any as SlateEditor;

      const editor = createPlateEditor({
        plugins: [BaseListPlugin, IndentPlugin],
        selection: input.selection,
        shouldNormalizeEditor: true,
        value: input.children,
      });

      editor.tf.deleteBackward();

      expect(editor.children).toEqual(output.children);
    });
  });

  describe('when deleting forward on empty paragraph between two lists', () => {
    it('should merge and renumber the lists', () => {
      const input = (
        <editor>
          <hp indent={1} listStyleType="decimal">
            1
          </hp>
          <hp indent={1} listStart={2} listStyleType="decimal">
            2
          </hp>
          <hp>
            <htext />
            <cursor />
          </hp>
          <hp indent={1} listStyleType="decimal">
            3
          </hp>
          <hp indent={1} listStart={2} listStyleType="decimal">
            4
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
        </editor>
      ) as any as SlateEditor;

      const editor = createPlateEditor({
        plugins: [BaseListPlugin, IndentPlugin],
        selection: input.selection,
        shouldNormalizeEditor: true,
        value: input.children,
      });

      editor.tf.deleteForward();

      expect(editor.children).toEqual(output.children);
    });
  });
});

describe('keyboard handling', () => {
  describe('when Enter on indented list and empty', () => {
    it('should outdent', () => {
      const input = (
        <editor>
          <hp indent={2} listStyleType="disc">
            <cursor />
          </hp>
        </editor>
      ) as any;

      const output = (
        <editor>
          <hp indent={1} listStyleType="disc">
            <htext />
          </hp>
        </editor>
      ) as any;

      const editor = createPlateEditor({
        plugins: [BaseListPlugin, IndentPlugin],
        selection: input.selection,
        value: input.children,
      });

      editor.tf.insertBreak();

      expect(editor.children).toEqual(output.children);
    });
  });

  describe('when Enter on indented and empty but not list', () => {
    it('should not outdent', () => {
      const input = (
        <editor>
          <hp indent={2}>
            <cursor />
          </hp>
        </editor>
      ) as any;

      const output = (
        <editor>
          <hp indent={2}>
            <htext />
          </hp>
          <hp indent={2}>
            <cursor />
          </hp>
        </editor>
      ) as any;

      const editor = createPlateEditor({
        plugins: [BaseListPlugin, IndentPlugin],
        selection: input.selection,
        value: input.children,
      });

      editor.tf.insertBreak();

      expect(editor.children).toEqual(output.children);
    });
  });
});
