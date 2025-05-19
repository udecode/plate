/** @jsx jsxt */

import * as isHotkey from '@udecode/plate-core';
import { IndentPlugin } from '@udecode/plate-indent/react';
import { jsxt } from '@udecode/plate-test-utils';
import { getEditorPlugin, ParagraphPlugin } from '@udecode/plate/react';
import { createPlateEditor } from '@udecode/plate/react';

import { ListPlugin } from './ListPlugin';
import { onKeyDownList } from './onKeyDownList';

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
      plugins: [ParagraphPlugin, IndentPlugin, ListPlugin],
      selection: input.selection,
      value: input.children,
    });

    onKeyDownList({
      ...getEditorPlugin(editor, ListPlugin),
      event: event as any,
    });

    expect(editor.children).toEqual(output.children);
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
      plugins: [ParagraphPlugin, IndentPlugin, ListPlugin],
      selection: input.selection,
      value: input.children,
    });

    onKeyDownList({
      ...getEditorPlugin(editor, ListPlugin),
      event: event as any,
    });

    expect(editor.children).toEqual(output.children);
  });
});
