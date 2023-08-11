/** @jsx jsx */

import {
  createPlateEditor,
  getPlugin,
  HotkeyPlugin,
  PlateEditor,
} from '@udecode/plate-common';
import { createListPlugin } from './createListPlugin';
import { jsx } from '@udecode/plate-test-utils';

import { onKeyDownList } from './onKeyDownList';

jsx;
/*
input:
1. E1
2. |E2

output:
1. E1
  1. |E2
*/
it('should indent single list item (start of item)', () => {
  const input = (
    <editor>
      <hul>
        <hli>
          <hlic>E1</hlic>
        </hli>
        <hli>
          <hlic>
            <cursor />
            E2
          </hlic>
        </hli>
      </hul>
    </editor>
  ) as any;

  const output = (
    <editor>
      <hul>
        <hli>
          <hlic>E1</hlic>
          <hul>
            <hli>
              <hlic>
                <cursor />
                E2
              </hlic>
            </hli>
          </hul>
        </hli>
      </hul>
    </editor>
  ) as any;

  const event = new KeyboardEvent('keydown', { key: 'Tab' }) as any;
  const editor = createPlateEditor({
    editor: input,
    plugins: [createListPlugin()],
  });

  onKeyDownList(editor, getPlugin<HotkeyPlugin>(editor, 'ul'))(event as any);
  expect(editor.children).toEqual(output.children);
});

/*
input:
1. E1
2. E2|

output:
1. E1
  1. E2|
*/
it('should indent single list item (end of item)', () => {
  const input = (
    <editor>
      <hul>
        <hli>
          <hlic>E1</hlic>
        </hli>
        <hli>
          <hlic>
            E2
            <cursor />
          </hlic>
        </hli>
      </hul>
    </editor>
  ) as any;

  const output = (
    <editor>
      <hul>
        <hli>
          <hlic>E1</hlic>
          <hul>
            <hli>
              <hlic>
                E2
                <cursor />
              </hlic>
            </hli>
          </hul>
        </hli>
      </hul>
    </editor>
  ) as any;

  const event = new KeyboardEvent('keydown', { key: 'Tab' }) as any;
  const editor = createPlateEditor({
    editor: input,
    plugins: [createListPlugin()],
  });

  onKeyDownList(editor, getPlugin<HotkeyPlugin>(editor, 'ul'))(event as any);
  expect(editor.children).toEqual(output.children);
});

/*
input:
1. E1
2. |E2
3. E3|

output:
1. E1
  1. |E2
  2. E3|
*/
it('should indent multiple list items (start/end)', () => {
  const input = (
    <editor>
      <hul>
        <hli>
          <hlic>E1</hlic>
        </hli>
        <hli>
          <hlic>
            <focus />
            E2
          </hlic>
        </hli>
        <hli>
          <hlic>
            E3
            <anchor />
          </hlic>
        </hli>
      </hul>
    </editor>
  ) as any;

  const output = (
    <editor>
      <hul>
        <hli>
          <hlic>E1</hlic>
          <hul>
            <hli>
              <hlic>
                <focus />
                E2
              </hlic>
            </hli>
            <hli>
              <hlic>
                E3
                <anchor />
              </hlic>
            </hli>
          </hul>
        </hli>
      </hul>
    </editor>
  ) as any;

  const event = new KeyboardEvent('keydown', { key: 'Tab' }) as any;
  const editor = createPlateEditor({
    editor: input,
    plugins: [createListPlugin()],
  });

  onKeyDownList(editor, getPlugin<HotkeyPlugin>(editor, 'ul'))(event as any);
  expect(editor.children).toEqual(output.children);
});

/*
input:
1. E1
  1. |E2
  2. E3|

output:
1. E1
2. |E2
3. E3|
*/
it('should un-indent multiple list items (start/end)', () => {
  const input = (
    <editor>
      <hul>
        <hli>
          <hlic>E1</hlic>
          <hul>
            <hli>
              <hlic>
                <focus />
                E2
              </hlic>
            </hli>
            <hli>
              <hlic>
                E3
                <anchor />
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
          <hlic>E1</hlic>
        </hli>
        <hli>
          <hlic>
            <focus />
            E2
          </hlic>
        </hli>
        <hli>
          <hlic>
            E3
            <anchor />
          </hlic>
        </hli>
      </hul>
    </editor>
  ) as any;

  const event = new KeyboardEvent('keydown', {
    shiftKey: true,
    key: 'Tab',
  }) as any;
  const editor = createPlateEditor({
    editor: input,
    plugins: [createListPlugin()],
  });

  onKeyDownList(editor, getPlugin<HotkeyPlugin>(editor, 'list'))(event as any);
  expect(editor.children).toEqual(output.children);
});

/*
input:
1. E1
  1. |E2
  2. E3
|

output:
1. E1
2. |E2
3. E3
|
*/
it('should un-indent multiple list items (start/out)', () => {
  const input = (
    <editor>
      <hul>
        <hli>
          <hlic>E1</hlic>
          <hul>
            <hli>
              <hlic>
                <focus />
                E2
              </hlic>
            </hli>
            <hli>
              <hlic>
                E3
                <anchor />
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
          <hlic>E1</hlic>
        </hli>
        <hli>
          <hlic>
            <focus />
            E2
          </hlic>
        </hli>
        <hli>
          <hlic>
            E3
            <anchor />
          </hlic>
        </hli>
      </hul>
    </editor>
  ) as any;

  const event = new KeyboardEvent('keydown', {
    shiftKey: true,
    key: 'Tab',
  }) as any;
  const editor = createPlateEditor({
    editor: input,
    plugins: [createListPlugin()],
  });

  onKeyDownList(editor, getPlugin<HotkeyPlugin>(editor, 'list'))(event as any);
  expect(editor.children).toEqual(output.children);
});

it('should unhang before indentation', () => {
  const input = (
    <editor>
      <hul>
        <hli>
          <hlic>E1</hlic>
        </hli>
        <hli>
          <hlic>
            <focus />
            E2
          </hlic>
        </hli>
        <hli>
          <hlic>E3</hlic>
        </hli>
      </hul>
      <hp>
        <htext>
          <anchor />
          paragraph
        </htext>
      </hp>
    </editor>
  ) as any;

  const output = (
    <editor>
      <hul>
        <hli>
          <hlic>E1</hlic>
          <hul>
            <hli>
              <hlic>
                <focus />
                E2
              </hlic>
            </hli>
            <hli>
              <hlic>E3</hlic>
            </hli>
          </hul>
        </hli>
      </hul>
      <hp>
        <htext>
          <anchor />
          paragraph
        </htext>
      </hp>
    </editor>
  ) as any;

  const event = new KeyboardEvent('keydown', {
    key: 'Tab',
  }) as any;
  const editor = createPlateEditor({
    editor: input,
    plugins: [createListPlugin()],
  });

  onKeyDownList(editor, getPlugin<HotkeyPlugin>(editor, 'list'))(event as any);
  expect(editor.children).toEqual(output.children);
});

it('should NOT not adjust selection length when unhanging ranges', () => {
  const input = (
    <editor>
      <hp>
        Some Text <anchor />
        More Text
        <focus />
      </hp>
    </editor>
  ) as any;
  const editor: PlateEditor<any> = createPlateEditor({
    editor: input,
    plugins: [createListPlugin()],
  });

  const selectionBefore = editor.selection;

  onKeyDownList(
    editor,
    getPlugin<HotkeyPlugin>(editor, 'list')
  )(
    new KeyboardEvent('keydown', {
      key: 'Tab',
    }) as any // Using a native keyboard event but this wants a React.KeyboardEvent.
  );
  expect(editor.selection).toEqual(selectionBefore);

  // Do the same with shift tab.
  onKeyDownList(
    editor,
    getPlugin<HotkeyPlugin>(editor, 'list')
  )(
    new KeyboardEvent('keydown', {
      key: 'Tab',
      shiftKey: true,
    }) as any // Using a native keyboard event but this wants a React.KeyboardEvent.
  );
  expect(editor.selection).toEqual(selectionBefore);
});

it('should convert top-level list item into body upon unindent if enableResetOnShiftTab is true', () => {
  const input = (
    <editor>
      <hul>
        <hli>
          <hlic>E1</hlic>
        </hli>
        <hli>
          <hlic>
            <cursor />
            E2
          </hlic>
        </hli>
        <hli>
          <hlic>E3</hlic>
        </hli>
      </hul>
    </editor>
  ) as any;

  const output = (
    <editor>
      <hul>
        <hli>
          <hlic>E1</hlic>
        </hli>
      </hul>
      <hp>
        <htext>E2</htext>
      </hp>
      <hul>
        <hli>
          <hlic>E3</hlic>
        </hli>
      </hul>
    </editor>
  ) as any;

  const event = new KeyboardEvent('keydown', {
    key: 'Tab',
    shiftKey: true,
  }) as any;
  const editor = createPlateEditor({
    editor: input,
    plugins: [createListPlugin({ options: { enableResetOnShiftTab: true } })],
  });

  onKeyDownList(editor, getPlugin<HotkeyPlugin>(editor, 'list'))(event as any);
  expect(editor.children).toEqual(output.children);
});

it('should convert top-level (first) list item into body upon unindent if enableResetOnShiftTab is true', () => {
  const input = (
    <editor>
      <hul>
        <hli>
          <hlic>
            <cursor />
            E1
          </hlic>
        </hli>
        <hli>
          <hlic>E2</hlic>
        </hli>
        <hli>
          <hlic>E3</hlic>
        </hli>
      </hul>
    </editor>
  ) as any;

  const output = (
    <editor>
      <hp>
        <htext>E1</htext>
      </hp>
      <hul>
        <hli>
          <hlic>E2</hlic>
        </hli>
        <hli>
          <hlic>E3</hlic>
        </hli>
      </hul>
    </editor>
  ) as any;

  const event = new KeyboardEvent('keydown', {
    key: 'Tab',
    shiftKey: true,
  }) as any;
  const editor = createPlateEditor({
    editor: input,
    plugins: [createListPlugin({ options: { enableResetOnShiftTab: true } })],
  });

  onKeyDownList(editor, getPlugin<HotkeyPlugin>(editor, 'list'))(event as any);
  expect(editor.children).toEqual(output.children);
});

it('should convert top-level (last) list item into body upon unindent if enableResetOnShiftTab is true', () => {
  const input = (
    <editor>
      <hul>
        <hli>
          <hlic>E1</hlic>
        </hli>
        <hli>
          <hlic>E2</hlic>
        </hli>
        <hli>
          <hlic>
            <cursor />
            E3
          </hlic>
        </hli>
      </hul>
    </editor>
  ) as any;

  const output = (
    <editor>
      <hul>
        <hli>
          <hlic>E1</hlic>
        </hli>
        <hli>
          <hlic>E2</hlic>
        </hli>
      </hul>
      <hp>
        <htext>E3</htext>
      </hp>
    </editor>
  ) as any;

  const event = new KeyboardEvent('keydown', {
    key: 'Tab',
    shiftKey: true,
  }) as any;
  const editor = createPlateEditor({
    editor: input,
    plugins: [createListPlugin({ options: { enableResetOnShiftTab: true } })],
  });

  onKeyDownList(editor, getPlugin<HotkeyPlugin>(editor, 'list'))(event as any);
  expect(editor.children).toEqual(output.children);
});

it('should NOT convert top-level list item into body upon unindent if enableResetOnShiftTab is false', () => {
  const input = (
    <editor>
      <hul>
        <hli>
          <hlic>E1</hlic>
        </hli>
        <hli>
          <hlic>
            <cursor />
            E2
          </hlic>
        </hli>
        <hli>
          <hlic>E3</hlic>
        </hli>
      </hul>
    </editor>
  ) as any;

  const output = (
    <editor>
      <hul>
        <hli>
          <hlic>E1</hlic>
        </hli>
        <hli>
          <hlic>
            <cursor />
            E2
          </hlic>
        </hli>
        <hli>
          <hlic>E3</hlic>
        </hli>
      </hul>
    </editor>
  ) as any;

  const event = new KeyboardEvent('keydown', {
    key: 'Tab',
    shiftKey: true,
  }) as any;
  const editor = createPlateEditor({
    editor: input,
    plugins: [createListPlugin()],
  });

  onKeyDownList(editor, getPlugin<HotkeyPlugin>(editor, 'list'))(event as any);
  expect(editor.children).toEqual(output.children);
});
