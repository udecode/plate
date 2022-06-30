/** @jsx jsx */

import { getPlugin, HotkeyPlugin, Hotkeys } from '@udecode/plate-core';
import { createListPlugin } from '@udecode/plate-list';
import { jsx } from '@udecode/plate-test-utils';
import { createPlateUIEditor } from '@udecode/plate-ui/src/utils/createPlateUIEditor';
import * as isHotkey from 'is-hotkey';
import { onKeyDownList } from './onKeyDownList';

jsx;

it('should indent single list item', () => {
  const input = (
    <editor>
      <hul>
        <hli>
          <hlic>some text</hlic>
        </hli>
        <hli>
          <hlic>
            <cursor />
            some text
          </hlic>
        </hli>
      </hul>
    </editor>
  ) as any;

  const output = (
    <editor>
      <hul>
        <hli>
          <hlic>some text</hlic>
          <hul>
            <hli>
              <hlic>
                <cursor />
                some text
              </hlic>
            </hli>
          </hul>
        </hli>
      </hul>
    </editor>
  ) as any;

  const event = new KeyboardEvent('keydown', { key: 'Tab' }) as any;
  const editor = createPlateUIEditor({
    editor: input,
    plugins: [createListPlugin()],
  });

  onKeyDownList(editor, getPlugin<HotkeyPlugin>(editor, 'ul'))(event as any);
  expect(editor.children).toEqual(output.children);
});

it('should indent multiple list items', () => {
  const input = (
    <editor>
      <hul>
        <hli>
          <hlic>first element</hlic>
        </hli>
        <hli>
          <hlic>
            <focus />
            second element
          </hlic>
        </hli>
        <hli>
          <hlic>
            third element <anchor />
          </hlic>
        </hli>
      </hul>
    </editor>
  ) as any;

  const output = (
    <editor>
      <hul>
        <hli>
          <hlic>first element</hlic>
          <hul>
            <hli>
              <hlic>
                <focus />
                second element
              </hlic>
            </hli>
            <hli>
              <hlic>
                third element <anchor />
              </hlic>
            </hli>
          </hul>
        </hli>
      </hul>
    </editor>
  ) as any;

  const event = new KeyboardEvent('keydown', { key: 'Tab' }) as any;
  const editor = createPlateUIEditor({
    editor: input,
    plugins: [createListPlugin()],
  });

  onKeyDownList(editor, getPlugin<HotkeyPlugin>(editor, 'ul'))(event as any);
  expect(editor.children).toEqual(output.children);
});

it('should un-indent multiple list items', () => {
  const input = (
    <editor>
      <hul>
        <hli>
          <hlic>first element</hlic>
          <hul>
            <hli>
              <hlic>
                <focus />
                second element
              </hlic>
            </hli>
            <hli>
              <hlic>
                third element <anchor />
              </hlic>
            </hli>
          </hul>
        </hli>
      </hul>
    </editor>
  ) as any;

  const output = (
    <editor>
      <hul>
        <hli>
          <hlic>first element</hlic>
        </hli>
        <hli>
          <hlic>
            <focus />
            second element
          </hlic>
        </hli>
        <hli>
          <hlic>
            third element <anchor />
          </hlic>
        </hli>
      </hul>
    </editor>
  ) as any;

  const event = new KeyboardEvent('keydown', {
    shiftKey: true,
    key: 'Tab',
  }) as any;
  const editor = createPlateUIEditor({
    editor: input,
    plugins: [createListPlugin()],
  });

  onKeyDownList(editor, getPlugin<HotkeyPlugin>(editor, 'ul'))(event as any);
  expect(editor.children).toEqual(output.children);
});
