/** @jsx jsx */

import { createPlateEditor } from '@udecode/plate-common/react';
import { jsx } from '@udecode/plate-test-utils';

import { ImagePlugin } from './ImagePlugin';

jsx;

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
        editor: input,
        plugins: [ImagePlugin],
      });

      const data = {
        files: [
          new File(['test'], 'test.png', {
            type: 'image/png',
          }),
        ],
        getData: () => '',
      };
      editor.insertData(data as any);

      expect(input.children).toEqual(output.children);
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
      jest.spyOn(JSON, 'parse').mockReturnValue(<fragment>image.png</fragment>);

      const editor = createPlateEditor({
        editor: input,
        plugins: [ImagePlugin],
      });

      const data = {
        getData: () => '',
      };
      editor.insertData(data as any);

      expect(input.children).toEqual(output.children);
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
        editor: input,
        plugins: [ImagePlugin],
      });

      const data = {
        files: [new File(['test'], 'not-an-image')],
        getData: () => '',
      };
      editor.insertData(data as any);

      expect(input.children).toEqual(output.children);
    });
  });

  // it('should call uploadImage when provided', async () => {
  //   const uploadSpy = jest.fn();
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
  //   editor.insertData(data as any);
  //
  //   await new Promise((resolve) => setTimeout(resolve, 10));
  //
  //   expect(uploadSpy).toHaveBeenCalled();
  // });
});
