import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  createEditor,
  defineEditorExtension,
  defineEffect,
  defineExtensionSlot,
  type EditorEffectType,
  valueCodecs,
} from '@platejs/plite';

import { screenReaderAnnouncementEffect } from '../src/core/screen-reader-announcement';

const owner = (name: string, type: EditorEffectType) =>
  defineEditorExtension({ effectTypes: [type], name });

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

    const cleanup = editor.extend(owner('counter-effect', increment));

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
    const editor = createEditor({ extensions: [owner('first', first)] });

    assert.throws(
      () => editor.extend(owner('duplicate', duplicate)),
      /from "duplicate" conflicts with "first"/
    );
    assert.doesNotThrow(() => {
      editor.update((tx) => tx.effects.emit(first, null));
    });
  });

  it('atomically replaces descriptor identity through extension slots', () => {
    const first = defineEffect<number>({ key: 'versioned.effect' });
    const second = defineEffect<number>({ key: first.key });
    const slot = defineExtensionSlot('versioned-effect');
    const extension = (type: EditorEffectType<number>) =>
      owner('versioned-effect-owner', type);
    const editor = createEditor({
      extensions: [slot.of(extension(first))] as const,
    });

    editor.update((tx) => {
      tx.extensions.reconfigure(slot, extension(second));
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
    const invalidCodec = Object.freeze({
      ...base,
      codec: Object.freeze({
        decode: (value: unknown) => value,
        encode: (value: unknown) => value,
        version: 0,
      }),
      key: 'invalid.codec',
    }) as unknown as EditorEffectType;
    const invalidHistory = Object.freeze({
      ...base,
      history: 'invalid',
      key: 'invalid.history',
    }) as unknown as EditorEffectType;
    const invalidTransport = Object.freeze({
      ...defineEffect({
        codec: valueCodecs.string,
        collab: 'shared',
        collabReplay: 'live',
        key: 'invalid.transport',
      }),
      collabTransport: Object.freeze({ encode: () => null }),
    }) as unknown as EditorEffectType;

    assert.throws(
      () =>
        createEditor({
          extensions: [owner('invalid-collab', invalidCollab)],
        }),
      /invalid collaboration policy/
    );
    assert.throws(
      () =>
        createEditor({
          extensions: [owner('invalid-codec', invalidCodec)],
        }),
      /invalid codec/
    );
    assert.throws(
      () =>
        createEditor({
          extensions: [owner('invalid-history', invalidHistory)],
        }),
      /invalid history policy/
    );
    assert.throws(
      () =>
        createEditor({
          extensions: [owner('invalid-transport', invalidTransport)],
        }),
      /invalid collaboration transport/
    );
  });
});
