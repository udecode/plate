import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  createEditor,
  type Descendant,
  definePlugin,
  defineStateField,
  defineValueCodec,
  valueCodecs,
} from 'plitejs';

const paragraph = (text: string) =>
  ({
    type: 'paragraph',
    children: [{ text }],
  }) satisfies Descendant;

describe('document meta contract', () => {
  it('serializes persisted state only when document metadata is read', () => {
    let encodeCalls = 0;
    const counter = defineStateField({
      initial: 0,
      key: 'document.lazy-counter',
      persist: defineValueCodec<number>({
        decode: (value) => value as number,
        encode: (value) => {
          encodeCalls += 1;

          return value;
        },
        version: 1,
      }),
    });
    const editor = createEditor({
      plugins: [definePlugin('lazy-counter', { stateFields: [counter] })],
      initialValue: [paragraph('body')],
    });

    editor.update((tx) => tx.setField(counter, 1));
    const value = editor.read.value();

    assert.equal(encodeCalls, 0);
    assert.deepEqual(value.meta?.[counter.key], { value: 1, version: 1 });
    assert.equal(encodeCalls, 1);
    assert.equal(JSON.stringify(value).includes('lazy-counter'), true);
    assert.equal(encodeCalls, 1);
  });

  it('initializes persisted state fields and reads them by descriptor', () => {
    const documentTitle = defineStateField({
      key: 'document.title',
      collab: 'shared',
      history: 'push',
      initial: () => 'Untitled',
      persist: valueCodecs.string,
    });

    const explicit = createEditor({
      plugins: [
        definePlugin('document-title', { stateFields: [documentTitle] }),
      ] as const,
      initialValue: {
        children: [paragraph('body')],
        meta: {
          [documentTitle.key]: documentTitle.serialize('Q2 Plan'),
        },
      },
    });
    const defaulted = createEditor({
      plugins: [
        definePlugin('document-title', { stateFields: [documentTitle] }),
      ] as const,
      initialValue: [paragraph('body')],
    });

    assert.equal(
      explicit.read((state) => state.getField(documentTitle)),
      'Q2 Plan'
    );
    assert.deepEqual(
      explicit.read((state) => state.value()),
      {
        children: [paragraph('body')],
        meta: {
          [documentTitle.key]: documentTitle.serialize('Q2 Plan'),
        },
      }
    );
    assert.equal(
      defaulted.read((state) => state.getField(documentTitle)),
      'Untitled'
    );
    assert.deepEqual(
      defaulted.read((state) => state.value()),
      {
        children: [paragraph('body')],
        meta: {
          [documentTitle.key]: documentTitle.serialize('Untitled'),
        },
      }
    );
  });

  it('omits non-persistent fields from document meta', () => {
    const documentTitle = defineStateField({
      key: 'document.title',
      initial: () => 'Untitled',
      persist: valueCodecs.string,
    });
    const localPanel = defineStateField({
      key: 'local.panel',
      initial: () => 'closed',
    });
    const editor = createEditor({
      plugins: [
        definePlugin('document-meta', {
          stateFields: [documentTitle, localPanel],
        }),
      ] as const,
      initialValue: [paragraph('body')],
    });

    editor.update((tx) => {
      tx.setField(documentTitle, 'Q2 Plan');
      tx.setField(localPanel, 'open');
    });

    assert.equal(
      editor.read((state) => state.getField(localPanel)),
      'open'
    );
    assert.deepEqual(
      editor.read((state) => state.value()),
      {
        children: [paragraph('body')],
        meta: {
          [documentTitle.key]: documentTitle.serialize('Q2 Plan'),
        },
      }
    );
  });

  it('preserves state-field identity and persistence across uninstall', () => {
    let decodeCalls = 0;
    let initialCalls = 0;
    const persisted = defineStateField({
      initial: () => {
        initialCalls += 1;

        return { count: 0 };
      },
      key: 'document.counter',
      persist: defineValueCodec<{ count: number }>({
        decode(value) {
          decodeCalls += 1;

          return value as { count: number };
        },
        encode: (value) => value,
        version: 3,
      }),
    });
    const local = defineStateField({
      initial: () => ({ open: false }),
      key: 'local.panel',
    });
    const editor = createEditor({
      initialValue: {
        children: [paragraph('body')],
        meta: { unknown: { retained: true } },
      },
    });
    const persistedPlugin = definePlugin('document-counter', {
      stateFields: [persisted],
    });
    const localPlugin = definePlugin('local-panel', {
      stateFields: [local],
    });
    const removePersisted = editor.install(persistedPlugin);
    const removeLocal = editor.install(localPlugin);

    editor.update((tx) => {
      tx.setField(persisted, { count: 7 });
      tx.setField(local, { open: true });
    });
    const stored = editor.read.getField(persisted);
    const initialCallsBeforeReinstall = initialCalls;
    const decodeCallsBeforeReinstall = decodeCalls;

    removePersisted();
    removeLocal();

    assert.throws(
      () => editor.read.getField(persisted),
      /state field "document.counter" is not installed/i
    );
    assert.deepEqual(editor.read.value(), {
      children: [paragraph('body')],
      meta: {
        [persisted.key]: { value: { count: 7 }, version: 3 },
        unknown: { retained: true },
      },
    });

    const removeReinstalled = editor.install(persistedPlugin);

    assert.equal(editor.read.getField(persisted), stored);
    assert.equal(initialCalls, initialCallsBeforeReinstall);
    assert.equal(decodeCalls, decodeCallsBeforeReinstall);
    removeReinstalled();

    const impostor = defineStateField({
      initial: () => ({ count: 0 }),
      key: persisted.key,
      persist: defineValueCodec<{ count: number }>({
        decode: (value) => value as { count: number },
        encode: (value) => value,
        version: 3,
      }),
    });

    assert.throws(
      () =>
        editor.install(
          definePlugin('document-counter-impostor', {
            stateFields: [impostor],
          })
        ),
      /does not match the stable descriptor identity/i
    );
  });
});
