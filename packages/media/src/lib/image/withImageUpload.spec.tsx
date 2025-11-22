/** @jsx jsxt */

import { jsxt } from '@platejs/test-utils';
import { createPlateEditor } from 'platejs/react';

import { BaseImagePlugin } from './BaseImagePlugin';

jsxt;

describe('withImageUpload', () => {
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

    it('should insert image from the file(s)', () => {
      const editor = createPlateEditor({
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

    it('should run default insertData', () => {
      const jsonParseSpy = spyOn(JSON, 'parse').mockReturnValue(
        <fragment>image.png</fragment>
      );

      const editor = createPlateEditor({
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

    it('should insert image from the file(s)', () => {
      const editor = createPlateEditor({
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

  // it('should call uploadImage when provided', async () => {
  //   const uploadSpy = mock();
  //   const editor = pipe(
  //     input,
  //     withReact,
  //     withImageUpload({ uploadImage: uploadSpy })
  //   );
  //
  //   const data = {
  //     getData: () => 'test',
  //     files: [
  //       new File(['test'], 'test.png', {
  //         type: 'image/png',
  //       }),
  //     ],
  //   };
  //   editor.tf.insertData(data as any);
  //
  //   await new Promise((resolve) => setTimeout(resolve, 10));
  //
  //   expect(uploadSpy).toHaveBeenCalled();
  // });
});
