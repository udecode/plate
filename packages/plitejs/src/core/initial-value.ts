import type { Descendant } from '../interfaces/node';
import { MAIN_ROOT_KEY } from '../internal/root-location';
import { snapshotEditorJsonValue } from './value-codec';

export type NormalizedInitialValue = {
  children: Descendant[];
  explicit: boolean;
  meta: Record<string, unknown> | undefined;
  roots: Record<string, Descendant[]>;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === 'object' && !Array.isArray(value);

export const cloneDocumentMeta = (
  meta: unknown
): Record<string, unknown> | undefined => {
  if (meta === undefined) {
    return undefined;
  }

  if (!isRecord(meta)) {
    throw new Error(
      '[Plite] initialValue.meta is invalid! Expected an object.'
    );
  }

  return snapshotEditorJsonValue(meta, '[Plite] initialValue.meta');
};

const cloneInitialExtraRoots = (
  rootsInput: unknown
): Record<string, Descendant[]> => {
  if (rootsInput === undefined) {
    return {};
  }

  if (!isRecord(rootsInput)) {
    throw new Error(
      '[Plite] initialValue.roots is invalid! Expected an object.'
    );
  }

  const roots: Record<string, Descendant[]> = {};

  for (const [key, value] of Object.entries(rootsInput)) {
    if (key === MAIN_ROOT_KEY) {
      throw new Error(
        '[Plite] initialValue.roots.main is invalid. Use initialValue.children for the primary document.'
      );
    }

    if (!Array.isArray(value)) {
      throw new Error(
        `[Plite] initialValue.roots.${key} is invalid! Expected a list of elements.`
      );
    }

    roots[key] = value as Descendant[];
  }

  return Object.freeze(roots);
};

export const normalizeEditorValue = (
  input: unknown
): NormalizedInitialValue => {
  if (input === undefined) {
    const children = Object.freeze([]) as unknown as Descendant[];

    return {
      children,
      explicit: false,
      meta: undefined,
      roots: Object.freeze({ [MAIN_ROOT_KEY]: children }),
    };
  }

  if (Array.isArray(input)) {
    const children = snapshotEditorJsonValue(
      input,
      '[Plite] initialValue'
    ) as Descendant[];

    return {
      children,
      explicit: true,
      meta: undefined,
      roots: Object.freeze({ [MAIN_ROOT_KEY]: children }),
    };
  }

  if (!isRecord(input)) {
    throw new Error(
      '[Plite] initialValue is invalid! Expected a list of elements or a document value with children.'
    );
  }

  const value = snapshotEditorJsonValue(input, '[Plite] initialValue');

  if (Array.isArray(value.children)) {
    const children = value.children as Descendant[];
    const roots = cloneInitialExtraRoots(value.roots);

    if (value.meta !== undefined && !isRecord(value.meta)) {
      throw new Error(
        '[Plite] initialValue.meta is invalid! Expected an object.'
      );
    }

    return {
      children,
      explicit: true,
      meta: value.meta,
      roots: Object.freeze({ [MAIN_ROOT_KEY]: children, ...roots }),
    };
  }

  throw new Error(
    '[Plite] initialValue is invalid! Expected a list of elements or a document value with children.'
  );
};
