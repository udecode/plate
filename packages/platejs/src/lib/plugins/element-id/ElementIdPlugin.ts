import { nanoid } from 'nanoid';

import {
  type Descendant,
  type EditorDocumentValue,
  type EditorStateView,
  type Element,
  ElementApi,
  type Path,
  property,
  type RootKey,
  type NodeKey,
  schema,
  target,
  getEditorCommitSnapshot,
  MAIN_ROOT_KEY,
} from '../../../facade';
import { failInvariant } from '../../../internal/failInvariant';
import { definePlugin } from '../../plugin/definePlugin';
import {
  assertElementIds,
  elementIdDocumentRoots,
  elementIdRootChildren,
} from './elementIdAdmission.internal';

export type ElementIdPluginState = {
  /** Generate one persisted ID for a newly materialized element. */
  generateId: () => string;
};

export type ElementIdEntry = Readonly<{
  key: NodeKey;
  node: Element;
  path: Path;
  root: RootKey;
}>;

const getDescendantAt = (
  children: readonly Descendant[],
  path: Path
): Descendant | undefined => {
  let currentChildren = children;
  let node: Descendant | undefined;

  for (const index of path) {
    node = currentChildren[index];
    if (!node) return undefined;
    currentChildren = ElementApi.isElement(node) ? node.children : [];
  }

  return node;
};

const elementIdInitialState: ElementIdPluginState = {
  generateId: () => nanoid(),
};

export const ElementIdPlugin = definePlugin('elementId', {
  initialState: elementIdInitialState,
  schema: ({ initialState }) => ({
    properties: {
      id: schema.elementProperty(
        property.string({ generate: initialState.generateId }),
        {
          copy: 'drop',
          role: 'metadata',
          split: 'drop',
          target: target.group('element'),
          typeChange: 'preserve-if-allowed',
        }
      ),
    },
  }),
}).extend((context) => {
  const idProperty = context.schema.properties.id;
  let runtimeIndex: Map<
    string,
    Readonly<{
      path: Path;
      root: RootKey;
      nodeKey: NodeKey;
    }>
  > | null = null;
  let runtimeIndexRoots: ReadonlyMap<RootKey, readonly Descendant[]> | null =
    null;
  const nodeKeys = new Map<NodeKey, string>();
  const collectRuntimeRoots = (value: EditorDocumentValue) => {
    const roots = new Map<RootKey, readonly Descendant[]>();

    for (const root of elementIdDocumentRoots(value)) {
      roots.set(root, elementIdRootChildren(value, root));
    }

    return roots;
  };
  const hasCurrentRuntimeRoots = (
    roots: ReadonlyMap<RootKey, readonly Descendant[]>
  ) =>
    runtimeIndexRoots?.size === roots.size &&
    [...roots].every(
      ([root, children]) => runtimeIndexRoots?.get(root) === children
    );
  const indexRuntimeChildren = (
    state: Pick<EditorStateView, 'key' | 'schema'>,
    root: RootKey,
    children: readonly Descendant[],
    ids: Map<string, Readonly<{ path: Path; root: RootKey; nodeKey: NodeKey }>>,
    reverse: Map<NodeKey, string>
  ) => {
    const visit = (nodes: readonly Descendant[], parentPath: Path) => {
      nodes.forEach((node, index) => {
        if (!ElementApi.isElement(node)) return;

        const path = [...parentPath, index];
        const nodeKey = state.key(node);
        const id = state.schema.getProperty(node, idProperty);

        if (typeof id === 'string') {
          const existing = ids.get(id);

          if (existing) {
            throw new Error(
              `Duplicate element ID "${id}" at ${existing.root}:[${existing.path}] and ${root}:[${path}].`
            );
          }
          ids.set(id, { path, root, nodeKey });
          reverse.set(nodeKey, id);
        }
        visit(node.children, path);
      });
    };

    visit(children, []);
  };
  return {
    corrections: [
      {
        correct: ({ tx }) => {
          assertElementIds(tx.value());
        },
        event: 'children',
        query: 'root',
      },
      {
        correct: ({ tx }) => {
          assertElementIds(tx.value());
        },
        event: 'properties',
        query: 'root',
      },
    ],
    on: {
      commit({ commit, editor }) {
        if (!runtimeIndex) return;
        const changedNodeKeys = new Set([
          ...commit.changed.nodeKeysAll('node'),
          ...commit.changed.nodeKeysAll('path'),
        ]);

        for (const nodeKey of changedNodeKeys) {
          const id = nodeKeys.get(nodeKey);

          if (id) runtimeIndex.delete(id);
          nodeKeys.delete(nodeKey);
        }
        editor.read((state) => {
          for (const root of elementIdDocumentRoots(state.value())) {
            const publicRoot = root === MAIN_ROOT_KEY ? undefined : root;
            const rootNodeKeys = new Set([
              ...commit.changed.nodeKeys('node', publicRoot),
              ...commit.changed.nodeKeys('path', publicRoot),
            ]);
            const snapshot = getEditorCommitSnapshot(commit, root);

            for (const nodeKey of rootNodeKeys) {
              const path = snapshot.index.pathOf(nodeKey);

              if (!path) continue;
              const node = getDescendantAt(snapshot.children, path);

              if (!ElementApi.isElement(node)) continue;
              const id = state.schema.getProperty(node, idProperty);

              if (typeof id !== 'string') continue;
              const existing = (
                runtimeIndex ?? failInvariant('Expected value to be defined')
              ).get(id);

              if (existing && existing.nodeKey !== nodeKey) {
                throw new Error(`Duplicate element ID "${id}".`);
              }
              (
                runtimeIndex ?? failInvariant('Expected value to be defined')
              ).set(id, { path, root, nodeKey });
              nodeKeys.set(nodeKey, id);
            }
          }
          runtimeIndexRoots = collectRuntimeRoots(state.value());
        });
      },
    },
    read: ({ state }) => {
      const ensureRuntimeIndex = () => {
        const roots = collectRuntimeRoots(state.value());

        if (runtimeIndex && hasCurrentRuntimeRoots(roots)) {
          return runtimeIndex;
        }
        const ids = new Map<
          string,
          Readonly<{ path: Path; root: RootKey; nodeKey: NodeKey }>
        >();
        const reverse = new Map<NodeKey, string>();
        for (const [root, children] of roots) {
          indexRuntimeChildren(state, root, children, ids, reverse);
        }
        runtimeIndex = ids;
        runtimeIndexRoots = roots;
        nodeKeys.clear();
        for (const [nodeKey, id] of reverse) nodeKeys.set(nodeKey, id);

        return ids;
      };
      const id = (key: NodeKey): string | undefined => {
        if (!state.nodes.get(key)) return undefined;
        ensureRuntimeIndex();

        return nodeKeys.get(key);
      };

      return {
        entry(innerId: string): ElementIdEntry | undefined {
          const indexed = ensureRuntimeIndex().get(innerId);

          if (!indexed) return undefined;
          const value = state.value();
          const node = getDescendantAt(
            elementIdRootChildren(value, indexed.root),
            indexed.path
          );

          return ElementApi.isElement(node)
            ? Object.freeze({
                key: indexed.nodeKey,
                node,
                path: indexed.path,
                root: indexed.root,
              })
            : undefined;
        },
        id,
      };
    },
  };
});
