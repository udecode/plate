import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  createEditor,
  defineCommand,
  definePlugin,
  definePluginSlot,
  defineStateField,
} from 'plitejs';

import { dispatchCommand } from '../src/internal';

describe('document state fields', () => {
  it('installs a state field directly as its canonical plugin', () => {
    const counter = defineStateField({
      initial: 1,
      key: 'direct-field-plugin',
    });
    const editor = createEditor({ plugins: [counter] });

    assert.equal(counter.stateFields?.[0], counter);
    assert.equal(
      editor.read((state) => state.getField(counter)),
      1
    );
  });

  it('suppresses equal field transitions and preserves the stored value', () => {
    const counter = defineStateField({
      compare: (left, right) => left.count === right.count,
      initial: { count: 0 },
      key: 'equal-counter',
    });
    const editor = createEditor({ plugins: [counter] });
    const initial = editor.read.getField(counter);
    let commits = 0;

    editor.subscribeCommit(() => {
      commits += 1;
    });
    editor.update((tx) => tx.setField(counter, { count: 0 }));
    assert.equal(editor.read.getField(counter), initial);
    assert.equal(commits, 0);

    editor.update((tx) => tx.setField(counter, { count: 2 }));
    assert.deepEqual(editor.read.getField(counter), { count: 2 });
    assert.equal(commits, 1);
  });

  it('keeps frozen field and value identity across equivalent configurations', () => {
    const field = defineStateField({
      initial: { nested: { value: 1 } },
      key: 'stable-field',
    });
    const slot = definePluginSlot('stable-field-slot');
    const stableFieldPlugin = definePlugin('stable-field', {
      stateFields: [field],
    });
    const editor = createEditor({
      plugins: [slot.of(stableFieldPlugin)] as const,
    });
    const value = editor.read.getField(field);

    assert.equal(Object.isFrozen(field), true);
    assert.equal(Object.isFrozen(value), true);
    assert.equal(Object.isFrozen(value.nested), true);
    assert.equal(editor.read.getField(field), value);

    editor.update((tx) => {
      tx.plugins.reconfigure(slot, stableFieldPlugin);

      assert.equal(editor.read.getField(field), value);
    });

    assert.equal(editor.read.getField(field), value);
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
          plugins: [
            definePlugin('first-field', { stateFields: [first] }),
            definePlugin('duplicate-field', { stateFields: [duplicate] }),
          ],
        }),
      /state field "duplicate-field".*(?:conflicts|descriptor identity)/i
    );

    const editor = createEditor({
      plugins: [definePlugin('first-field', { stateFields: [first] })],
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
    const slot = definePluginSlot('active-field-slot');
    const firstPlugin = definePlugin('active-first', {
      stateFields: [first],
    });
    const secondPlugin = definePlugin('active-second', {
      stateFields: [second],
    });
    const editor = createEditor({
      plugins: [slot.of(firstPlugin)] as const,
    });

    editor.update((tx) => {
      tx.plugins.reconfigure(slot, secondPlugin);

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

  it('reads installed fields in command specifications', () => {
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
      plugins: [
        definePlugin('draft-field-counter', { stateFields: [counter] }),
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
