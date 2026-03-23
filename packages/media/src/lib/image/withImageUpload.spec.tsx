/** @jsx jsxt */

import { jsxt } from '@platejs/test-utils';
import { createSlateEditor } from 'platejs';

import { BaseImagePlugin } from './BaseImagePlugin';

jsxt;

describe('withImageUpload', () => {
  let warnSpy: ReturnType<typeof spyOn>;

  afterEach(() => {
    warnSpy?.mockRestore();
  });

  const suppressInsertDataOverrideWarning = () => {
    const originalWarn = console.warn;

    warnSpy = spyOn(console, 'warn').mockImplementation((message, ...args) => {
      if (
        typeof message === 'string' &&
        message.includes('[OVERRIDE_MISSING]') &&
        message.includes('editor.insertData()')
      ) {
        return;
      }

      originalWarn(message, ...args);
    });
  };

  describe('when inserting a png image', () => {
    const input = (
      <editor>
        <hp>test</hp>
      </editor>
    ) as any;

    const output = (
      <editor>
        <hp>test</hp>
      </editor>
    ) as any;

    it('ignores image files without changing the editor', () => {
      suppressInsertDataOverrideWarning();

      const editor = createSlateEditor({
        plugins: [BaseImagePlugin],
        selection: input.selection,
        value: input.children,
      });

      const data = {
        files: [
          new File(['test'], 'test.png', {
            type: 'image/png',
          }),
        ],
        getData: () => '',
      };
      editor.tf.insertData(data as any);

      expect(editor.children).toEqual(output.children);
    });
  });

  describe('when no files', () => {
    const input = (
      <editor>
        <hp>test</hp>
      </editor>
    ) as any;

    const output = (
      <editor>
        <hp>test</hp>
      </editor>
    ) as any;

    it('falls back to the default insertData behavior', () => {
      suppressInsertDataOverrideWarning();

      const jsonParseSpy = spyOn(JSON, 'parse').mockReturnValue(
        <fragment>image.png</fragment>
      );

      const editor = createSlateEditor({
        plugins: [BaseImagePlugin],
        selection: input.selection,
        value: input.children,
      });

      const data = {
        getData: () => '',
      };
      editor.tf.insertData(data as any);

      expect(editor.children).toEqual(output.children);

      jsonParseSpy.mockRestore();
    });
  });

  describe('when inserting a non-image file', () => {
    const input = (
      <editor>
        <hp>test</hp>
      </editor>
    ) as any;

    const output = (
      <editor>
        <hp>test</hp>
      </editor>
    ) as any;

    it('ignores non-image files without changing the editor', () => {
      suppressInsertDataOverrideWarning();

      const editor = createSlateEditor({
        plugins: [BaseImagePlugin],
        selection: input.selection,
        value: input.children,
      });

      const data = {
        files: [new File(['test'], 'not-an-image')],
        getData: () => '',
      };
      editor.tf.insertData(data as any);

      expect(editor.children).toEqual(output.children);
    });
  });
});
