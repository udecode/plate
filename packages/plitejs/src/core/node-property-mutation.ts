import type { SchemaPropertyHandle } from '../interfaces/schema';

const isPropertyHandle = (value: unknown): value is SchemaPropertyHandle =>
  typeof value === 'object' &&
  value !== null &&
  'kind' in value &&
  value.kind === 'schema-property';

const getExactPropertyKey = (
  property: string | SchemaPropertyHandle,
  resolve?: (
    property: SchemaPropertyHandle
  ) => SchemaPropertyHandle['key'] | undefined
): string => {
  const key =
    typeof property === 'string'
      ? property
      : (resolve?.(property) ?? property.key);

  if (typeof key !== 'string') {
    throw new TypeError(
      'Prefix schema-property handles cannot address one node property'
    );
  }

  return key;
};

export const normalizeNodeUnsetInput = (
  property: string | readonly string[] | SchemaPropertyHandle,
  resolve?: (
    property: SchemaPropertyHandle
  ) => SchemaPropertyHandle['key'] | undefined
): string | readonly string[] =>
  isPropertyHandle(property)
    ? getExactPropertyKey(property, resolve)
    : property;
