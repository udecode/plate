import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  createEditor,
  defineCommand,
  definePlugin,
  defineEffect,
  definePluginSlot,
  defineStateField,
  defineUpdateAnnotation,
  PluginPublicationError,
  type EditorCommit,
} from 'plitejs';

import { dispatchCommand } from '../src/internal';

describe('transaction plugin values', () => {
  it('reduces typed effects into fields and publishes mapped commit effects', () => {
    const increment = defineEffect<number>({
      invert: (value) => -value,
      key: 'counter.increment',
      map: (value) => value,
    });
    const counter = defineStateField({
      key: 'counter',
      initial: () => 0,
      reduce: (value, effect) =>
        effect.type === increment ? value + effect.value : value,
    });
    const incrementPlugin = definePlugin('counter-increment-effect', {
      effectTypes: [increment],
      stateFields: [counter],
    });
    const editor = createEditor({
      plugins: [incrementPlugin],
    });
    const commits: EditorCommit[] = [];

    editor.subscribeCommit((nextCommit) => {
      commits.push(nextCommit);
    });
    editor.update((tx) => {
      tx.effects.emit(increment, 2);
      tx.effects.emit(increment, 3);
    });

    assert.equal(editor.read.getField(counter), 5);
    assert.deepEqual(
      commits[0].effects.map((effect) => [effect.type.key, effect.value]),
      [
        ['counter.increment', 2],
        ['counter.increment', 3],
      ]
    );
    assert.equal(increment.map(2, commits[0].changes), 2);
    assert.equal(increment.invert(2), -2);
  });

  it('combines typed update annotations by key', () => {
    const origin = defineUpdateAnnotation<string>({
      combine: (previous, next) => `${previous}+${next}`,
      key: 'origin',
    });
    const editor = createEditor();
    const commits: EditorCommit[] = [];

    editor.subscribeCommit((nextCommit) => {
      commits.push(nextCommit);
    });
    editor.update((tx) => {
      tx.annotations.set(origin, 'keyboard');
      tx.annotations.set(origin, 'paste');
    });

    assert.equal(commits[0].annotations.origin, 'keyboard+paste');
    assert.equal(commits[0].changed.has('snapshot'), false);
  });

  it('atomically reconfigures named plugin slots', () => {
    const slot = definePluginSlot('mode');
    const persisted = defineStateField({
      initial: () => 'installed',
      key: 'mode-state',
    });
    const errors: Array<{ pluginName: string; phase: string }> = [];
    const mode = (value: string) =>
      definePlugin('modeValue', { read: () => ({ value: () => value }) });
    const editor = createEditor({
      plugins: [slot.of(mode('read'))] as const,
      lifecycleErrorSink(error) {
        errors.push({ pluginName: error.pluginName, phase: error.phase });
      },
    });

    assert.equal(editor.read.modeValue.value(), 'read');

    editor.update((tx) => {
      tx.plugins.reconfigure(slot, mode('write'));
    });
    assert.equal(editor.read.modeValue.value(), 'write');

    assert.throws(
      () =>
        editor.update((tx) => {
          tx.plugins.reconfigure(
            slot,
            definePlugin('broken-mode', {
              stateFields: [persisted],
              activate() {
                throw new Error('broken mode');
              },
            })
          );
        }),
      PluginPublicationError
    );
    assert.equal(editor.read.modeValue.value(), 'write');
    assert.throws(() => editor.read.getField(persisted), /not installed/);
    assert.deepEqual(errors, []);
  });

  it('runs typed command defaults headlessly inside one update', () => {
    type AddCommand = { amount: number };
    const counter = defineStateField({ key: 'counter', initial: () => 0 });
    const add = defineCommand<AddCommand>('counter.add', {
      build: ({ input, state }) =>
        state.transaction((tx) => {
          tx.setField(counter, (value) => value + input.amount);
        }),
    });
    const editor = createEditor({
      plugins: [
        definePlugin('counter-state', { stateFields: [counter] }),
      ] as const,
    });

    assert.equal(dispatchCommand(editor, add, { amount: 4 }), true);
    assert.equal(editor.read.getField(counter), 4);
    assert.equal(
      editor.read.lastCommit()?.tags.includes('semantic-command'),
      true
    );
  });
});
