import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { runInNewContext } from 'node:vm';

import fc from 'fast-check';
import {
  createEditor,
  defineEffect,
  definePlugin,
  defineStateField,
  type EditorJsonValue,
  type EditorValuePersistence,
} from 'plitejs';

import {
  ownCurrentEditorValuePersistenceInput,
  snapshotEditorJsonValue,
} from '../src/core/value-codec';
import { assertEditorValuePersistenceLaws } from './support/value-persistence-laws';

const paragraph = (text: string) => ({
  type: 'paragraph',
  children: [{ text }],
});

const jsonPersistence = {
  decode(value) {
    if (
      value !== null &&
      typeof value !== 'boolean' &&
      typeof value !== 'number' &&
      typeof value !== 'string' &&
      typeof value !== 'object'
    ) {
      throw new Error('Expected JSON data.');
    }

    return value as EditorJsonValue;
  },
  encode: (value) => value,
  version: 1,
} satisfies EditorValuePersistence<EditorJsonValue, EditorJsonValue>;

describe('editor value persistence contract', () => {
  it('requires positive integer versions and persistence for shared values', () => {
    assert.throws(
      () =>
        defineStateField({
          key: 'invalid-version',
          persist: {
            decode: jsonPersistence.decode,
            encode: jsonPersistence.encode,
            version: 0,
          },
        }),
      /positive integer/
    );
    assert.throws(
      () =>
        defineStateField({
          key: 'shared.missing-codec',
          collab: 'shared',
          initial: () => 'draft',
        }),
      /requires persistence/
    );
    assert.throws(
      () =>
        defineEffect({
          key: 'shared.missing-codec',
          collab: 'shared',
          collabReplay: 'live',
        }),
      /requires persistence/
    );
  });

  it('rejects non-JSON persistence output and unversioned field data', () => {
    const field = defineStateField({
      key: 'document.payload',
      initial: () => null as unknown,
      persist: {
        decode: (value) => value,
        encode: (value) => value as EditorJsonValue,
        version: 1,
      },
    });
    const circular: Record<string, unknown> = {};

    circular.self = circular;

    assert.throws(() => field.serialize(new Date()), /JSON-compatible data/);
    assert.throws(
      () => field.serialize(Number.POSITIVE_INFINITY),
      /JSON-compatible data/
    );
    assert.throws(() => field.serialize(circular), /JSON-compatible data/);
    assert.throws(
      () =>
        createEditor({
          plugins: [
            definePlugin('document-payload', { stateFields: [field] }),
          ] as const,
          initialValue: {
            children: [paragraph('body')],
            meta: { [field.key]: 'raw' },
          },
        }),
      /Invalid state field "document.payload" envelope/
    );
    for (const malformed of [
      null,
      {},
      { value: 'missing-version' },
      { value: 'string-version', version: '1' },
      { value: 'fractional-version', version: 1.5 },
    ]) {
      assert.throws(
        () => field.deserialize(malformed),
        /Invalid state field "document.payload" envelope/
      );
    }
  });

  it('accepts shared JSON references while rejecting cycles', () => {
    const field = defineStateField({
      key: 'document.shared-payload',
      initial: () => null,
      persist: jsonPersistence,
    });
    const shared = { value: 'shared' };

    const serialized = field.serialize({ left: shared, right: shared });

    assert.deepEqual(serialized, {
      value: {
        left: { value: 'shared' },
        right: { value: 'shared' },
      },
      version: 1,
    });
    assert.notEqual(
      (serialized.value as { left: unknown }).left,
      (serialized.value as { right: unknown }).right
    );
  });

  it('round-trips every canonical JSON value without narrowing', () => {
    const field = defineStateField({
      key: 'document.canonical-json',
      initial: () => null,
      persist: jsonPersistence,
    });
    const jsonValue = fc
      .jsonValue({ maxDepth: 4 })
      .map((value) => JSON.parse(JSON.stringify(value)) as unknown);

    fc.assert(
      fc.property(jsonValue, (value) => {
        const serialized = field.serialize(value);

        assert.deepEqual(serialized, { value, version: 1 });
        assert.deepEqual(field.deserialize(serialized), value);
        assertEditorValuePersistenceLaws({
          encoded: [value as EditorJsonValue],
          live: [value as EditorJsonValue],
          persistence: jsonPersistence,
        });
      }),
      { numRuns: 100, seed: 0xc_0d_ec }
    );
  });

  it('decodes explicitly supported previous versions and always writes the current version', () => {
    const field = defineStateField({
      initial: () => ({ label: '' }),
      key: 'document.versioned-payload',
      persist: {
        decode(value) {
          assert.ok(value && typeof value === 'object' && 'label' in value);
          return { label: String(value.label) };
        },
        encode: (value: { label: string }) => ({ label: value.label }),
        legacyDecoders: {
          1(value) {
            assert.equal(typeof value, 'string');
            return { label: value as string };
          },
        },
        version: 2,
      },
    });

    assert.deepEqual(field.deserialize({ value: 'legacy', version: 1 }), {
      label: 'legacy',
    });
    assert.deepEqual(field.serialize({ label: 'current' }), {
      value: { label: 'current' },
      version: 2,
    });
    assert.throws(
      () => field.deserialize({ value: 'future', version: 3 }),
      /Unsupported state field "document.versioned-payload" version 3; expected 1 or 2/
    );
  });

  it('shares validated immutable subtrees and detaches untrusted frozen inputs', () => {
    const replace = defineEffect<unknown>({ key: 'document.pages.replace' });
    const field = defineStateField({
      key: 'document.pages',
      initial: () => null,
      persist: jsonPersistence,
      reduce: (value, effect) =>
        effect.type === replace ? effect.value : value,
    });
    const mutable = { text: 'original' };
    const input = Object.freeze({ page: mutable });
    const first = field.serialize(input);
    const firstValue = first.value as { page: { text: string } };

    mutable.text = 'outside mutation';
    assert.equal(firstValue.page.text, 'original');
    assert.equal(Object.isFrozen(firstValue.page), true);

    const second = field.serialize({ retained: first.value, added: 'next' });
    assert.equal((second.value as { retained: unknown }).retained, first.value);
    const editor = createEditor({
      plugins: [
        definePlugin('pages', {
          stateFields: [field],
          effectTypes: [replace],
        }),
      ],
      initialValue: [paragraph('body')],
    });
    editor.update((tx) => tx.effects.emit(replace, first.value));
    const saved = editor.read.value();
    assert.equal(editor.read.getField(field), first.value);
    assert.equal(
      (saved.meta?.[field.key] as { value: unknown } | undefined)?.value,
      first.value
    );
    assert.equal(JSON.stringify(saved).includes('outside mutation'), false);
    assert.throws(
      () => field.serialize(Object.freeze({ invalid: new Date() })),
      /JSON-compatible data/
    );
  });

  it('passes owned current-version input directly to its decoder', () => {
    const owned = snapshotEditorJsonValue<EditorJsonValue>(
      { label: 'owned' },
      'Owned persistence input'
    );
    let received: unknown;
    const persistence = ownCurrentEditorValuePersistenceInput<
      EditorJsonValue,
      EditorJsonValue
    >({
      decode(value) {
        received = value;

        return value as EditorJsonValue;
      },
      encode: (value) => value,
      version: 1,
    });
    const field = defineStateField({
      key: 'document.owned-input',
      persist: persistence,
    });

    assert.equal(field.deserialize({ value: owned, version: 1 }), owned);
    assert.equal(received, owned);
  });

  it('detaches initial metadata after registered fields decode', () => {
    const field = defineStateField({
      key: 'document.initial-payload',
      initial: () => null,
      persist: jsonPersistence,
    });
    const fieldValue = { label: 'stored' };
    const unknownValue = { label: 'unknown' };
    const editor = createEditor({
      plugins: [definePlugin('initial-payload', { stateFields: [field] })],
      initialValue: {
        children: [paragraph('body')],
        meta: {
          [field.key]: { value: fieldValue, version: 1 },
          unknown: unknownValue,
        },
      },
    });

    fieldValue.label = 'mutated';
    unknownValue.label = 'mutated';

    assert.deepEqual(editor.read.getField(field), { label: 'stored' });
    assert.deepEqual(editor.read.value().meta?.unknown, { label: 'unknown' });
    assert.equal(Object.isFrozen(editor.read.value().meta?.unknown), true);
    assert.throws(
      () =>
        createEditor({
          initialValue: {
            children: [paragraph('body')],
            meta: { unknown: new Date(0) },
          },
        }),
      /JSON-compatible data/
    );
  });

  it('accepts canonical JSON values created in another realm', () => {
    const field = defineStateField({
      key: 'document.cross-realm-json',
      initial: () => null,
      persist: jsonPersistence,
    });
    const value = runInNewContext(
      '({ enabled: true, nested: [1, { label: "foreign" }] })'
    ) as unknown;

    const serialized = field.serialize(value);

    assert.deepEqual(serialized, {
      value: {
        enabled: true,
        nested: [1, { label: 'foreign' }],
      },
      version: 1,
    });
    const serializedValue = serialized.value as {
      nested: unknown[];
    };

    assert.equal(Object.getPrototypeOf(serializedValue), Object.prototype);
    assert.equal(
      Object.getPrototypeOf(serializedValue.nested),
      Array.prototype
    );
    assert.equal(
      Object.getPrototypeOf(serializedValue.nested[1] as object),
      Object.prototype
    );
  });

  it('rejects every value shape that JSON would coerce or omit', () => {
    const field = defineStateField({
      key: 'document.strict-json',
      initial: () => null,
      persist: jsonPersistence,
    });
    const sparse = Array.from({ length: 1 });
    const subclass = new (class extends Array<unknown> {})();
    const symbolKey = { value: true } as Record<PropertyKey, unknown>;
    const accessor = {} as Record<string, unknown>;
    const arrayAccessor = ['value'];
    const arrayHidden = ['value'] as unknown[] & { hidden?: string };
    const arraySymbol = ['value'] as unknown[] & Record<symbol, unknown>;
    const circular: Record<string, unknown> = {};
    const customObject = new (class {
      value = true;
    })();
    const crossRealmArraySubclass = runInNewContext(
      'new (class extends Array {})(1)'
    );
    const crossRealmClass = runInNewContext(
      'new (class Value { constructor() { this.value = true; } })()'
    );

    delete sparse[0];
    subclass.push('value');
    symbolKey[Symbol('hidden')] = true;
    Object.defineProperty(accessor, 'value', {
      enumerable: true,
      get: () => 'value',
    });
    Object.defineProperty(arrayAccessor, '0', {
      enumerable: true,
      get: () => 'value',
    });
    Object.defineProperty(arrayHidden, 'hidden', {
      value: 'hidden',
    });
    arraySymbol[Symbol('hidden')] = true;
    circular.self = circular;

    for (const value of [
      undefined,
      -0,
      Number.NaN,
      Number.POSITIVE_INFINITY,
      new Date(0),
      new Map([['key', 'value']]),
      () => 'value',
      Symbol('value'),
      circular,
      sparse,
      subclass,
      symbolKey,
      accessor,
      arrayAccessor,
      arrayHidden,
      arraySymbol,
      customObject,
      crossRealmArraySubclass,
      crossRealmClass,
    ]) {
      assert.throws(() => field.serialize(value), /JSON-compatible data/);
    }
  });

  it('fails explicitly when local values have no persistence', () => {
    const local = defineStateField({
      key: 'local.panel',
      initial: () => 'closed',
    });

    assert.throws(() => local.serialize('open'), /does not define persistence/);
    assert.throws(
      () => local.deserialize({ value: 'open', version: 1 }),
      /does not define persistence/
    );
  });

  it('snapshots mutable persistence into stable state-field descriptors', () => {
    const persistence = {
      decode: (value: unknown) => String(value),
      encode: (value: string) => `original:${value}`,
      version: 1,
    };
    const field = defineStateField({
      initial: '',
      key: 'document.stable-codec',
      persist: persistence,
    });

    persistence.decode = () => 'mutated';
    persistence.encode = () => 'mutated';
    persistence.version = 2;

    assert.equal(Object.isFrozen(field.persist), true);
    assert.deepEqual(field.serialize('value'), {
      value: 'original:value',
      version: 1,
    });
    assert.equal(
      field.deserialize({ value: 'persisted', version: 1 }),
      'persisted'
    );
  });
});
