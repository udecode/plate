/** @jsx jsxt */

import { jsxt } from '@platejs/test-utils';
import type { Element, NodeEntry } from '@platejs/plite';
import { type BasePlateEditor, createBasePlateEditor } from 'platejs';

import { getSiblingListStyleType } from './getSiblingListStyleType';

jsxt;

describe('getSiblingListStyleType', () => {
  it('returns the first sibling style at the requested indent', () => {
    const input = (
      <editor>
        <hp indent={1} listStyleType="decimal">
          1
        </hp>
        <hp indent={2} listStyleType="disc">
          1.1
        </hp>
        <hp indent={2} listStyleType="disc">
          1.2
          <cursor />
        </hp>
        <hp indent={1} listStyleType="circle">
          2
        </hp>
      </editor>
    ) as any as BasePlateEditor;

    const editor = createBasePlateEditor({
      selection: input.selection,
      value: input.children,
    });
    const entry = editor.api.block() as NodeEntry<Element> | undefined;

    expect(
      getSiblingListStyleType(editor, {
        entry: entry!,
        indent: 1,
      })
    ).toBe('decimal');
  });

  it('falls back to the entry style when no sibling matches the requested indent', () => {
    const input = (
      <editor>
        <hp indent={2} listStyleType="disc">
          1
        </hp>
        <hp indent={2} listStyleType="disc">
          2
          <cursor />
        </hp>
        <hp indent={3} listStyleType="circle">
          2.1
        </hp>
      </editor>
    ) as any as BasePlateEditor;

    const editor = createBasePlateEditor({
      selection: input.selection,
      value: input.children,
    });
    const entry = editor.api.block() as NodeEntry<Element> | undefined;

    expect(
      getSiblingListStyleType(editor, {
        entry: entry!,
        indent: 1,
      })
    ).toBe('disc');
  });
});
