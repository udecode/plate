/** @jsx jsxt */

import * as isHotkey from '@platejs/core';
import { IndentPlugin } from '@platejs/indent/react';
import { jsxt } from '@platejs/test-utils';
import { getEditorPlugin, ParagraphPlugin } from 'platejs/react';
import { createPlateEditor } from 'platejs/react';

import { IndentListPlugin } from './IndentListPlugin';
import { onKeyDownIndentList } from './onKeyDownIndentList';

jsxt;

jest.spyOn(isHotkey, 'isHotkey').mockReturnValue(true);

describe('when indented list and empty', () => {
  it('should outdent', () => {
    const input = (
      <editor>
        <hp indent={2} listStyleType="disc">
          <cursor />
        </hp>
      </editor>
    ) as any;

    const output = (
      <editor>
        <hp indent={1} listStyleType="disc">
          <htext />
        </hp>
      </editor>
    ) as any;

    const event = new KeyboardEvent('keydown', { key: 'Enter' }) as any;
    const editor = createPlateEditor({
      plugins: [ParagraphPlugin, IndentPlugin, IndentListPlugin],
      selection: input.selection,
      value: input.children,
    });

    onKeyDownIndentList({
      ...getEditorPlugin(editor, IndentListPlugin),
      event: event as any,
    });

    expect(editor.children).toEqual(output.children);

    // const output2 = (
    //   <editor>
    //     <hp>
    //       <htext />
    //     </hp>
    //   </editor>
    // ) as any;
    //
    // onKeyDownIndentList({
    //   editor,
    //   event: event as any,
    //   plugin: getPlugin<IndentListPluginOptions>(editor, IndentListPlugin.key),
    // });
    //
    // expect(editor.children).toEqual(output2.children);
  });
});

describe('when indented and empty but not list', () => {
  it('should do nothing', () => {
    const input = (
      <editor>
        <hp indent={2}>
          <cursor />
        </hp>
      </editor>
    ) as any;

    const output = (
      <editor>
        <hp indent={2}>
          <htext />
        </hp>
      </editor>
    ) as any;

    const event = new KeyboardEvent('keydown', { key: 'Enter' }) as any;
    const editor = createPlateEditor({
      plugins: [ParagraphPlugin, IndentPlugin, IndentListPlugin],
      selection: input.selection,
      value: input.children,
    });

    onKeyDownIndentList({
      ...getEditorPlugin(editor, IndentListPlugin),
      event: event as any,
    });

    expect(editor.children).toEqual(output.children);
  });
});
