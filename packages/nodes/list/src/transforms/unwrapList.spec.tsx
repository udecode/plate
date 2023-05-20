/** @jsx jsx */

import { PlateEditor } from '@udecode/plate-common';
import { jsx } from '@udecode/plate-test-utils';
import { createPlateUIEditor } from 'examples/apps/next/src/lib/createPlateUIEditor';
import { createListPlugin } from '../createListPlugin';
import { unwrapList } from './unwrapList';

jsx;

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
    ) as any as PlateEditor;

    const output = (
      <editor>
        <hp>1</hp>
        <hp>11</hp>
        <hp>12</hp>
      </editor>
    ) as any as PlateEditor;

    const editor = createPlateUIEditor({
      editor: input,
      plugins: [createListPlugin()],
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
    ) as any as PlateEditor;

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
    ) as any as PlateEditor;

    const editor = createPlateUIEditor({
      editor: input,
      plugins: [createListPlugin()],
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
    ) as any as PlateEditor;

    const output = (
      <editor>
        <hp>1</hp>
        <hp>11</hp>
        <hp>2</hp>
      </editor>
    ) as any as PlateEditor;

    const editor = createPlateUIEditor({
      editor: input,
      plugins: [createListPlugin()],
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
    ) as any as PlateEditor;

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
    ) as any as PlateEditor;

    const editor = createPlateUIEditor({
      editor: input,
      plugins: [createListPlugin()],
    });

    unwrapList(editor);

    expect(input.children).toEqual(output.children);
  });
});
