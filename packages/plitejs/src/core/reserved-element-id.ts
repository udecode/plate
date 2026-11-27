import type { CompiledSchemaProperty } from './schema-compiler';
import {
  createEditorSchemaValidationError,
  type EditorSchemaValidationLocation,
} from './schema-validation';

export const RESERVED_ELEMENT_ID_PROPERTY_ID = 'core:reserved-id';

const ELEMENT_ID_SCOPE_ALPHABET = '0123456789abcdefghijklmnopqrstuvwxyz';
const ELEMENT_ID_SCOPE_LENGTH = 12;
const ELEMENT_ID_SCOPE_UNIFORM_LIMIT =
  256 - (256 % ELEMENT_ID_SCOPE_ALPHABET.length);

export type ElementIdMint = Readonly<{
  next: () => string;
  scope: string;
}>;

const fillRandomBytes = (bytes: Uint8Array<ArrayBuffer>) => {
  if (typeof globalThis.crypto?.getRandomValues === 'function') {
    globalThis.crypto.getRandomValues(bytes);

    return;
  }

  for (let index = 0; index < bytes.length; index += 1) {
    bytes[index] = Math.floor(Math.random() * 256);
  }
};

const randomElementIdScope = (): string => {
  let scope = '';
  const bytes = new Uint8Array(24);

  while (scope.length < ELEMENT_ID_SCOPE_LENGTH) {
    fillRandomBytes(bytes);
    for (const byte of bytes) {
      if (byte >= ELEMENT_ID_SCOPE_UNIFORM_LIMIT) continue;
      scope += ELEMENT_ID_SCOPE_ALPHABET.charAt(
        byte % ELEMENT_ID_SCOPE_ALPHABET.length
      );
      if (scope.length === ELEMENT_ID_SCOPE_LENGTH) break;
    }
  }

  return scope;
};

// The scope is drawn on first use because every editor compiles a schema,
// including in a Next.js `cacheComponents` prerender, which fails on
// `crypto.getRandomValues` and `Math.random()`.
export const createElementIdMint = (): ElementIdMint => {
  let scope: string | undefined;
  let counter = 0;
  const scopeOf = () => {
    scope ??= randomElementIdScope();

    return scope;
  };

  return Object.freeze({
    next: () => {
      const value = `${scopeOf()}.${counter}`;

      counter += 1;

      return value;
    },
    get scope() {
      return scopeOf();
    },
  });
};

export type ScopedElementId = Readonly<{
  counter: number;
  scope: string;
}>;

export const parseScopedElementId = (id: string): ScopedElementId | null => {
  const dot = id.lastIndexOf('.');

  if (dot <= 0 || dot === id.length - 1) return null;

  const scope = id.slice(0, dot);
  const rawCounter = id.slice(dot + 1);

  if (rawCounter.length > 1 && rawCounter.charCodeAt(0) === 48) return null;

  for (let index = 0; index < rawCounter.length; index += 1) {
    const code = rawCounter.charCodeAt(index);

    if (code < 48 || code > 57) return null;
  }

  const counter = Number(rawCounter);

  if (!Number.isSafeInteger(counter) || counter < 0) return null;

  return { counter, scope };
};

export const isValidElementId = (value: unknown): value is string =>
  typeof value === 'string' && value.length > 0;

export function assertValidElementId(
  value: unknown,
  location: EditorSchemaValidationLocation
): asserts value is string {
  if (!isValidElementId(value)) {
    throw createEditorSchemaValidationError(
      'invalid-property-value',
      'Element property "id" must be a non-empty string.',
      location
    );
  }
}

export const createReservedElementIdProperty = (
  mint: ElementIdMint
): CompiledSchemaProperty =>
  Object.freeze({
    descriptor: Object.freeze({
      generate: mint.next,
      kind: 'string' as const,
      omitDefault: false,
      required: false,
      validate: isValidElementId,
      validationVersion: 1,
    }),
    exclusiveGroupIds: Object.freeze([]),
    id: RESERVED_ELEMENT_ID_PROPERTY_ID,
    key: 'id',
    lifecycle: Object.freeze({
      copy: 'drop' as const,
      inclusive: null,
      split: 'drop' as const,
      typeChange: 'preserve-if-allowed' as const,
      unique: true as const,
    }),
    merge: 'replace' as const,
    owner: 'core',
    placement: 'element' as const,
    role: 'metadata' as const,
    target: null,
  });
