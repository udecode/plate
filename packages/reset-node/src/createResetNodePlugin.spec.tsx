/** @jsx jsx */

import { createPlateEditor } from '@udecode/plate-common';
import { jsx } from '@udecode/plate-test-utils';
import { createResetNodePlugin } from './createResetNodePlugin';

jsx;

describe('createResetNodePlugin', () => {
  describe('when delete from start to end of editor', () => {
    const input = (
      <editor>
        <hp test="test">
          <anchor />
          test
        </hp>
        <hp>
          test
          <focus />
        </hp>
      </editor>
    ) as any;

    const output = (
      <editor>
        <hp>
          <htext />
          <cursor />
        </hp>
      </editor>
    ) as any;

    it('should reset', () => {
      const editor = createPlateEditor({
        editor: input,
        plugins: [createResetNodePlugin()],
      });

      editor.deleteFragment();

      expect(editor.children).toEqual(output.children);
    });
  });

  describe('when delete from end to start of editor', () => {
    const input = (
      <editor>
        <hp test="test">
          <focus />
          test
        </hp>
        <hp>
          test
          <anchor />
        </hp>
      </editor>
    ) as any;

    const output = (
      <editor>
        <hp>
          <htext />
          <cursor />
        </hp>
      </editor>
    ) as any;

    it('should reset', () => {
      const editor = createPlateEditor({
        editor: input,
        plugins: [createResetNodePlugin()],
      });

      editor.deleteFragment();

      expect(editor.children).toEqual(output.children);
    });
  });

  describe('when delete at first block start', () => {
    const input = (
      <editor>
        <hh1 test="test">
          <cursor />
          test
        </hh1>
      </editor>
    ) as any;

    const output = (
      <editor>
        <hp>
          <cursor />
          test
        </hp>
      </editor>
    ) as any;

    it('should reset', () => {
      const editor = createPlateEditor({
        editor: input,
        plugins: [createResetNodePlugin()],
      });

      editor.deleteBackward();

      expect(editor.children).toEqual(output.children);
    });
  });
});
