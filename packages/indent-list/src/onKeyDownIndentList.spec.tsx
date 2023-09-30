/** @jsx jsx */

import { createPlateEditor, getPlugin } from '@udecode/plate-common';
import { createIndentPlugin } from '@udecode/plate-indent';
import { jsx } from '@udecode/plate-test-utils';
import * as isHotkey from 'is-hotkey';

import {
  createIndentListPlugin,
  IndentListPlugin,
  KEY_LIST_STYLE_TYPE,
} from './createIndentListPlugin';
import { onKeyDownIndentList } from './onKeyDownIndentList';

jsx;

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
      editor: input,
      plugins: [createIndentPlugin(), createIndentListPlugin()],
    });

    onKeyDownIndentList(
      editor,
      getPlugin<IndentListPlugin>(editor, KEY_LIST_STYLE_TYPE)
    )(event as any);

    expect(editor.children).toEqual(output.children);

    const output2 = (
      <editor>
        <hp>
          <htext />
        </hp>
      </editor>
    ) as any;

    onKeyDownIndentList(
      editor,
      getPlugin<IndentListPlugin>(editor, KEY_LIST_STYLE_TYPE)
    )(event as any);

    expect(editor.children).toEqual(output2.children);
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
      editor: input,
      plugins: [createIndentPlugin(), createIndentListPlugin()],
    });

    onKeyDownIndentList(
      editor,
      getPlugin<IndentListPlugin>(editor, KEY_LIST_STYLE_TYPE)
    )(event as any);

    expect(editor.children).toEqual(output.children);
  });
});
