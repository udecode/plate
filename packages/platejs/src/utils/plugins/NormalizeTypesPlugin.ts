import { ElementApi, type Path } from '../../facade';
import { defineBasePlugin } from '../../lib/plugin/defineBasePlugin';
import type { DefinitionOf } from '../../lib/plugin/PluginDefinition';
import { PLUGINS } from '../plate-keys';

export type NormalizeTypesRule = {
  /** Path where the rule applies */
  path: Path;
  /** Force the type of the node at the given path */
  strictType?: string;
  /** Type of the inserted node at the given path if `strictType` is not provided */
  type?: string;
};

export type NormalizeTypesPluginState = {
  /**
   * Set of rules for the types. For each rule, provide a `path` and either
   * `strictType` or `type`. If there is no node existing at `path`: insert a
   * node with `strictType`. If there is a node existing at `path` but its type
   * is not `strictType` or `type`: set the node type to `strictType` or `type`.
   */
  rules: NormalizeTypesRule[];
  onError?: (err: unknown) => void;
};

const initialState: NormalizeTypesPluginState = {
  rules: [],
};

export const NormalizeTypesPlugin = defineBasePlugin(PLUGINS.normalizeTypes, {
  initialState,
  corrections: [
    {
      event: 'children',
      query: 'root',
      correct({ editor, tx }) {
        const { onError, rules = [] } = editor
          .plugin(NormalizeTypesPlugin)
          .store.get();

        rules.forEach(({ path, strictType, type }) => {
          const at = [...path];
          const entry = tx.nodes.get(at);
          const node = entry?.[0];

          if (node) {
            if (
              strictType &&
              ElementApi.isElement(node) &&
              node.type !== strictType
            ) {
              tx.nodes.set({ type: strictType }, { at });
            }

            return;
          }

          const nextType = strictType ?? type;

          if (!nextType) return;

          try {
            tx.nodes.insert(
              { children: [{ text: '' }], type: nextType },
              { at }
            );
          } catch (error) {
            onError?.(error);
          }
        });
      },
    },
  ],
});

export type NormalizeTypesDefinition = DefinitionOf<
  typeof NormalizeTypesPlugin
>;
