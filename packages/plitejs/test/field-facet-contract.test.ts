import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  createEditor,
  defineCommand,
  defineExtension,
  defineExtensionSlot,
  defineFacet,
  defineStateField,
  NodeApi,
} from 'plitejs';

import { dispatchCommand } from '../src/internal';

const paragraph = (text: string) => ({
  children: [{ text }],
  type: 'paragraph',
});

describe('field-aware explicit facets', () => {
  it('installs a state field directly as its canonical extension', () => {
    const counter = defineStateField({
      initial: 1,
      key: 'direct-field-extension',
    });
    const editor = createEditor({ extensions: [counter] });

    assert.equal(counter.stateFields?.[0], counter);
    assert.equal(
      editor.read((state) => state.getField(counter)),
      1
    );
  });

  it('invalidates only declared field dependencies and suppresses equal transitions', () => {
    const counter = defineStateField({
      compare: (left, right) => left.count === right.count,
      initial: { count: 0 },
      key: 'facet-counter',
    });
    const unrelated = defineStateField({
      initial: 0,
      key: 'facet-unrelated',
    });
    const doubled = defineFacet<number>({ key: 'facet-counter-doubled' });
    let commits = 0;
    let computes = 0;
    const editor = createEditor({
      extensions: [
        defineExtension('field-derived-facet', {
          stateFields: [counter, unrelated],
          facetProviders: [
            doubled.compute(
              (state) => {
                computes += 1;

                return state.getField(counter).count * 2;
              },
              { dependencies: [counter] }
            ),
          ],
        }),
      ],
    });

    editor.subscribeCommit(() => (commits += 1) - 1);

    const initial = editor.read.facet(doubled);

    editor.update((tx) => tx.setField(unrelated, 1));
    assert.equal(editor.read.facet(doubled), initial);
    assert.equal(computes, 1);

    editor.update((tx) => tx.setField(counter, { count: 0 }));
    assert.equal(commits, 1);
    assert.equal(editor.read.facet(doubled), initial);
    assert.equal(computes, 1);

    editor.update((tx) => tx.setField(counter, { count: 2 }));
    assert.deepEqual(editor.read.facet(doubled), [4]);
    assert.equal(commits, 2);
    assert.equal(computes, 2);
  });

  it('preserves facet output identity when equality accepts a recomputation', () => {
    const counter = defineStateField({
      initial: 0,
      key: 'facet-equality-counter',
    });
    const parity = defineFacet<number, { even: boolean }>({
      combine: ([value = 0]) => ({ even: value % 2 === 0 }),
      compare: (left, right) => left.even === right.even,
      key: 'facet-counter-parity',
    });
    let computes = 0;
    const editor = createEditor({
      extensions: [
        defineExtension('field-equality-facet', {
          stateFields: [counter],
          facetProviders: [
            parity.compute(
              (state) => {
                computes += 1;

                return state.getField(counter);
              },
              { dependencies: [counter] }
            ),
          ],
        }),
      ],
    });
    const initial = editor.read.facet(parity);

    editor.update((tx) => tx.setField(counter, 2));

    assert.equal(editor.read.facet(parity), initial);
    assert.equal(computes, 2);
  });

  it('keeps frozen field and value identity across equivalent configurations', () => {
    const field = defineStateField({
      initial: { nested: { value: 1 } },
      key: 'stable-field',
    });
    const derived = defineFacet<object>({ key: 'stable-field-derived' });
    const slot = defineExtensionSlot('stable-field-slot');
    const stableFieldExtension = defineExtension('stable-field', {
      stateFields: [field],
    });
    let computes = 0;
    const editor = createEditor({
      extensions: [
        defineExtension('stable-field-reader', {
          facetProviders: [
            derived.compute(
              (state) => {
                computes += 1;

                return state.getField(field);
              },
              { dependencies: [field] }
            ),
          ],
        }),
        slot.of(stableFieldExtension),
      ] as const,
    });
    const value = editor.read.getField(field);
    const output = editor.read.facet(derived);

    assert.equal(Object.isFrozen(field), true);
    assert.equal(Object.isFrozen(value), true);
    assert.equal(Object.isFrozen(value.nested), true);
    assert.equal(editor.read.getField(field), value);

    editor.update((tx) => {
      tx.extensions.reconfigure(slot, stableFieldExtension);

      assert.equal(editor.read.getField(field), value);
      assert.equal(editor.read.facet(derived), output);
    });

    assert.equal(editor.read.getField(field), value);
    assert.equal(editor.read.facet(derived), output);
    assert.equal(computes, 1);
  });

  it('rejects duplicate, unknown, and unstable field descriptors', () => {
    const first = defineStateField({ initial: 1, key: 'duplicate-field' });
    const duplicate = defineStateField({
      initial: 2,
      key: 'duplicate-field',
    });

    assert.throws(
      () =>
        createEditor({
          extensions: [
            defineExtension('first-field', { stateFields: [first] }),
            defineExtension('duplicate-field', { stateFields: [duplicate] }),
          ],
        }),
      /state field "duplicate-field".*(?:conflicts|descriptor identity)/i
    );

    const editor = createEditor({
      extensions: [defineExtension('first-field', { stateFields: [first] })],
    });
    const unknown = defineStateField({ initial: 0, key: 'unknown-field' });

    assert.throws(
      () => editor.read.getField(unknown),
      /state field "unknown-field" is not installed/i
    );
    assert.throws(
      () => editor.read.getField(duplicate),
      /state field "duplicate-field" does not match.*descriptor/i
    );
    assert.throws(
      () => editor.update((tx) => tx.setField(unknown, 1)),
      /state field "unknown-field" is not installed/i
    );
  });

  it('publishes field activation and deactivation only at reconfigure commit', () => {
    const first = defineStateField({ initial: 'first', key: 'active-first' });
    const second = defineStateField({
      initial: 'second',
      key: 'active-second',
    });
    const slot = defineExtensionSlot('active-field-slot');
    const firstExtension = defineExtension('active-first', {
      stateFields: [first],
    });
    const secondExtension = defineExtension('active-second', {
      stateFields: [second],
    });
    const editor = createEditor({
      extensions: [slot.of(firstExtension)] as const,
    });

    editor.update((tx) => {
      tx.extensions.reconfigure(slot, secondExtension);

      assert.equal(editor.read.getField(first), 'first');
      assert.throws(
        () => editor.read.getField(second),
        /state field "active-second" is not installed/i
      );
    });

    assert.throws(
      () => editor.read.getField(first),
      /state field "active-first" is not installed/i
    );
    assert.equal(editor.read.getField(second), 'second');
  });

  it('invalidates root-scoped document dependencies independently', () => {
    const mainLength = defineFacet<number>({ key: 'main-length' });
    const sidebarLength = defineFacet<number>({ key: 'sidebar-length' });
    let mainComputes = 0;
    let sidebarComputes = 0;
    const editor = createEditor({
      extensions: [
        defineExtension('root-scoped-facets', {
          facetProviders: [
            mainLength.compute(
              (state) => {
                mainComputes += 1;

                return state.text.string([]).length;
              },
              { dependencies: [{ kind: 'document' }] }
            ),
            sidebarLength.compute(
              (state) => {
                sidebarComputes += 1;

                return NodeApi.string(state.root('sidebar')[0]).length;
              },
              {
                dependencies: [{ kind: 'document', root: 'sidebar' }],
              }
            ),
          ],
        }),
      ],
      initialValue: {
        children: [paragraph('main')],
        roots: { sidebar: [paragraph('side')] },
      },
    });

    assert.deepEqual(editor.read.facet(mainLength), [4]);
    assert.deepEqual(editor.read.facet(sidebarLength), [4]);

    editor.update((tx) =>
      tx.text.insert('!', { at: { offset: 4, path: [0, 0] } })
    );
    assert.deepEqual(editor.read.facet(mainLength), [5]);
    assert.deepEqual(editor.read.facet(sidebarLength), [4]);
    assert.equal(mainComputes, 2);
    assert.equal(sidebarComputes, 1);

    editor.update((tx) => {
      tx.roots.replace('sidebar', [paragraph('aside!')]);
    });
    assert.deepEqual(editor.read.facet(mainLength), [5]);
    assert.deepEqual(editor.read.facet(sidebarLength), [6]);
    assert.equal(mainComputes, 2);
    assert.equal(sidebarComputes, 2);
  });

  it('reads installed fields in non-publishing command specs', () => {
    type Increment = { amount: number };
    const counter = defineStateField({
      initial: 0,
      key: 'draft-field-counter',
    });
    const increment = defineCommand<Increment>('field.increment', {
      build: ({ input, state }) =>
        state.transaction((tx) => {
          tx.setField(counter, (value) => value + input.amount);
        }),
    });
    const editor = createEditor({
      extensions: [
        defineExtension('draft-field-counter', { stateFields: [counter] }),
      ] as const,
    });

    editor.update((tx) => tx.setField(counter, 3));

    assert.equal(
      dispatchCommand(editor, increment, {
        amount: 1,
      }),
      true
    );
    assert.equal(editor.read.getField(counter), 4);
  });
});
