import {
  createEditorPlugin,
  type PluginConfig,
  type EditorPlugin,
} from '@platejs/core';
import type { Path } from '@platejs/plite';

import { KEYS } from '../../plate-keys';

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
    onError?: (err: unknown) => void;
  }
>;

type Rule = {
  /** Path where the rule applies */
  path: Path;
  /** Force the type of the node at the given path */
  strictType?: string;
  /** Type of the inserted node at the given path if `strictType` is not provided */
  type?: string;
};

export const NormalizeTypesPlugin: EditorPlugin<NormalizeTypesConfig> =
  Object.assign(
    createEditorPlugin<NormalizeTypesConfig>({
      key: KEYS.normalizeTypes,
      options: {
        rules: [],
      },
    }),
    { runtimeNormalizeTypes: true }
  );
