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

export const createElementIdMint = (): ElementIdMint => {
  const scope = randomElementIdScope();
  let counter = 0;

  return Object.freeze({
    next: () => {
      const value = `${scope}.${counter}`;

      counter += 1;

      return value;
    },
    scope,
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
