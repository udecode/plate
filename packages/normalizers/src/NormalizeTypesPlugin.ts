import type { Path } from 'slate';

import {
  type ErrorHandler,
  type PluginConfig,
  createTPlugin,
} from '@udecode/plate-common';

import { withNormalizeTypes } from './withNormalizeTypes';

interface Rule {
  /** Path where the rule applies */
  path: Path;
  /** Force the type of the node at the given path */
  strictType?: string;
  /** Type of the inserted node at the given path if `strictType` is not provided */
  type?: string;
}

export type NormalizeTypesConfig = PluginConfig<
  'normalizeTypes',
  {
    /**
     * Set of rules for the types. For each rule, provide a `path` and either
     * `strictType` or `type`. If there is no node existing at `path`: insert a
     * node with `strictType`. If there is a node existing at `path` but its
     * type is not `strictType` or `type`: set the node type to `strictType` or
     * `type`.
     */
    rules?: Rule[];
  } & ErrorHandler
>;

/** @see {@link withNormalizeTypes} */
export const NormalizeTypesPlugin = createTPlugin<NormalizeTypesConfig>({
  key: 'normalizeTypes',
  options: {
    rules: [],
  },
  withOverrides: withNormalizeTypes,
});
