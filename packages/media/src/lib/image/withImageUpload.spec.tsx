/** @jsx jsxt */

import { jsxt } from '@platejs/test-utils';

import { getCurrentRuntimeTransforms } from '../../../../core/src/internal/currentRuntimeBridge';
import { InputRulesPlugin } from '../../../../core/src/lib/plugins/input-rules/internal/InputRulesPlugin';
import { createPlateRuntimeEditor } from '../../../../core/src/react/editor/createPlateRuntimeEditor';
import { BaseImagePlugin } from './BaseImagePlugin';

jsxt;

describe('ImageRules.upload', () => {
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
      const editor = createPlateRuntimeEditor({
        initialSelection: input.selection,
        initialValue: input.children,
        plugins: [InputRulesPlugin, BaseImagePlugin],
      });

      const data = {
        files: [
          new File(['test'], 'test.png', {
            type: 'image/png',
          }),
        ],
        getData: () => '',
      };
      getCurrentRuntimeTransforms(editor).insertData(data as any);

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
      const jsonParseSpy = spyOn(JSON, 'parse').mockReturnValue(
        <fragment>image.png</fragment>
      );

      const editor = createPlateRuntimeEditor({
        initialSelection: input.selection,
        initialValue: input.children,
        plugins: [InputRulesPlugin, BaseImagePlugin],
      });

      const data = {
        getData: () => '',
      };
      getCurrentRuntimeTransforms(editor).insertData(data as any);

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
      const editor = createPlateRuntimeEditor({
        initialSelection: input.selection,
        initialValue: input.children,
        plugins: [InputRulesPlugin, BaseImagePlugin],
      });

      const data = {
        files: [new File(['test'], 'not-an-image')],
        getData: () => '',
      };
      getCurrentRuntimeTransforms(editor).insertData(data as any);

      expect(editor.children).toEqual(output.children);
    });
  });
});
