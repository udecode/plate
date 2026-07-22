import type { Descendant } from '../interfaces/node';
import { MAIN_ROOT_KEY } from '../internal/root-location';
import { assertEditorJsonValue, cloneEditorJsonValue } from './value-codec';

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
    return;
  }

  if (!isRecord(meta)) {
    throw new Error(
      '[Plite] initialValue.meta is invalid! Expected an object.'
    );
  }

  assertEditorJsonValue(meta, '[Plite] initialValue.meta');

  return cloneEditorJsonValue(meta);
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

    roots[key] = cloneEditorJsonValue([...value]) as Descendant[];
  }

  return roots;
};

export const normalizeEditorValue = (
  input: unknown
): NormalizedInitialValue => {
  if (input === undefined) {
    return {
      children: [],
      explicit: false,
      meta: undefined,
      roots: { [MAIN_ROOT_KEY]: [] as Descendant[] },
    };
  }

  if (Array.isArray(input)) {
    assertEditorJsonValue(input, '[Plite] initialValue');
    const children = cloneEditorJsonValue([...input]) as Descendant[];

    return {
      children,
      explicit: true,
      meta: undefined,
      roots: { [MAIN_ROOT_KEY]: children },
    };
  }

  if (!isRecord(input)) {
    throw new Error(
      '[Plite] initialValue is invalid! Expected a list of elements or a document value with children.'
    );
  }

  assertEditorJsonValue(input, '[Plite] initialValue');

  if (Array.isArray(input.children)) {
    assertEditorJsonValue(input.children, '[Plite] initialValue.children');
    if (input.roots !== undefined) {
      assertEditorJsonValue(input.roots, '[Plite] initialValue.roots');
    }

    const children = cloneEditorJsonValue([...input.children]) as Descendant[];
    const roots = cloneInitialExtraRoots(input.roots);

    return {
      children,
      explicit: true,
      meta: cloneDocumentMeta(input.meta),
      roots: { [MAIN_ROOT_KEY]: children, ...roots },
    };
  }

  throw new Error(
    '[Plite] initialValue is invalid! Expected a list of elements or a document value with children.'
  );
};
