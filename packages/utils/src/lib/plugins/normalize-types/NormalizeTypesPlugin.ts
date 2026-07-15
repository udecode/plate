import { createBasePlugin, type PluginConfig } from '@platejs/core';
import { ElementApi, type Path } from '@platejs/plite';

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

export const NormalizeTypesPlugin = createBasePlugin<NormalizeTypesConfig>({
  key: KEYS.normalizeTypes,
  options: {
    rules: [],
  },
}).extendExtension(({ getOptions }) => ({
  normalizers: {
    editor({ next, tx }) {
      const { onError, rules = [] } = getOptions();

      const normalized = rules.some(({ path, strictType, type }) => {
        const entry = tx.nodes.get(path);
        const node = entry?.[0];

        if (node) {
          if (
            strictType &&
            ElementApi.isElement(node) &&
            node.type !== strictType
          ) {
            tx.nodes.set({ type: strictType }, { at: path });

            return true;
          }

          return false;
        }

        const nextType = strictType ?? type;

        if (!nextType) return false;

        try {
          tx.nodes.insert(
            { children: [{ text: '' }], type: nextType },
            { at: path }
          );

          return true;
        } catch (error) {
          onError?.(error);

          return false;
        }
      });

      if (normalized) return;

      next();
    },
  },
}));
