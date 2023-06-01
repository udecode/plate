/** @jsx jsx */

import { ELEMENT_BLOCKQUOTE } from '@udecode/plate-block-quote';
import { ELEMENT_CODE_BLOCK } from '@udecode/plate-code-block';
import { ELEMENT_LI } from '@udecode/plate-list';
import { ELEMENT_PARAGRAPH } from '@udecode/plate-paragraph';
import { jsx } from '@udecode/plate-test-utils';
import * as isHotkey from 'is-hotkey';
import { onKeyDownResetNode } from './onKeyDownResetNode';

import { mockPlugin } from '@/core/src/index';
import {
  isCodeBlockEmpty,
  isSelectionAtCodeBlockStart,
  unwrapCodeBlock,
} from '@/nodes/code-block/src/index';
import { unwrapList } from '@/nodes/list/src/index';
import { createPlateUIEditor } from '@/plate/createPlateUIEditor';
import {
  isBlockAboveEmpty,
  isSelectionAtBlockStart,
} from '@/slate-utils/src/index';

jsx;

describe('onKeyDownResetNode', () => {
  const enterRule = {
    hotkey: 'Enter',
    predicate: isBlockAboveEmpty,
  };

  const backspaceRule = {
    hotkey: 'Backspace',
    predicate: isSelectionAtBlockStart,
  };

  describe('when inside a blockquote', () => {
    const blockquoteRule = {
      types: [ELEMENT_BLOCKQUOTE],
      defaultType: ELEMENT_PARAGRAPH,
    };

    const plugin = mockPlugin({
      options: {
        rules: [
          { ...blockquoteRule, ...enterRule },
          { ...blockquoteRule, ...backspaceRule },
        ],
      },
    });

    it('should reset on enter', () => {
      const input = (
        <editor>
          <hblockquote>
            <htext />
            <cursor />
          </hblockquote>
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

      const editor = createPlateUIEditor({
        editor: input,
      });

      jest
        .spyOn(isHotkey, 'default')
        .mockImplementation((hotkey) => hotkey === 'Enter');

      onKeyDownResetNode(editor, plugin)(new KeyboardEvent('keydown') as any);

      expect(editor.children).toEqual(output.children);
    });

    it('should reset on backspace', () => {
      const input = (
        <editor>
          <hblockquote>
            <cursor />
            test
          </hblockquote>
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

      const editor = createPlateUIEditor({
        editor: input,
      });

      jest
        .spyOn(isHotkey, 'default')
        .mockImplementation((hotkey) => hotkey === 'Backspace');

      onKeyDownResetNode(editor, plugin)(new KeyboardEvent('keydown') as any);

      expect(editor.children).toEqual(output.children);
    });
  });

  describe('when inside a code block', () => {
    const codeBlockRule = {
      types: [ELEMENT_CODE_BLOCK],
      defaultType: ELEMENT_PARAGRAPH,
      onReset: unwrapCodeBlock as any,
    };

    const plugin = mockPlugin({
      options: {
        rules: [
          {
            ...codeBlockRule,
            ...enterRule,
            predicate: isCodeBlockEmpty,
          },
          {
            ...codeBlockRule,
            ...backspaceRule,
            predicate: isSelectionAtCodeBlockStart,
          },
        ],
      },
    });

    it('should reset on enter when code block is empty', () => {
      const input = (
        <editor>
          <hcodeblock>
            <hcodeline>
              <htext />
              <cursor />
            </hcodeline>
          </hcodeblock>
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

      const editor = createPlateUIEditor({
        editor: input,
      });

      jest
        .spyOn(isHotkey, 'default')
        .mockImplementation((hotkey) => hotkey === 'Enter');

      onKeyDownResetNode(editor, plugin)(new KeyboardEvent('keydown') as any);

      expect(editor.children).toEqual(output.children);
    });

    // Since we're not actually performing the keydown, we don't need to test
    // for its default behavior.
    it('should not reset on enter when code block is not empty', () => {
      const input = (
        <editor>
          <hcodeblock>
            <hcodeline>
              <htext />
              <cursor />
            </hcodeline>
            <hcodeline>line 2</hcodeline>
          </hcodeblock>
        </editor>
      ) as any;

      const output = (
        <editor>
          <hcodeblock>
            <hcodeline>
              <htext />
              <cursor />
            </hcodeline>
            <hcodeline>line 2</hcodeline>
          </hcodeblock>
        </editor>
      ) as any;

      const editor = createPlateUIEditor({
        editor: input,
      });

      jest
        .spyOn(isHotkey, 'default')
        .mockImplementation((hotkey) => hotkey === 'Enter');

      onKeyDownResetNode(editor, plugin)(new KeyboardEvent('keydown') as any);

      expect(editor.children).toEqual(output.children);
    });

    it('should reset on backspace when on first line', () => {
      const input = (
        <editor>
          <hcodeblock>
            <hcodeline>
              <cursor />
              line 1
            </hcodeline>
            <hcodeline>line 2</hcodeline>
          </hcodeblock>
        </editor>
      ) as any;

      const output = (
        <editor>
          <hp>
            <cursor />
            line 1
          </hp>
          <hp>line 2</hp>
        </editor>
      ) as any;

      const editor = createPlateUIEditor({
        editor: input,
      });

      jest
        .spyOn(isHotkey, 'default')
        .mockImplementation((hotkey) => hotkey === 'Backspace');

      onKeyDownResetNode(editor, plugin)(new KeyboardEvent('keydown') as any);

      expect(editor.children).toEqual(output.children);
    });

    // Since we're not actually performing the keydown, we don't need to test
    // for its default behavior.
    it('should not reset on backspace when on line after first', () => {
      const input = (
        <editor>
          <hcodeblock>
            <hcodeline>line 1</hcodeline>
            <hcodeline>
              <cursor />
              line 2
            </hcodeline>
          </hcodeblock>
        </editor>
      ) as any;

      const output = (
        <editor>
          <hcodeblock>
            <hcodeline>line 1</hcodeline>
            <hcodeline>
              <cursor />
              line 2
            </hcodeline>
          </hcodeblock>
        </editor>
      ) as any;

      const editor = createPlateUIEditor({
        editor: input,
      });

      jest
        .spyOn(isHotkey, 'default')
        .mockImplementation((hotkey) => hotkey === 'Backspace');

      onKeyDownResetNode(editor, plugin)(new KeyboardEvent('keydown') as any);

      expect(editor.children).toEqual(output.children);
    });
  });

  describe('when inside a list', () => {
    const listRule = {
      types: [ELEMENT_LI],
      defaultType: ELEMENT_PARAGRAPH,
      onReset: unwrapList as any,
    };

    const plugin = mockPlugin({
      options: {
        rules: [
          { ...listRule, ...enterRule },
          { ...listRule, ...backspaceRule },
        ],
      },
    });

    it('should reset on enter', () => {
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

      const editor = createPlateUIEditor({
        editor: input,
      });

      jest
        .spyOn(isHotkey, 'default')
        .mockImplementation((hotkey) => hotkey === 'Enter');

      onKeyDownResetNode(editor, plugin)(new KeyboardEvent('keydown') as any);

      expect(editor.children).toEqual(output.children);
    });

    it('should reset on backspace', () => {
      const input = (
        <editor>
          <hul>
            <hli>
              <hp>
                <cursor />
                line 1
              </hp>
            </hli>
            <hli>
              <hp>line 2</hp>
            </hli>
          </hul>
        </editor>
      ) as any;

      const output = (
        <editor>
          <hp>
            <cursor />
            line 1
          </hp>
          <hul>
            <hli>
              <hp>line 2</hp>
            </hli>
          </hul>
        </editor>
      ) as any;

      const editor = createPlateUIEditor({
        editor: input,
      });

      jest
        .spyOn(isHotkey, 'default')
        .mockImplementation((hotkey) => hotkey === 'Backspace');

      onKeyDownResetNode(editor, plugin)(new KeyboardEvent('keydown') as any);

      expect(editor.children).toEqual(output.children);
    });
  });
});
