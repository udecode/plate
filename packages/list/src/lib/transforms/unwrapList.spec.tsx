/** @jsx jsxt */

import type { SlateEditor } from '@udecode/plate-common';

import { createPlateEditor } from '@udecode/plate-common/react';
import { jsxt } from '@udecode/plate-test-utils';

import { ListPlugin } from '../../react';
import { unwrapList } from './unwrapList';

jsxt;

describe('li list unwrapping', () => {
  it('should unwrap a nested list ul > single li', () => {
    const input = (
      <editor>
        <hul>
          <hli>
            <hlic>
              <anchor />1
            </hlic>
            <hul>
              <hli>
                <hlic>11</hlic>
                <hlic>
                  12
                  <focus />
                </hlic>
              </hli>
            </hul>
          </hli>
        </hul>
      </editor>
    ) as any as SlateEditor;

    const output = (
      <editor>
        <hp>1</hp>
        <hp>11</hp>
        <hp>12</hp>
      </editor>
    ) as any as SlateEditor;

    const editor = createPlateEditor({
      editor: input,
      plugins: [ListPlugin],
    });

    unwrapList(editor);

    expect(input.children).toEqual(output.children);
  });

  it('should unwrap a nested list ul > single li, collapsed selection', () => {
    const input = (
      <editor>
        <hul>
          <hli>
            <hlic>
              <cursor />1
            </hlic>
          </hli>
          <hli>
            <hlic>2</hlic>
          </hli>
        </hul>
      </editor>
    ) as any as SlateEditor;

    const output = (
      <editor>
        <hp>1</hp>
        <hul>
          <hli>
            <hlic>
              <cursor />2
            </hlic>
          </hli>
        </hul>
      </editor>
    ) as any as SlateEditor;

    const editor = createPlateEditor({
      editor: input,
      plugins: [ListPlugin],
    });

    unwrapList(editor);

    expect(input.children).toEqual(output.children);
  });

  it('should unwrap a nested list ul > multiple li', () => {
    const input = (
      <editor>
        <hul>
          <hli>
            <hlic>
              <anchor />1
            </hlic>
            <hul>
              <hli>
                <hlic>11</hlic>
              </hli>
            </hul>
          </hli>
          <hli>
            <hlic>
              2
              <focus />
            </hlic>
          </hli>
        </hul>
      </editor>
    ) as any as SlateEditor;

    const output = (
      <editor>
        <hp>1</hp>
        <hp>11</hp>
        <hp>2</hp>
      </editor>
    ) as any as SlateEditor;

    const editor = createPlateEditor({
      editor: input,
      plugins: [ListPlugin],
    });

    unwrapList(editor);

    expect(input.children).toEqual(output.children);
  });

  it('should unwrap a nested list ul > multiple li, collapsed selection', () => {
    const input = (
      <editor>
        <hul>
          <hli>
            <hlic>
              <cursor />1
            </hlic>
            <hul>
              <hli>
                <hlic>11</hlic>
              </hli>
            </hul>
          </hli>
          <hli>
            <hlic>2</hlic>
          </hli>
        </hul>
      </editor>
    ) as any as SlateEditor;

    const output = (
      <editor>
        <hp>1</hp>
        <hul>
          <hli>
            <hlic>
              <cursor />
              11
            </hlic>
          </hli>
          <hli>
            <hlic>2</hlic>
          </hli>
        </hul>
      </editor>
    ) as any as SlateEditor;

    const editor = createPlateEditor({
      editor: input,
      plugins: [ListPlugin],
    });

    unwrapList(editor);

    expect(input.children).toEqual(output.children);
  });
});
