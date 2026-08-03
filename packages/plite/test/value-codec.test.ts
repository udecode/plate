import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { runInNewContext } from 'node:vm';
import fc from 'fast-check';

import {
  createEditor,
  defineEffect,
  defineExtension,
  defineStateField,
  defineValueCodec,
} from '@platejs/plite';

const paragraph = (text: string) => ({
  type: 'paragraph',
  children: [{ text }],
});

const jsonCodec = defineValueCodec<unknown>({
  decode: (value) => value,
  encode: (value) => value,
  version: 1,
});

describe('editor value codec contract', () => {
  it('requires positive integer versions and codecs for shared values', () => {
    assert.throws(
      () =>
        defineValueCodec({
          decode: (value) => value,
          encode: (value) => value,
          version: 0,
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
      /requires a persistence codec/
    );
    assert.throws(
      () =>
        defineEffect({
          key: 'shared.missing-codec',
          collab: 'shared',
          collabReplay: 'live',
        }),
      /requires a persistence codec/
    );
  });

  it('rejects non-JSON codec output and unversioned persisted field data', () => {
    const field = defineStateField({
      key: 'document.payload',
      initial: () => null as unknown,
      persist: jsonCodec,
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
          extensions: [
            defineExtension('document-payload', { stateFields: [field] }),
          ] as const,
          initialValue: {
            children: [paragraph('body')],
            meta: { [field.key]: 'raw' },
          },
        }),
      /Invalid state field "document.payload" envelope/
    );
  });

  it('accepts shared JSON references while rejecting cycles', () => {
    const field = defineStateField({
      key: 'document.shared-payload',
      initial: () => null as unknown,
      persist: jsonCodec,
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
      initial: () => null as unknown,
      persist: jsonCodec,
    });
    const jsonValue = fc
      .jsonValue({ maxDepth: 4 })
      .map((value) => JSON.parse(JSON.stringify(value)) as unknown);

    fc.assert(
      fc.property(jsonValue, (value) => {
        const serialized = field.serialize(value);

        assert.deepEqual(serialized, { value, version: 1 });
        assert.deepEqual(field.deserialize(serialized), value);
      }),
      { numRuns: 100, seed: 0xc_0d_ec }
    );
  });

  it('accepts canonical JSON values created in another realm', () => {
    const field = defineStateField({
      key: 'document.cross-realm-json',
      initial: () => null as unknown,
      persist: jsonCodec,
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
      initial: () => null as unknown,
      persist: jsonCodec,
    });
    const sparse = Array.from({ length: 1 }) as unknown[];
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

  it('fails explicitly when local values have no persistence codec', () => {
    const local = defineStateField({
      key: 'local.panel',
      initial: () => 'closed',
    });

    assert.throws(
      () => local.serialize('open'),
      /does not define a persistence codec/
    );
    assert.throws(
      () => local.deserialize({ value: 'open', version: 1 }),
      /does not define a persistence codec/
    );
  });

  it('snapshots mutable codecs into stable state-field descriptors', () => {
    const codec = {
      decode: (value: unknown) => String(value),
      encode: (value: string) => `original:${value}`,
      version: 1,
    };
    const field = defineStateField({
      initial: '',
      key: 'document.stable-codec',
      persist: codec,
    });

    codec.decode = () => 'mutated';
    codec.encode = () => 'mutated';
    codec.version = 2;

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
