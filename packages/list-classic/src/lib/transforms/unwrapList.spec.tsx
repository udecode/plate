/** @jsx jsxt */

import type { BasePlateEditor } from '@platejs/core';
import { createListClassicTestEditor as createBasePlateEditor } from '../__tests__/createListClassicTestEditor';

import { jsxt } from '@platejs/test-utils';

import { BaseListPlugin } from '../BaseListPlugin';
import { unwrapList } from './unwrapList';

jsxt;

afterEach(() => {
  mock.restore();
});

describe('li list unwrapping', () => {
  it('unwrap a nested list ul > single li', () => {
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
    ) as any as BasePlateEditor;

    const output = (
      <editor>
        <hp>1</hp>
        <hp>11</hp>
        <hp>12</hp>
      </editor>
    ) as any as BasePlateEditor;

    const editor = createBasePlateEditor({
      plugins: [BaseListPlugin],
      selection: input.selection,
      value: input.children,
    });

    unwrapList(editor);

    expect(editor.children).toEqual(output.children);
  });

  it('unwrap a nested list ul > single li, collapsed selection', () => {
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
    ) as any as BasePlateEditor;

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
    ) as any as BasePlateEditor;

    const editor = createBasePlateEditor({
      plugins: [BaseListPlugin],
      selection: input.selection,
      value: input.children,
    });

    unwrapList(editor);

    expect(editor.children).toEqual(output.children);
  });

  it('unwrap a nested list ul > multiple li', () => {
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
    ) as any as BasePlateEditor;

    const output = (
      <editor>
        <hp>1</hp>
        <hp>11</hp>
        <hp>2</hp>
      </editor>
    ) as any as BasePlateEditor;

    const editor = createBasePlateEditor({
      plugins: [BaseListPlugin],
      selection: input.selection,
      value: input.children,
    });

    unwrapList(editor);

    expect(editor.children).toEqual(output.children);
  });

  it('unwrap a nested list ul > multiple li, collapsed selection', () => {
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
    ) as any as BasePlateEditor;

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
    ) as any as BasePlateEditor;

    const editor = createBasePlateEditor({
      plugins: [BaseListPlugin],
      selection: input.selection,
      value: input.children,
    });

    unwrapList(editor);

    expect(editor.children).toEqual(output.children);
  });

  it('treats the selection common node as a list root when there is no direct ancestor match', () => {
    let editor: any;
    const node = mock(() => {
      editor.selection = null;

      return [{ children: [], type: 'ul' } as any, [0]];
    });
    const unwrapNodes = mock();

    editor = {
      api: {
        above: mock(() => {}),
        node,
      },
      getType: (key: string) => key,
      selection: {
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 1] },
      },
      update: (fn: any) =>
        fn({
          nodes: { unwrap: unwrapNodes },
          withoutNormalizing: (callback: () => void) => callback(),
        }),
    } as any;

    unwrapList(editor);

    expect(node).toHaveBeenCalledWith([0]);
    expect(unwrapNodes).toHaveBeenCalledTimes(4);
  });
});
