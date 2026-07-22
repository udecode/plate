/** @jsx jsxt */

import { createBaseEditor } from '@platejs/core';

import { jsxt } from '@platejs/test-utils';

import { BaseListPlugin } from './BaseListPlugin';

jsxt;

/*
input:
1. E1
2. |E2

output:
1. E1
  1. |E2
*/
it('indent single list item (start of item)', () => {
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

  const editor = createBaseEditor({
    plugins: [BaseListPlugin],
    selection: input.selection,
    initialValue: input.children,
  });

  editor.plugin(BaseListPlugin).update.tab();
  expect(editor.read.children()).toEqual(output.children);
});

/*
input:
1. E1
2. E2|

output:
1. E1
  1. E2|
*/
it('indent single list item (end of item)', () => {
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

  const editor = createBaseEditor({
    plugins: [BaseListPlugin],
    selection: input.selection,
    initialValue: input.children,
  });

  editor.plugin(BaseListPlugin).update.tab();
  expect(editor.read.children()).toEqual(output.children);
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
it('indent multiple list items (start/end)', () => {
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

  const editor = createBaseEditor({
    plugins: [BaseListPlugin],
    selection: input.selection,
    initialValue: input.children,
  });

  editor.plugin(BaseListPlugin).update.tab();
  expect(editor.read.children()).toEqual(output.children);
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
it('un-indent multiple list items (start/end)', () => {
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

  const editor = createBaseEditor({
    plugins: [BaseListPlugin],
    selection: input.selection,
    initialValue: input.children,
  });

  editor.plugin(BaseListPlugin).update.untab();
  expect(editor.read.children()).toEqual(output.children);
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
it('un-indent multiple list items (start/out)', () => {
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

  const editor = createBaseEditor({
    plugins: [BaseListPlugin],
    selection: input.selection,
    initialValue: input.children,
  });

  editor.plugin(BaseListPlugin).update.untab();
  expect(editor.read.children()).toEqual(output.children);
});

it('unhang before indentation', () => {
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

  const editor = createBaseEditor({
    plugins: [BaseListPlugin],
    selection: input.selection,
    initialValue: input.children,
  });

  editor.plugin(BaseListPlugin).update.tab();
  expect(editor.read.children()).toEqual(output.children);
});

it('does not not adjust selection length when unhanging ranges', () => {
  const input = (
    <editor>
      <hp>
        Some Text <anchor />
        More Text
        <focus />
      </hp>
    </editor>
  ) as any;
  const editor = createBaseEditor({
    plugins: [BaseListPlugin],
    selection: input.selection,
    initialValue: input.children,
  });

  const selectionBefore = editor.read.selection();

  editor.plugin(BaseListPlugin).update.tab();
  expect(editor.read.selection()).toEqual(selectionBefore);

  // Do the same with shift tab.
  editor.plugin(BaseListPlugin).update.untab();
  expect(editor.read.selection()).toEqual(selectionBefore);
});

it('convert top-level list item into body upon unindent if enableResetOnShiftTab is true', () => {
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

  const editor = createBaseEditor({
    plugins: [
      BaseListPlugin.configure({ options: { enableResetOnShiftTab: true } }),
    ],
    selection: input.selection,
    initialValue: input.children,
  });

  editor.plugin(BaseListPlugin).update.untab();
  expect(editor.read.children()).toEqual(output.children);
});

it('convert top-level (first) list item into body upon unindent if enableResetOnShiftTab is true', () => {
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

  const editor = createBaseEditor({
    plugins: [
      BaseListPlugin.configure({ options: { enableResetOnShiftTab: true } }),
    ],
    selection: input.selection,
    initialValue: input.children,
  });

  editor.plugin(BaseListPlugin).update.untab();
  expect(editor.read.children()).toEqual(output.children);
});

it('convert top-level (last) list item into body upon unindent if enableResetOnShiftTab is true', () => {
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

  const editor = createBaseEditor({
    plugins: [
      BaseListPlugin.configure({ options: { enableResetOnShiftTab: true } }),
    ],
    selection: input.selection,
    initialValue: input.children,
  });

  editor.plugin(BaseListPlugin).update.untab();
  expect(editor.read.children()).toEqual(output.children);
});

it('does not convert top-level list item into body upon unindent if enableResetOnShiftTab is false', () => {
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

  const editor = createBaseEditor({
    plugins: [BaseListPlugin],
    selection: input.selection,
    initialValue: input.children,
  });

  editor.plugin(BaseListPlugin).update.untab();
  expect(editor.read.children()).toEqual(output.children);
});
