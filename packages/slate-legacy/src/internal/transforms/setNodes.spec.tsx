/** @jsx jsx */

import { jsx } from '@platejs/test-utils';

import { createEditor } from '../../create-editor';
import type { Editor, LegacyEditorMethods } from '../../interfaces';
import { syncLegacyMethods } from '../../utils/assignLegacyTransforms';

jsx;

const withMarkableVoid = (editor: Editor & LegacyEditorMethods) => {
  const { isInline, isVoid, markableVoid } = editor;

  editor.isInline = (element) =>
    element.type === 'mention' || isInline(element);
  editor.isVoid = (element) => element.type === 'mention' || isVoid(element);
  editor.markableVoid = (element) =>
    element.type === 'mention' || markableVoid(element);
  syncLegacyMethods(editor);

  return editor;
};

describe('setNodes', () => {
  describe('when setting marks', () => {
    it('set marks with marks option', () => {
      const editor = createEditor(
        (
          <editor>
            <hp>
              te
              <anchor />
              st
              <focus />
              ing
            </hp>
          </editor>
        ) as any
      );

      editor.tf.setNodes({ bold: true }, { marks: true });

      expect(editor.children).toEqual([
        {
          children: [
            { text: 'te' },
            { bold: true, text: 'st' },
            { text: 'ing' },
          ],
          type: 'p',
        },
      ]);
    });

    it('splits an expanded range before applying marks', () => {
      const editor = createEditor({
        children: [
          { type: 'p', children: [{ text: 'ab' }, { text: 'cd' }] },
        ] as any,
        selection: {
          anchor: { offset: 1, path: [0, 0] },
          focus: { offset: 1, path: [0, 1] },
        },
      });

      editor.tf.setNodes({ italic: true }, { marks: true });

      expect(editor.children).toEqual([
        {
          type: 'p',
          children: [
            { text: 'a' },
            { italic: true, text: 'bc' },
            { text: 'd' },
          ],
        },
      ]);
    });

    it('applies marks at an explicit text path', () => {
      const editor = createEditor({
        children: [{ type: 'p', children: [{ text: 'word' }] }] as any,
      });

      editor.tf.setNodes({ bold: true }, { at: [0, 0], marks: true });

      expect(editor.children).toEqual([
        {
          type: 'p',
          children: [{ bold: true, text: 'word' }],
        },
      ]);
    });

    it('updates the text inside a collapsed markable void', () => {
      const editor = withMarkableVoid(
        createEditor({
          children: [
            {
              type: 'p',
              children: [
                { text: 'word' },
                { type: 'mention', children: [{ text: '' }] },
                { text: '' },
              ],
            },
          ] as any,
          selection: {
            anchor: { offset: 0, path: [0, 1, 0] },
            focus: { offset: 0, path: [0, 1, 0] },
          },
        }) as Editor & LegacyEditorMethods
      );

      editor.tf.setNodes({ bold: true }, { marks: true });

      expect(editor.children).toEqual([
        {
          type: 'p',
          children: [
            { text: 'word' },
            { type: 'mention', children: [{ bold: true, text: '' }] },
            { text: '' },
          ],
        },
      ]);
    });

    it('falls back to regular setNodes for a collapsed plain-text selection', () => {
      const editor = createEditor(
        (
          <editor>
            <hp>
              wo
              <cursor />
              rd
            </hp>
          </editor>
        ) as any
      );

      editor.tf.setNodes({ bold: true }, { marks: true });

      expect(editor.children).toEqual([
        {
          bold: true,
          type: 'p',
          children: [{ text: 'word' }],
        },
      ]);
    });
  });

  describe('when setting element props without marks mode', () => {
    it('updates the node at an explicit path', () => {
      const editor = createEditor({
        children: [{ type: 'p', children: [{ text: 'ab' }] }] as any,
      });

      editor.tf.setNodes({ type: 'blockquote' } as any, { at: [0] });

      expect(editor.children).toEqual([
        { type: 'blockquote', children: [{ text: 'ab' }] },
      ]);
    });

    it('updates all selected blocks across an expanded selection', () => {
      const editor = createEditor({
        children: [
          { type: 'p', children: [{ text: 'word' }] },
          { type: 'p', children: [{ text: 'another' }] },
        ] as any,
        selection: {
          anchor: { offset: 0, path: [0, 0] },
          focus: { offset: 1, path: [1, 0] },
        },
      });

      editor.tf.setNodes({ someKey: true } as any, {
        match: (node) =>
          !!(node as any).children && editor.api.isBlock(node as any),
      });

      expect(editor.children).toEqual([
        { type: 'p', someKey: true, children: [{ text: 'word' }] },
        { type: 'p', someKey: true, children: [{ text: 'another' }] },
      ]);
      expect(editor.selection).toEqual({
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 1, path: [1, 0] },
      });
    });

    it('does not update the hanging end block when focus is at its start', () => {
      const editor = createEditor({
        children: [
          { type: 'p', children: [{ text: 'word' }] },
          { type: 'p', children: [{ text: 'another' }] },
        ] as any,
        selection: {
          anchor: { offset: 0, path: [0, 0] },
          focus: { offset: 0, path: [1, 0] },
        },
      });

      editor.tf.setNodes({ someKey: true } as any, {
        match: (node) =>
          !!(node as any).children && editor.api.isBlock(node as any),
      });

      expect(editor.children).toEqual([
        { type: 'p', someKey: true, children: [{ text: 'word' }] },
        { type: 'p', children: [{ text: 'another' }] },
      ]);
      expect(editor.selection).toEqual({
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [1, 0] },
      });
    });
  });
});
