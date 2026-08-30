/** @jsx jsxt */

import { jsxt, type TestEditor } from '#platejs-test-internal';

import type { Node, Path } from '../../core';
import { createEditor, definePlatePlugin } from '../../react/core';
import type { TabbableEntry } from '../lib/TabbablePluginTypes';
import { createTabIndexRestorationQueue } from './TabbableEffects.internal';
import { TabbablePlugin } from './TabbablePlugin';

jsxt;

describe('tabindex restoration', () => {
  it('preserves a missing attribute when restoration is rescheduled', async () => {
    const button = document.createElement('button');
    const queue = createTabIndexRestorationQueue();

    queue.defer(button);
    queue.defer(button);

    await new Promise<void>((resolve) => {
      setTimeout(resolve, 5);
    });

    expect(button.hasAttribute('tabindex')).toBe(false);
  });

  it('preserves the original value when restoration is rescheduled', async () => {
    const button = document.createElement('button');
    const queue = createTabIndexRestorationQueue();

    button.setAttribute('tabindex', '0');
    queue.defer(button);
    queue.defer(button);

    await new Promise<void>((resolve) => {
      setTimeout(resolve, 5);
    });

    expect(button.getAttribute('tabindex')).toBe('0');
  });
});

const VoidPlugin = definePlatePlugin('void', {
  schema: {
    element: {
      void: 'block',
    },
  },
});

describe('TabbablePlugin', () => {
  it('ships the default options and delegates tabbable checks to the schema', () => {
    const editor = createEditor({
      plugins: [VoidPlugin, TabbablePlugin],
      initialValue: [
        { children: [{ text: '' }], type: 'void' },
        { children: [{ text: 'a' }], type: 'paragraph' },
      ],
    });
    const plugin = editor.plugin(TabbablePlugin);
    const voidEntry = editor.read.nodes.get([0]);
    const textEntry = editor.read.nodes.get([1, 0]);
    const { insertTabbableEntries, isTabbable, query } = plugin.initialState;

    if (
      !voidEntry ||
      !textEntry ||
      !insertTabbableEntries ||
      !isTabbable ||
      !query
    ) {
      throw new Error('Missing required tabbable fixture state');
    }

    const createEntry = (slateNode: TabbableEntry['slateNode']) => ({
      domNode: document.createElement('div'),
      path: [0],
      slateNode,
    });
    const event = new KeyboardEvent('keydown', { key: 'Tab' });

    expect(plugin.initialState.globalEventListener).toBe(false);
    expect(insertTabbableEntries(event)).toEqual([]);
    expect(query(event)).toBe(true);
    expect(isTabbable(createEntry(voidEntry[0]))).toBe(true);
    expect(isTabbable(createEntry(textEntry[0]))).toBe(false);
  });
});

describe('TabbablePlugin.read.findDestination', () => {
  const input = (
    <editor>
      <hp>Line 1</hp>
      <element type="void">
        <htext />
      </element>
      <hp>Line 2</hp>
      <hp>Line 3</hp>
      <element type="void">
        <htext />
        <cursor />
      </element>
      <element type="void">
        <htext />
      </element>
      <hp>Line 4</hp>
    </editor>
  ) as TestEditor;
  const editor = createEditor({
    plugins: [VoidPlugin, TabbablePlugin],
    selection: input.selection,
    initialValue: input.children,
  });
  const getNode = (path: Path): Node => {
    const node = editor.read.nodes.get(path);

    if (!node) throw new Error(`Missing node at ${path.join('.')}`);

    return node[0];
  };
  const entry1: TabbableEntry = {
    domNode: document.createElement('div'),
    path: [1],
    slateNode: getNode([1]),
  };
  const entry2a: TabbableEntry = {
    domNode: document.createElement('div'),
    path: [4],
    slateNode: getNode([4]),
  };
  const entry2b: TabbableEntry = {
    domNode: document.createElement('div'),
    path: [4],
    slateNode: getNode([4]),
  };
  const entry3: TabbableEntry = {
    domNode: document.createElement('div'),
    path: [5],
    slateNode: getNode([5]),
  };
  const tabbableEntries = [entry1, entry2a, entry2b, entry3];
  const createEditorAt = (path: Path) =>
    createEditor({
      plugins: [VoidPlugin, TabbablePlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 0, path },
        focus: { offset: 0, path },
      },
      initialValue: input.children,
    });

  it('focuses the next DOM node at the same path', () => {
    expect(
      editor.plugin(TabbablePlugin).read.findDestination({
        activeTabbableEntry: entry2a,
        direction: 'forward',
        tabbableEntries,
      })
    ).toEqual({ domNode: entry2b.domNode, type: 'dom-node' });
  });

  it('returns to the active path when moving backward from its first DOM node', () => {
    expect(
      editor.plugin(TabbablePlugin).read.findDestination({
        activeTabbableEntry: entry2a,
        direction: 'backward',
        tabbableEntries,
      })
    ).toEqual({ path: [4, 0], type: 'path' });
  });

  it('returns to the next editor path after the final DOM node at a path', () => {
    expect(
      editor.plugin(TabbablePlugin).read.findDestination({
        activeTabbableEntry: entry2b,
        direction: 'forward',
        tabbableEntries,
      })
    ).toEqual({ path: [5, 0], type: 'path' });
  });

  it('focuses the previous DOM node at the same path', () => {
    expect(
      editor.plugin(TabbablePlugin).read.findDestination({
        activeTabbableEntry: entry2b,
        direction: 'backward',
        tabbableEntries,
      })
    ).toEqual({ domNode: entry2a.domNode, type: 'dom-node' });
  });

  it('focuses the next tabbable after the selection', () => {
    expect(
      createEditorAt([2, 0]).plugin(TabbablePlugin).read.findDestination({
        activeTabbableEntry: null,
        direction: 'forward',
        tabbableEntries,
      })
    ).toEqual({ domNode: entry2a.domNode, type: 'dom-node' });
  });

  it('focuses the previous tabbable before the selection', () => {
    expect(
      createEditorAt([2, 0]).plugin(TabbablePlugin).read.findDestination({
        activeTabbableEntry: null,
        direction: 'backward',
        tabbableEntries,
      })
    ).toEqual({ domNode: entry1.domNode, type: 'dom-node' });
  });

  it('returns null before the first tabbable when moving backward', () => {
    expect(
      createEditorAt([0, 0]).plugin(TabbablePlugin).read.findDestination({
        activeTabbableEntry: null,
        direction: 'backward',
        tabbableEntries,
      })
    ).toBeNull();
  });

  it('returns null after the last tabbable when moving forward', () => {
    expect(
      createEditorAt([6, 0]).plugin(TabbablePlugin).read.findDestination({
        activeTabbableEntry: null,
        direction: 'forward',
        tabbableEntries,
      })
    ).toBeNull();
  });
});
