import type { Descendant } from '../interfaces/node';
import { MAIN_ROOT_KEY } from '../internal/root-location';
import { cloneValue } from './clone';

export type NormalizedInitialValue = {
  children: Descendant[];
  explicit: boolean;
  roots: Record<string, Descendant[]>;
  state: Record<string, unknown> | undefined;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === 'object' && !Array.isArray(value);

export const cloneDocumentState = (
  state: unknown
): Record<string, unknown> | undefined => {
  if (state === undefined) {
    return;
  }

  if (!isRecord(state)) {
    throw new Error(
      '[Slate] initialValue.state is invalid! Expected an object.'
    );
  }

  return cloneValue(state);
};

const cloneInitialExtraRoots = (
  rootsInput: unknown
): Record<string, Descendant[]> => {
  if (rootsInput === undefined) {
    return {};
  }

  if (!isRecord(rootsInput)) {
    throw new Error(
      '[Slate] initialValue.roots is invalid! Expected an object.'
    );
  }

  const roots: Record<string, Descendant[]> = {};

  for (const [key, value] of Object.entries(rootsInput)) {
    if (key === MAIN_ROOT_KEY) {
      throw new Error(
        '[Slate] initialValue.roots.main is invalid. Use initialValue.children for the primary document.'
      );
    }

    if (!Array.isArray(value)) {
      throw new Error(
        `[Slate] initialValue.roots.${key} is invalid! Expected a list of elements.`
      );
    }

    roots[key] = cloneValue([...value]) as Descendant[];
  }

  return roots;
};

export const normalizeInitialValue = (
  input: unknown
): NormalizedInitialValue => {
  if (input === undefined) {
    return {
      children: [],
      explicit: false,
      roots: { [MAIN_ROOT_KEY]: [] as Descendant[] },
      state: undefined,
    };
  }

  if (Array.isArray(input)) {
    const children = cloneValue([...input]) as Descendant[];

    return {
      children,
      explicit: true,
      roots: { [MAIN_ROOT_KEY]: children },
      state: undefined,
    };
  }

  if (!isRecord(input)) {
    throw new Error(
      '[Slate] initialValue is invalid! Expected a list of elements or a document value with children.'
    );
  }

  if (Array.isArray(input.children)) {
    const children = cloneValue([...input.children]) as Descendant[];
    const roots = cloneInitialExtraRoots(input.roots);

    return {
      children,
      explicit: true,
      roots: { [MAIN_ROOT_KEY]: children, ...roots },
      state: cloneDocumentState(input.state),
    };
  }

  throw new Error(
    '[Slate] initialValue is invalid! Expected a list of elements or a document value with children.'
  );
};
