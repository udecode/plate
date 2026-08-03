import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  createEditor,
  type Descendant,
  defineExtension,
  defineStateField,
  defineValueCodec,
  valueCodecs,
} from '@platejs/plite';

const paragraph = (text: string) =>
  ({
    type: 'paragraph',
    children: [{ text }],
  }) satisfies Descendant;

describe('document meta contract', () => {
  it('initializes persisted state fields and reads them by descriptor', () => {
    const documentTitle = defineStateField({
      key: 'document.title',
      collab: 'shared',
      history: 'push',
      initial: () => 'Untitled',
      persist: valueCodecs.string,
    });

    const explicit = createEditor({
      extensions: [
        defineExtension('document-title', { stateFields: [documentTitle] }),
      ] as const,
      initialValue: {
        children: [paragraph('body')],
        meta: {
          [documentTitle.key]: documentTitle.serialize('Q2 Plan'),
        },
      },
    });
    const defaulted = createEditor({
      extensions: [
        defineExtension('document-title', { stateFields: [documentTitle] }),
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
      extensions: [
        defineExtension('document-meta', {
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
        initialCalls++;

        return { count: 0 };
      },
      key: 'document.counter',
      persist: defineValueCodec<{ count: number }>({
        decode(value) {
          decodeCalls++;

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
    const persistedExtension = defineExtension('document-counter', {
      stateFields: [persisted],
    });
    const localExtension = defineExtension('local-panel', {
      stateFields: [local],
    });
    const removePersisted = editor.install(persistedExtension);
    const removeLocal = editor.install(localExtension);

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

    const removeReinstalled = editor.install(persistedExtension);

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
          defineExtension('document-counter-impostor', {
            stateFields: [impostor],
          })
        ),
      /does not match the stable descriptor identity/i
    );
  });
});
