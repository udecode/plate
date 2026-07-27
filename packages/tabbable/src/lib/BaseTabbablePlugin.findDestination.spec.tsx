/** @jsx jsxt */

import { createBaseEditor, createBasePlugin } from '@platejs/core';
import { jsxt, type TestEditor } from '@platejs/test-utils';
import { type Node, type Path } from '@platejs/plite';

import type { TabbableEntry } from './types';

import { BaseTabbablePlugin } from './BaseTabbablePlugin';

jsxt;

const MyVoidPlugin = createBasePlugin({
  key: 'my-void',
  schema: {
    element: {
      void: 'block',
    },
  },
});

describe('BaseTabbablePlugin.read.findDestination', () => {
  const input = (
    <editor>
      <hp>Line 1</hp>
      <element type="my-void">
        <htext />
      </element>
      <hp>Line 2</hp>
      <hp>Line 3</hp>
      <element type="my-void">
        <htext />
        <cursor />
      </element>
      <element type="my-void">
        <htext />
      </element>
      <hp>Line 4</hp>
    </editor>
  ) as TestEditor;
  const editor = createBaseEditor({
    plugins: [MyVoidPlugin, BaseTabbablePlugin],
    selection: input.selection,
    initialValue: input.children,
  });

  const getNode = (path: Path): Node => {
    const node = editor.read.nodes.get(path);

    if (!node) throw new Error(`Missing node at ${path.join('.')}`);

    return node[0];
  };

  const voidPath1 = [1];
  const voidPath2 = [4];
  const voidPath3 = [5];
  const entry1: TabbableEntry = {
    domNode: document.createElement('div'),
    path: voidPath1,
    slateNode: getNode(voidPath1),
  };
  const entry2a: TabbableEntry = {
    domNode: document.createElement('div'),
    path: voidPath2,
    slateNode: getNode(voidPath2),
  };
  const entry2b: TabbableEntry = {
    domNode: document.createElement('div'),
    path: voidPath2,
    slateNode: getNode(voidPath2),
  };
  const entry3: TabbableEntry = {
    domNode: document.createElement('div'),
    path: voidPath3,
    slateNode: getNode(voidPath3),
  };
  const tabbableEntries = [entry1, entry2a, entry2b, entry3];

  it('focuses the next DOM node at the same path', () => {
    expect(
      editor.plugin(BaseTabbablePlugin).read.findDestination({
        activeTabbableEntry: entry2a,
        direction: 'forward',
        tabbableEntries,
      })
    ).toEqual({ domNode: entry2b.domNode, type: 'dom-node' });
  });

  it('returns to the active path when moving backward from its first DOM node', () => {
    expect(
      editor.plugin(BaseTabbablePlugin).read.findDestination({
        activeTabbableEntry: entry2a,
        direction: 'backward',
        tabbableEntries,
      })
    ).toEqual({ path: [4, 0], type: 'path' });
  });

  it('returns to the next editor path after the final DOM node at a path', () => {
    expect(
      editor.plugin(BaseTabbablePlugin).read.findDestination({
        activeTabbableEntry: entry2b,
        direction: 'forward',
        tabbableEntries,
      })
    ).toEqual({ path: [5, 0], type: 'path' });
  });

  it('focuses the previous DOM node at the same path', () => {
    expect(
      editor.plugin(BaseTabbablePlugin).read.findDestination({
        activeTabbableEntry: entry2b,
        direction: 'backward',
        tabbableEntries,
      })
    ).toEqual({ domNode: entry2a.domNode, type: 'dom-node' });
  });

  const createEditorAt = (path: Path) =>
    createBaseEditor({
      plugins: [MyVoidPlugin, BaseTabbablePlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 0, path },
        focus: { offset: 0, path },
      },
      initialValue: input.children,
    });

  it('focuses the next tabbable after the selection', () => {
    expect(
      createEditorAt([2, 0]).plugin(BaseTabbablePlugin).read.findDestination({
        activeTabbableEntry: null,
        direction: 'forward',
        tabbableEntries,
      })
    ).toEqual({ domNode: entry2a.domNode, type: 'dom-node' });
  });

  it('focuses the previous tabbable before the selection', () => {
    expect(
      createEditorAt([2, 0]).plugin(BaseTabbablePlugin).read.findDestination({
        activeTabbableEntry: null,
        direction: 'backward',
        tabbableEntries,
      })
    ).toEqual({ domNode: entry1.domNode, type: 'dom-node' });
  });

  it('returns null before the first tabbable when moving backward', () => {
    expect(
      createEditorAt([0, 0]).plugin(BaseTabbablePlugin).read.findDestination({
        activeTabbableEntry: null,
        direction: 'backward',
        tabbableEntries,
      })
    ).toBeNull();
  });

  it('returns null after the last tabbable when moving forward', () => {
    expect(
      createEditorAt([6, 0]).plugin(BaseTabbablePlugin).read.findDestination({
        activeTabbableEntry: null,
        direction: 'forward',
        tabbableEntries,
      })
    ).toBeNull();
  });
});
