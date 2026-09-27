import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  createEditor,
  definePlugin,
  defineEffect,
  definePluginSlot,
  type EditorEffectType,
  valueCodecs,
} from 'plitejs';

import { screenReaderAnnouncementEffect } from '../src/core/screen-reader-announcement';

const owner = (name: string, type: EditorEffectType) =>
  definePlugin(name, { effectTypes: [type] });

describe('installed editor effect registry', () => {
  it('keeps the intrinsic screen-reader effect zero-config', () => {
    const editor = createEditor();

    assert.doesNotThrow(() => {
      editor.update((tx) => {
        tx.effects.emit(screenReaderAnnouncementEffect, 'Saved');
      });
    });
  });

  it('rejects emission before install and after teardown', () => {
    const increment = defineEffect<number>({ key: 'counter.increment' });
    const editor = createEditor();

    assert.throws(
      () => editor.update((tx) => tx.effects.emit(increment, 1)),
      /is not installed/
    );

    const cleanup = editor.install(owner('counter-effect', increment));

    assert.doesNotThrow(() => {
      editor.update((tx) => tx.effects.emit(increment, 1));
    });
    cleanup();

    assert.throws(
      () => editor.update((tx) => tx.effects.emit(increment, 1)),
      /is not installed/
    );
  });

  it('rejects duplicate keys without disturbing the installed owner', () => {
    const first = defineEffect({ key: 'duplicate.effect' });
    const duplicate = defineEffect({ key: first.key });
    const editor = createEditor({ plugins: [owner('first', first)] });

    assert.throws(
      () => editor.install(owner('duplicate', duplicate)),
      /from "duplicate" conflicts with "first"/
    );
    assert.doesNotThrow(() => {
      editor.update((tx) => tx.effects.emit(first, null));
    });
  });

  it('normalizes session replay as one frozen local history policy', () => {
    const replay = (_editor: unknown, value: string) => ({
      status: 'applied' as const,
      value,
    });
    const history = { replay };
    const effect = defineEffect<string>({
      history,
      key: 'session.effect',
    });

    assert.equal(effect.collab, 'local');
    assert.notEqual(effect.history, history);
    assert.ok(typeof effect.history === 'object');
    assert.equal(effect.history.replay, replay);
    assert.ok(Object.isFrozen(effect.history));

    const defineStringEffect = defineEffect<string>;

    assert.throws(
      () =>
        defineStringEffect({
          history: {},
          key: 'invalid.session.effect',
        } as unknown as Parameters<typeof defineStringEffect>[0]),
      /invalid history policy/
    );
    assert.throws(
      () =>
        defineStringEffect({
          persist: { ...valueCodecs.string, version: 1 },
          collab: 'shared',
          collabReplay: 'live',
          history,
          key: 'shared.session.effect',
        } as unknown as Parameters<typeof defineStringEffect>[0]),
      /cannot be shared/
    );
  });

  it('atomically replaces descriptor identity through plugin slots', () => {
    const first = defineEffect<number>({ key: 'versioned.effect' });
    const second = defineEffect<number>({ key: first.key });
    const slot = definePluginSlot('versioned-effect');
    const plugin = (type: EditorEffectType<number>) =>
      owner('versioned-effect-owner', type);
    const editor = createEditor({
      plugins: [slot.of(plugin(first))] as const,
    });

    editor.update((tx) => {
      tx.plugins.reconfigure(slot, plugin(second));
    });

    assert.throws(
      () => editor.update((tx) => tx.effects.emit(first, 1)),
      /does not match the installed descriptor from "versioned-effect-owner"/
    );
    assert.doesNotThrow(() => {
      editor.update((tx) => tx.effects.emit(second, 1));
    });
  });

  it('validates descriptor policies and collaboration transport at install', () => {
    const base = defineEffect({ key: 'invalid.effect' });
    const invalidCollab = Object.freeze({
      ...base,
      collab: 'cloud',
      key: 'invalid.collab',
    }) as unknown as EditorEffectType;
    const invalidPersistence = Object.freeze({
      ...base,
      persist: Object.freeze({
        decode: (value: unknown) => value,
        encode: (value: unknown) => value,
        version: 0,
      }),
      key: 'invalid.persistence',
    }) as unknown as EditorEffectType;
    const invalidHistory = Object.freeze({
      ...base,
      history: 'invalid',
      key: 'invalid.history',
    }) as unknown as EditorEffectType;
    const invalidTransport = Object.freeze({
      ...defineEffect({
        persist: { ...valueCodecs.string, version: 1 },
        collab: 'shared',
        collabReplay: 'live',
        key: 'invalid.transport',
      }),
      collabTransport: Object.freeze({ encode: () => null }),
    }) as unknown as EditorEffectType;
    const invalidSessionHistory = Object.freeze({
      ...defineEffect({
        persist: { ...valueCodecs.string, version: 1 },
        collab: 'shared',
        collabReplay: 'live',
        key: 'invalid.session-history',
      }),
      history: Object.freeze({
        replay: (_editor: unknown, value: unknown) => ({
          status: 'applied',
          value,
        }),
      }),
    }) as unknown as EditorEffectType;

    assert.throws(
      () =>
        createEditor({
          plugins: [owner('invalid-collab', invalidCollab)],
        }),
      /invalid collaboration policy/
    );
    assert.throws(
      () =>
        createEditor({
          plugins: [owner('invalid-persistence', invalidPersistence)],
        }),
      /invalid persistence/
    );
    assert.throws(
      () =>
        createEditor({
          plugins: [owner('invalid-history', invalidHistory)],
        }),
      /invalid history policy/
    );
    assert.throws(
      () =>
        createEditor({
          plugins: [owner('invalid-transport', invalidTransport)],
        }),
      /invalid collaboration transport/
    );
    assert.throws(
      () =>
        createEditor({
          plugins: [owner('invalid-session-history', invalidSessionHistory)],
        }),
      /invalid session history replay policy/
    );
  });
});
