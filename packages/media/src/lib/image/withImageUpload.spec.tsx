/** @jsx jsxt */

import { jsxt } from '@platejs/test-utils';
import { createBaseEditor } from '@platejs/core';

import { BaseImagePlugin } from './BaseImagePlugin';

jsxt;

describe('withImageUpload', () => {
  let restoreWarn: (() => void) | undefined;

  afterEach(() => {
    restoreWarn?.();
  });

  const suppressInsertDataOverrideWarning = () => {
    const originalWarn = console.warn;

    const warnSpy = spyOn(console, 'warn').mockImplementation(
      (message, ...args) => {
        if (
          typeof message === 'string' &&
          message.includes('[OVERRIDE_MISSING]') &&
          message.includes('editor.insertData()')
        ) {
          return;
        }

        originalWarn(message, ...args);
      }
    );
    restoreWarn = () => warnSpy.mockRestore();
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

      const editor = createBaseEditor({
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
      editor.api.clipboard.insertData(data as unknown as DataTransfer);

      expect(editor.read.children()).toEqual(output.children);
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

      const editor = createBaseEditor({
        plugins: [BaseImagePlugin],
        selection: input.selection,
        value: input.children,
      });

      const data = {
        getData: () => '',
      };
      editor.api.clipboard.insertData(data as unknown as DataTransfer);

      expect(editor.read.children()).toEqual(output.children);

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

      const editor = createBaseEditor({
        plugins: [BaseImagePlugin],
        selection: input.selection,
        value: input.children,
      });

      const data = {
        files: [new File(['test'], 'not-an-image')],
        getData: () => '',
      };
      editor.api.clipboard.insertData(data as unknown as DataTransfer);

      expect(editor.read.children()).toEqual(output.children);
    });
  });
});
