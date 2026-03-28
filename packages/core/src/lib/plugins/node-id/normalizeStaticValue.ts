import type { Value } from '@platejs/slate';
import cloneDeep from 'lodash/cloneDeep.js';

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

export const normalizeStaticValue = <V extends Value>(
  value: V,
  options: NormalizeStaticValueOptions = {}
): V => {
  const {
    createdAt = STATIC_VALUE_CREATED_AT,
    idCreator = createStaticIdFactory(),
    ...normalizeNodeIdOptions
  } = options;

  return replaceStaticMetadata(
    normalizeNodeId(cloneDeep(value), {
      ...normalizeNodeIdOptions,
      idCreator,
    }),
    createdAt
  ) as V;
};
