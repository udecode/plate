import {
  createEditorSchemaValidationError,
  type EditorSchemaValidationLocation,
} from './schema-validation';

const ELEMENT_ID_SCOPE_ALPHABET = '0123456789abcdefghijklmnopqrstuvwxyz';
const ELEMENT_ID_SCOPE_LENGTH = 12;
const ELEMENT_ID_SCOPE_UNIFORM_LIMIT =
  256 - (256 % ELEMENT_ID_SCOPE_ALPHABET.length);

export type ElementIdMint = Readonly<{
  next: () => string;
  scope: string;
}>;

const randomElementIdScope = (): string => {
  let scope = '';
  const bytes = new Uint8Array(24);

  while (scope.length < ELEMENT_ID_SCOPE_LENGTH) {
    crypto.getRandomValues(bytes);
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
// `crypto.getRandomValues`, and in runtimes without Web Crypto; an editor that
// mints no id must need neither.
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

export function assertValidElementId(
  value: unknown,
  location: EditorSchemaValidationLocation
): asserts value is string {
  if (typeof value !== 'string' || value.length === 0) {
    throw createEditorSchemaValidationError(
      'invalid-property-value',
      'Element property "id" must be a non-empty string.',
      location
    );
  }
}
