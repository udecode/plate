import type { Path } from 'slate';

import {
  type ErrorHandler,
  createPluginFactory,
} from '@udecode/plate-common/server';

import { withNormalizeTypes } from './withNormalizeTypes';

interface Rule {
  /** Path where the rule applies */
  path: Path;
  /** Force the type of the node at the given path */
  strictType?: string;
  /** Type of the inserted node at the given path if `strictType` is not provided */
  type?: string;
}

export interface NormalizeTypesPlugin extends ErrorHandler {
  /**
   * Set of rules for the types. For each rule, provide a `path` and either
   * `strictType` or `type`. If there is no node existing at `path`: insert a
   * node with `strictType`. If there is a node existing at `path` but its type
   * is not `strictType` or `type`: set the node type to `strictType` or
   * `type`.
   */
  rules?: Rule[];
}

export const KEY_NORMALIZE_TYPES = 'normalizeTypes';

/** @see {@link withNormalizeTypes} */
export const createNormalizeTypesPlugin =
  createPluginFactory<NormalizeTypesPlugin>({
    key: KEY_NORMALIZE_TYPES,
    options: {
      rules: [],
    },
    withOverrides: withNormalizeTypes,
  });
