import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  ContentSlice,
  createEditor,
  defineEditorSchema,
  defineExtension,
  defineStateField,
  type Descendant,
  type ElementIn,
  NodeApi,
  type NodeEntry,
  schema,
  type ValueOf,
  valueCodecs,
} from '@platejs/plite';

const paragraph = (text: string) => ({
  children: [{ text }],
  type: 'paragraph' as const,
});

const portal = (type: 'exclusive-portal' | 'shared-portal', root: string) => ({
  childRoots: { body: root },
  children: [{ text: '' }],
  type,
});

const ContentRootSchema = defineEditorSchema('schema:content-root-lifecycle', {
  elements: {
    'exclusive-portal': {
      content: schema.content.text({ default: 'text', min: 1 }),
      contentRoots: {
        body: {
          content: schema.content.type('paragraph', {
            default: { type: 'paragraph' },
            min: 1,
          }),
          ownership: 'exclusive',
        },
      },
    },
    paragraph: {
      content: schema.content.text({ default: 'text', min: 1 }),
    },
    'shared-portal': {
      content: schema.content.text({ default: 'text', min: 1 }),
      contentRoots: {
        body: {
          content: schema.content.type('paragraph', {
            default: { type: 'paragraph' },
            min: 1,
          }),
          ownership: 'shared',
        },
      },
    },
  },
  id: 'content-root-lifecycle',
  root: schema.content.types(
    ['exclusive-portal', 'paragraph', 'shared-portal'],
    { default: { type: 'paragraph' }, min: 1 }
  ),
  unknown: 'reject',
  version: 1,
});

const createContentRootEditor = (
  children: Descendant[],
  roots: Record<string, Descendant[]>
) =>
  createEditor({
    extensions: [ContentRootSchema],
    initialValue: { children, roots },
  });

describe('element-owned root lifecycle', () => {
  it('rejects multiple owners for one exclusive root', () => {
    assert.throws(
      () =>
        createContentRootEditor(
          [
            portal('exclusive-portal', 'exclusive:1'),
            portal('exclusive-portal', 'exclusive:1'),
          ],
          { 'exclusive:1': [paragraph('caption')] }
        ),
      /exclusive.*exactly one owner/i
    );
  });

  it('cascades an unreferenced exclusive root but preserves shared roots', () => {
    const exclusive = createContentRootEditor(
      [paragraph('body'), portal('exclusive-portal', 'exclusive:1')],
      { 'exclusive:1': [paragraph('caption')] }
    );

    exclusive.update((tx) => tx.nodes.remove({ at: [1] }));

    assert.deepEqual(
      exclusive.read((state) => state.value()),
      {
        children: [paragraph('body')],
      }
    );

    const shared = createContentRootEditor(
      [
        paragraph('body'),
        portal('shared-portal', 'shared:1'),
        portal('shared-portal', 'shared:1'),
      ],
      { 'shared:1': [paragraph('shared')] }
    );

    shared.update((tx) => tx.nodes.remove({ at: [1] }));

    assert.deepEqual(
      shared.read((state) => state.value()),
      {
        children: [paragraph('body'), portal('shared-portal', 'shared:1')],
        roots: { 'shared:1': [paragraph('shared')] },
      }
    );
  });

  it('preserves a root on move and clones it on duplicate', () => {
    const editor = createContentRootEditor(
      [paragraph('body'), portal('exclusive-portal', 'exclusive:1')],
      { 'exclusive:1': [paragraph('caption')] }
    );

    editor.update((tx) => tx.nodes.move({ at: [1], to: [0] }));

    assert.deepEqual(editor.read.root('exclusive:1'), [paragraph('caption')]);

    editor.update((tx) => {
      const entry = tx.nodes.get([0]);

      assert(entry && NodeApi.isElement(entry[0]));
      tx.nodes.duplicate([
        entry as NodeEntry<ElementIn<ValueOf<typeof editor>>>,
      ]);
    });

    assert.deepEqual(
      editor.read((state) => state.value()),
      {
        children: [
          portal('exclusive-portal', 'exclusive:1'),
          portal('exclusive-portal', 'exclusive:1:copy'),
          paragraph('body'),
        ],
        roots: {
          'exclusive:1': [paragraph('caption')],
          'exclusive:1:copy': [paragraph('caption')],
        },
      }
    );

    editor.update((tx) => {
      tx.text.insert('!', {
        at: { offset: 7, path: [0, 0], root: 'exclusive:1:copy' },
      });
    });

    assert.deepEqual(editor.read.root('exclusive:1'), [paragraph('caption')]);
    assert.deepEqual(editor.read.root('exclusive:1:copy'), [
      paragraph('caption!'),
    ]);
  });

  it('keeps shared aliases shared while cloning a duplicated group', () => {
    const editor = createContentRootEditor(
      [
        portal('shared-portal', 'shared:1'),
        portal('shared-portal', 'shared:1'),
        paragraph('body'),
      ],
      { 'shared:1': [paragraph('shared')] }
    );

    editor.update((tx) => {
      const first = tx.nodes.get([0]);
      const second = tx.nodes.get([1]);

      assert(
        first &&
          second &&
          NodeApi.isElement(first[0]) &&
          NodeApi.isElement(second[0])
      );
      tx.nodes.duplicate([
        first as NodeEntry<ElementIn<ValueOf<typeof editor>>>,
        second as NodeEntry<ElementIn<ValueOf<typeof editor>>>,
      ]);
    });

    assert.deepEqual(editor.read.children(), [
      portal('shared-portal', 'shared:1'),
      portal('shared-portal', 'shared:1'),
      portal('shared-portal', 'shared:1:copy'),
      portal('shared-portal', 'shared:1:copy'),
      paragraph('body'),
    ]);
    assert.deepEqual(editor.read.root('shared:1:copy'), [paragraph('shared')]);
  });

  it('creates an owner and its projected root atomically in either order', () => {
    for (const order of ['owner-first', 'root-first'] as const) {
      const editor = createContentRootEditor([paragraph('body')], {});

      editor.update((tx) => {
        const insertOwner = () =>
          tx.nodes.insert(portal('exclusive-portal', `exclusive:${order}`), {
            at: [1],
          });
        const createRoot = () =>
          tx.roots.create(`exclusive:${order}`, [paragraph(order)]);

        if (order === 'owner-first') {
          insertOwner();
          createRoot();
        } else {
          createRoot();
          insertOwner();
        }
      });

      assert.deepEqual(
        editor.read((state) => state.value()),
        {
          children: [
            paragraph('body'),
            portal('exclusive-portal', `exclusive:${order}`),
          ],
          roots: { [`exclusive:${order}`]: [paragraph(order)] },
        }
      );
    }
  });

  it('carries roots in a slice and remaps them on every insertion', () => {
    const editor = createContentRootEditor(
      [portal('exclusive-portal', 'exclusive:1'), paragraph('target')],
      { 'exclusive:1': [paragraph('caption')] }
    );
    const slice = editor.read.slice.get({
      at: {
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
      },
    });

    assert.deepEqual(slice.roots, {
      'exclusive:1': [paragraph('caption')],
    });

    editor.update((tx) => {
      tx.slice.replace(
        ContentSlice.fromJSON({
          ...slice,
          openEnd: 0,
          openStart: 0,
        }),
        { at: [2] }
      );
    });

    assert.deepEqual(editor.read.children(), [
      portal('exclusive-portal', 'exclusive:1'),
      paragraph('target'),
      portal('exclusive-portal', 'exclusive:1:copy'),
    ]);
    assert.deepEqual(editor.read.root('exclusive:1:copy'), [
      paragraph('caption'),
    ]);

    editor.update((tx) => {
      tx.slice.replace(
        ContentSlice.fromJSON({
          ...slice,
          openEnd: 0,
          openStart: 0,
        }),
        { at: [3] }
      );
    });

    assert.deepEqual(editor.read.children(), [
      portal('exclusive-portal', 'exclusive:1'),
      paragraph('target'),
      portal('exclusive-portal', 'exclusive:1:copy'),
      portal('exclusive-portal', 'exclusive:1:copy:2'),
    ]);
    assert.deepEqual(editor.read.root('exclusive:1:copy:2'), [
      paragraph('caption'),
    ]);
  });

  it('fits an owner-bearing root slice at a collapsed text target', () => {
    const editor = createContentRootEditor([paragraph('target')], {});
    const slice = ContentSlice.fromJSON({
      content: [portal('exclusive-portal', 'exclusive:detached')],
      openEnd: 0,
      openStart: 0,
      roots: { 'exclusive:detached': [paragraph('caption')] },
    });

    assert(
      editor.read.slice.fit(slice, {
        at: { offset: 0, path: [0, 0] },
      })
    );
  });

  it('rolls back an invalid root-bearing slice without partial publication', () => {
    const editor = createContentRootEditor([paragraph('target')], {});
    const before = editor.read((state) => state.value());
    const slice = ContentSlice.fromJSON({
      content: [
        portal('exclusive-portal', 'exclusive:invalid'),
        portal('exclusive-portal', 'exclusive:invalid'),
      ],
      openEnd: 0,
      openStart: 0,
      roots: { 'exclusive:invalid': [paragraph('caption')] },
    });
    let applied = true;

    editor.update((tx) => {
      applied = tx.slice.replace(slice, {
        at: { offset: 0, path: [0, 0] },
      });
    });

    assert.equal(applied, false);
    assert.deepEqual(
      editor.read((state) => state.value()),
      before
    );
  });

  it('captures a cut slice before deleting its owner and root atomically', () => {
    const editor = createContentRootEditor(
      [portal('exclusive-portal', 'exclusive:cut'), paragraph('body')],
      { 'exclusive:cut': [paragraph('caption')] }
    );
    const at = editor.read.ranges.get([0]);

    assert(at);
    const slice = editor.read.slice.get({ at });

    editor.update((tx) => tx.nodes.remove({ at: [0] }));

    assert.deepEqual(slice.roots, {
      'exclusive:cut': [paragraph('caption')],
    });
    assert.deepEqual(
      editor.read((state) => state.value()),
      {
        children: [paragraph('body')],
      }
    );
  });

  it('cascades on type change and root retargeting', () => {
    const editor = createContentRootEditor(
      [portal('exclusive-portal', 'exclusive:1'), paragraph('body')],
      { 'exclusive:1': [paragraph('caption')] }
    );

    editor.update((tx) => tx.nodes.set({ type: 'paragraph' }, { at: [0] }));

    assert.deepEqual(
      editor.read((state) => state.value()),
      {
        children: [paragraph(''), paragraph('body')],
      }
    );

    const retargeted = createContentRootEditor(
      [portal('exclusive-portal', 'exclusive:old'), paragraph('body')],
      { 'exclusive:old': [paragraph('old')] }
    );

    retargeted.update((tx) => {
      tx.roots.create('exclusive:new', [paragraph('new')]);
      tx.nodes.set({ childRoots: { body: 'exclusive:new' } }, { at: [0] });
    });

    assert.deepEqual(
      retargeted.read((state) => state.value()),
      {
        children: [
          portal('exclusive-portal', 'exclusive:new'),
          paragraph('body'),
        ],
        roots: { 'exclusive:new': [paragraph('new')] },
      }
    );
  });

  it('replaces children, roots, persisted meta, and selection atomically', () => {
    const title = defineStateField({
      initial: 'Untitled',
      key: 'document.title',
      persist: valueCodecs.string,
    });
    const editor = createEditor({
      extensions: [
        ContentRootSchema,
        defineExtension('document-title', { stateFields: [title] }),
      ],
      initialValue: {
        children: [portal('exclusive-portal', 'exclusive:old')],
        meta: { [title.key]: title.serialize('Old') },
        roots: { 'exclusive:old': [paragraph('old caption')] },
      },
    });

    editor.update.value.replace({
      children: [portal('exclusive-portal', 'exclusive:new')],
      meta: { [title.key]: title.serialize('New') },
      roots: { 'exclusive:new': [paragraph('new caption')] },
      selection: {
        anchor: {
          offset: 3,
          path: [0, 0],
          root: 'exclusive:new',
        },
        focus: {
          offset: 3,
          path: [0, 0],
          root: 'exclusive:new',
        },
        kind: 'text',
      },
    });

    assert.deepEqual(
      editor.read((state) => state.value()),
      {
        children: [portal('exclusive-portal', 'exclusive:new')],
        meta: { [title.key]: title.serialize('New') },
        roots: { 'exclusive:new': [paragraph('new caption')] },
      }
    );
    assert.equal(editor.read.getField(title), 'New');
    assert.deepEqual(editor.read.selection(), {
      anchor: { offset: 3, path: [0, 0], root: 'exclusive:new' },
      focus: { offset: 3, path: [0, 0], root: 'exclusive:new' },
      kind: 'text',
    });
  });
});
