/** @jsx jsx */

import { ELEMENT_BLOCKQUOTE } from '@udecode/plate-block-quote';
import {
  ELEMENT_CODE_BLOCK,
  isCodeBlockEmpty,
  isSelectionAtCodeBlockStart,
  unwrapCodeBlock,
} from '@udecode/plate-code-block';
import {
  createPlateEditor,
  isBlockAboveEmpty,
  isSelectionAtBlockStart,
  mockPlugin,
} from '@udecode/plate-common';
import * as isHotkey from '@udecode/plate-core/server';
import { ELEMENT_LI, unwrapList } from '@udecode/plate-list';
import { ELEMENT_PARAGRAPH } from '@udecode/plate-paragraph';
import { jsx } from '@udecode/plate-test-utils';

import { onKeyDownResetNode } from './onKeyDownResetNode';

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
      defaultType: ELEMENT_PARAGRAPH,
      types: [ELEMENT_BLOCKQUOTE],
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

      const editor = createPlateEditor({
        editor: input,
      });

      jest
        .spyOn(isHotkey, 'isHotkey')
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

      const editor = createPlateEditor({
        editor: input,
      });

      jest
        .spyOn(isHotkey, 'isHotkey')
        .mockImplementation((hotkey) => hotkey === 'Backspace');

      onKeyDownResetNode(editor, plugin)(new KeyboardEvent('keydown') as any);

      expect(editor.children).toEqual(output.children);
    });
  });

  describe('when inside a code block', () => {
    const codeBlockRule = {
      defaultType: ELEMENT_PARAGRAPH,
      onReset: unwrapCodeBlock as any,
      types: [ELEMENT_CODE_BLOCK],
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

      const editor = createPlateEditor({
        editor: input,
      });

      jest
        .spyOn(isHotkey, 'isHotkey')
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

      const editor = createPlateEditor({
        editor: input,
      });

      jest
        .spyOn(isHotkey, 'isHotkey')
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

      const editor = createPlateEditor({
        editor: input,
      });

      jest
        .spyOn(isHotkey, 'isHotkey')
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

      const editor = createPlateEditor({
        editor: input,
      });

      jest
        .spyOn(isHotkey, 'isHotkey')
        .mockImplementation((hotkey) => hotkey === 'Backspace');

      onKeyDownResetNode(editor, plugin)(new KeyboardEvent('keydown') as any);

      expect(editor.children).toEqual(output.children);
    });
  });

  describe('when inside a list', () => {
    const listRule = {
      defaultType: ELEMENT_PARAGRAPH,
      onReset: unwrapList as any,
      types: [ELEMENT_LI],
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

      const editor = createPlateEditor({
        editor: input,
      });

      jest
        .spyOn(isHotkey, 'isHotkey')
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

      const editor = createPlateEditor({
        editor: input,
      });

      jest
        .spyOn(isHotkey, 'isHotkey')
        .mockImplementation((hotkey) => hotkey === 'Backspace');

      onKeyDownResetNode(editor, plugin)(new KeyboardEvent('keydown') as any);

      expect(editor.children).toEqual(output.children);
    });
  });
});
