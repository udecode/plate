/** @jsx jsxt */

import { createBaseEditor, createBasePlugin } from '@platejs/core';
import { schema } from '@platejs/plite';

import { jsxt, type TestEditor } from '@platejs/test-utils';

import { BaseListPlugin } from './BaseListPlugin';

jsxt;

const createListEditor = (input: TestEditor) =>
  createBaseEditor({
    plugins: [BaseListPlugin],
    selection: input.selection,
    initialValue: input.children,
  });

describe('withDeleteFragmentList', () => {
  it('falls back to normal deleteFragment when the selection is not across list items', () => {
    const input = (
      <editor>
        <hp>
          a<anchor />
          bc
          <focus />d
        </hp>
      </editor>
    ) as TestEditor;
    const expected = (
      <editor>
        <hp>ad</hp>
      </editor>
    ) as TestEditor;

    const editor = createListEditor(input);

    editor.update.fragment.delete();

    expect(editor.read.children()).toEqual(expected.children);
  });

  it('uses an explicit named-root target instead of the ambient list selection', () => {
    const input = (
      <editor>
        <hul>
          <hli>
            <hlic>
              one
              <anchor />
            </hlic>
          </hli>
          <hli>
            <hlic>
              <focus />
              two
            </hlic>
          </hli>
        </hul>
      </editor>
    ) as TestEditor;
    const targetRoot = 'list-explicit-target';
    const rootOwner = {
      childRoots: { body: targetRoot },
      children: [{ text: '' }],
      type: 'list-test-root-owner',
    };
    const RootOwnerPlugin = createBasePlugin({
      key: 'list-test-root-owner',
      schema: {
        element: {
          content: schema.content.text({ default: 'text', min: 1 }),
          contentRoots: {
            body: schema.content.type('p', { min: 1 }),
          },
        },
      },
      type: 'list-test-root-owner',
    });
    const editor = createBaseEditor({
      plugins: [BaseListPlugin, RootOwnerPlugin],
      selection: input.selection,
      initialValue: input.children,
    });
    editor.update((tx) => {
      tx.nodes.insert(rootOwner, { at: [1] });
      tx.roots.create(targetRoot, [
        { children: [{ text: 'target' }], type: 'p' },
      ]);
    });
    editor.update.fragment.delete({
      at: {
        anchor: { offset: 1, path: [0, 0], root: targetRoot },
        focus: { offset: 4, path: [0, 0], root: targetRoot },
      },
    });

    expect(editor.read.children()).toEqual([...input.children, rootOwner]);
    expect(editor.read.root(targetRoot)).toEqual([
      { children: [{ text: 'tet' }], type: 'p' },
    ]);
  });

  it('merges sibling list items and removes the emptied end item', () => {
    const input = (
      <editor>
        <hul>
          <hli>
            <hlic>
              one
              <anchor />
            </hlic>
          </hli>
          <hli>
            <hlic>
              <focus />
              two
            </hlic>
          </hli>
          <hli>
            <hlic>three</hlic>
          </hli>
        </hul>
      </editor>
    ) as TestEditor;
    const expected = (
      <editor>
        <hul>
          <hli>
            <hlic>onetwo</hlic>
          </hli>
          <hli>
            <hlic>three</hlic>
          </hli>
        </hul>
      </editor>
    ) as TestEditor;

    const editor = createListEditor(input);

    editor.update.fragment.delete();

    expect(editor.read.children()).toEqual(expected.children);
  });

  it('removes only the emptied nested list when the outer start list is protected', () => {
    const input = (
      <editor>
        <hul>
          <hli>
            <hlic>
              one
              <anchor />
            </hlic>
            <hul>
              <hli>
                <hlic>
                  <focus />
                  two
                </hlic>
              </hli>
            </hul>
          </hli>
          <hli>
            <hlic>three</hlic>
          </hli>
        </hul>
      </editor>
    ) as TestEditor;
    const expected = (
      <editor>
        <hul>
          <hli>
            <hlic>onetwo</hlic>
          </hli>
          <hli>
            <hlic>three</hlic>
          </hli>
        </hul>
      </editor>
    ) as TestEditor;

    const editor = createListEditor(input);

    editor.update.fragment.delete();

    expect(editor.read.children()).toEqual(expected.children);
  });
});
