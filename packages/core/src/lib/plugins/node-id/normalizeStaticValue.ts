import type { EditorDocumentValue, Value } from '@platejs/plite';

import type { NormalizeNodeIdOptions } from './NodeIdPlugin';

import { normalizeNodeId } from './NodeIdPlugin';

export const STATIC_VALUE_CREATED_AT = 1_704_067_200_000;

export type NormalizeStaticValueOptions = NormalizeNodeIdOptions & {
  createdAt?: number;
};

const createStaticIdFactory = () => {
  let id = 0;

  return () => `static-${String(++id).padStart(4, '0')}`;
};

const replaceStaticMetadata = (value: unknown, createdAt: number): unknown => {
  if (Array.isArray(value)) {
    return value.map((item) => replaceStaticMetadata(item, createdAt));
  }
  if (!value || typeof value !== 'object') {
    return value;
  }

  const next: Record<string, unknown> = {};

  for (const [key, nestedValue] of Object.entries(value)) {
    if (key === 'createdAt' && typeof nestedValue === 'number') {
      next[key] = createdAt;

      continue;
    }

    next[key] = replaceStaticMetadata(nestedValue, createdAt);
  }

  return next;
};

export const normalizeStaticValue = <T extends EditorDocumentValue | Value>(
  value: T,
  options: NormalizeStaticValueOptions = {}
): T => {
  const {
    createdAt = STATIC_VALUE_CREATED_AT,
    idCreator = createStaticIdFactory(),
    ...normalizeNodeIdOptions
  } = options;
  const normalize = <V extends Value>(children: V) =>
    normalizeNodeId(children, {
      ...normalizeNodeIdOptions,
      idCreator,
    });
  const normalized = Array.isArray(value)
    ? normalize(value)
    : {
        ...value,
        children: normalize(value.children),
        ...(value.roots
          ? {
              roots: Object.fromEntries(
                Object.entries(value.roots).map(([root, children]) => [
                  root,
                  normalize(children),
                ])
              ),
            }
          : {}),
      };

  return replaceStaticMetadata(normalized, createdAt) as T;
};
