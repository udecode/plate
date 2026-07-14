/** @jsx jsxt */

import { createBaseEditor } from '@platejs/core';

import { jsxt, type TestEditor } from '@platejs/test-utils';

import { BaseListPlugin } from '../BaseListPlugin';
import { unwrapList } from './unwrapList';

jsxt;

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
    ) as TestEditor;

    const output = (
      <editor>
        <hp>1</hp>
        <hp>11</hp>
        <hp>12</hp>
      </editor>
    ) as TestEditor;

    const editor = createBaseEditor({
      plugins: [BaseListPlugin],
      selection: input.selection,
      value: input.children,
    });

    editor.update((tx) => {
      unwrapList(editor, tx);
    });

    expect(editor.read.children()).toEqual(output.children);
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
    ) as TestEditor;

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
    ) as TestEditor;

    const editor = createBaseEditor({
      plugins: [BaseListPlugin],
      selection: input.selection,
      value: input.children,
    });

    editor.update((tx) => {
      unwrapList(editor, tx);
    });

    expect(editor.read.children()).toEqual(output.children);
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
    ) as TestEditor;

    const output = (
      <editor>
        <hp>1</hp>
        <hp>11</hp>
        <hp>2</hp>
      </editor>
    ) as TestEditor;

    const editor = createBaseEditor({
      plugins: [BaseListPlugin],
      selection: input.selection,
      value: input.children,
    });

    editor.update((tx) => {
      unwrapList(editor, tx);
    });

    expect(editor.read.children()).toEqual(output.children);
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
    ) as TestEditor;

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
    ) as TestEditor;

    const editor = createBaseEditor({
      plugins: [BaseListPlugin],
      selection: input.selection,
      value: input.children,
    });

    editor.update((tx) => {
      unwrapList(editor, tx);
    });

    expect(editor.read.children()).toEqual(output.children);
  });
});
