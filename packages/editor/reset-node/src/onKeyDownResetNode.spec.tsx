/** @jsx jsx */

import { ELEMENT_BLOCKQUOTE } from '@udecode/plate-block-quote/src/createBlockquotePlugin';
import { ELEMENT_CODE_BLOCK } from '@udecode/plate-code-block/src/index';
import {
  isBlockAboveEmpty,
  isSelectionAtBlockStart,
  mockPlugin,
  PlateEditor,
} from '@udecode/plate-core';
import { ELEMENT_LI } from '@udecode/plate-list';
import { unwrapList } from '@udecode/plate-list/src/index';
import { ELEMENT_PARAGRAPH } from '@udecode/plate-paragraph';
import { jsx } from '@udecode/plate-test-utils';
import { createPlateUIEditor } from '@udecode/plate-ui/src/index';
import * as isHotkey from 'is-hotkey';
import { onKeyDownResetNode } from './onKeyDownResetNode';

jsx;

describe('onKeyDownResetNode', () => {
  describe('when delete in a blockquote', () => {
    const input = ((
      <editor>
        <hblockquote>
          <cursor />
          test
        </hblockquote>
      </editor>
    ) as any) as PlateEditor;

    const output = (
      <editor>
        <hp>
          <cursor />
          test
        </hp>
      </editor>
    ) as any;

    it('should render', () => {
      jest.spyOn(isHotkey, 'default').mockReturnValue(true);

      onKeyDownResetNode(
        input,
        mockPlugin({
          options: {
            rules: [
              {
                types: [ELEMENT_BLOCKQUOTE],
                defaultType: ELEMENT_PARAGRAPH,
                hotkey: 'Backspace',
                predicate: isSelectionAtBlockStart,
              },
            ],
          },
        })
      )(new KeyboardEvent('keydown') as any);

      expect(input.children).toEqual(output.children);
    });
  });

  describe('when enter in a blockquote', () => {
    const input = ((
      <editor>
        <hblockquote>
          <htext />
          <cursor />
        </hblockquote>
      </editor>
    ) as any) as PlateEditor;

    const output = (
      <editor>
        <hp>
          <htext />
          <cursor />
        </hp>
      </editor>
    ) as any;

    it('should render', () => {
      jest.spyOn(isHotkey, 'default').mockReturnValue(true);

      onKeyDownResetNode(
        input,
        mockPlugin({
          options: {
            rules: [
              {
                types: [ELEMENT_BLOCKQUOTE],
                defaultType: ELEMENT_PARAGRAPH,
                hotkey: 'Enter',
                predicate: isBlockAboveEmpty,
              },
            ],
          },
        })
      )(new KeyboardEvent('keydown') as any);

      expect(input.children).toEqual(output.children);
    });
  });

  describe('when enter in a code block', () => {
    const input = ((
      <editor>
        <hcodeblock>
          <htext />
          <cursor />
        </hcodeblock>
      </editor>
    ) as any) as PlateEditor;

    const output = (
      <editor>
        <hp>
          <htext />
          <cursor />
        </hp>
      </editor>
    ) as any;

    it('should render', () => {
      jest.spyOn(isHotkey, 'default').mockReturnValue(true);

      onKeyDownResetNode(
        input,
        mockPlugin({
          options: {
            rules: [
              {
                types: [ELEMENT_CODE_BLOCK],
                defaultType: ELEMENT_PARAGRAPH,
                hotkey: 'Enter',
                predicate: isBlockAboveEmpty,
              },
            ],
          },
        })
      )(new KeyboardEvent('keydown') as any);

      expect(input.children).toEqual(output.children);
    });
  });

  describe('when delete in a list', () => {
    const input = (
      <editor>
        <hul>
          <hli>
            <hp>
              <htext />
              <cursor />
            </hp>
          </hli>
        </hul>
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

    it('should be', () => {
      const editor = createPlateUIEditor({
        editor: input,
      });

      jest.spyOn(isHotkey, 'default').mockReturnValue(true);

      const resetBlockTypesListRule = {
        types: [ELEMENT_LI],
        defaultType: ELEMENT_PARAGRAPH,
        onReset: unwrapList as any,
      };

      onKeyDownResetNode(
        input,
        mockPlugin({
          options: {
            rules: [
              {
                ...resetBlockTypesListRule,
                hotkey: 'Enter',
                predicate: isBlockAboveEmpty,
              },
              {
                ...resetBlockTypesListRule,
                hotkey: 'Backspace',
                predicate: isSelectionAtBlockStart,
              },
            ],
          },
        })
      )(new KeyboardEvent('keydown') as any);

      expect(editor.children).toEqual(output.children);
    });
  });
});
