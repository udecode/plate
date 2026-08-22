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
  type Value,
} from '@platejs/plite';
import {
  failInvariant,
  getEditorCommitSnapshot,
  MAIN_ROOT_KEY,
} from '@platejs/plite/internal';
import { nanoid } from 'nanoid';

import { defineBasePlugin } from '../../plugin/defineBasePlugin';

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

export type ElementIdMigrationLocation = Readonly<{
  path: Path;
  root: RootKey;
}>;

export type ElementIdMigrationDuplicate = Readonly<{
  id: string;
  locations: readonly ElementIdMigrationLocation[];
}>;

export type MigrateElementIdsOptions = Readonly<{
  /** Convert legacy numeric IDs explicitly. */
  convertNumericId?: (
    id: number,
    location: ElementIdMigrationLocation
  ) => string;
  generateId: () => string;
  /** Legacy persisted property to read before canonicalizing to `id`. */
  sourceKey?: string;
}>;

export type MigrateElementIdsResult<TValue> = Readonly<{
  duplicates: readonly ElementIdMigrationDuplicate[];
  generated: number;
  value: TValue;
}>;

const assertElementId = (id: unknown, owner: string): string => {
  if (typeof id !== 'string' || id.length === 0) {
    throw new Error(`${owner} must be a non-empty string.`);
  }

  return id;
};

const rootChildren = (value: EditorDocumentValue, root: RootKey) =>
  root === MAIN_ROOT_KEY ? value.children : (value.roots?.[root] ?? []);

const documentRoots = (value: EditorDocumentValue): readonly RootKey[] => [
  MAIN_ROOT_KEY,
  ...Object.keys(value.roots ?? {}),
];

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

const collectElementIdLocations = (value: EditorDocumentValue) => {
  const locations = new Map<string, ElementIdMigrationLocation>();

  for (const root of documentRoots(value)) {
    const visit = (node: Descendant, path: Path) => {
      if (!ElementApi.isElement(node)) return;
      const rawId = node.id;

      if (rawId !== undefined) {
        const id = assertElementId(rawId, `Element ID at ${root}:[${path}]`);
        const existing = locations.get(id);

        if (existing) {
          throw new Error(
            `Duplicate element ID "${id}" at ${existing.root}:[${existing.path}] and ${root}:[${path}].`
          );
        }
        locations.set(id, { path, root });
      }
      node.children.forEach((child, index) => {
        visit(child, [...path, index]);
      });
    };

    rootChildren(value, root).forEach((node, index) => {
      visit(node, [index]);
    });
  }

  return locations;
};

export function migrateElementIds(
  value: Value,
  options: MigrateElementIdsOptions
): MigrateElementIdsResult<Value>;
export function migrateElementIds(
  value: EditorDocumentValue,
  options: MigrateElementIdsOptions
): MigrateElementIdsResult<EditorDocumentValue>;
export function migrateElementIds(
  value: EditorDocumentValue | Value,
  { convertNumericId, generateId, sourceKey = 'id' }: MigrateElementIdsOptions
): MigrateElementIdsResult<EditorDocumentValue | Value> {
  if (
    sourceKey.length === 0 ||
    sourceKey === 'children' ||
    sourceKey === 'type'
  ) {
    throw new Error(`Element ID sourceKey cannot be "${sourceKey}".`);
  }
  const locations = new Map<string, ElementIdMigrationLocation[]>();
  let generated = 0;
  const migrateRoot = (children: readonly Descendant[], root: RootKey) => {
    const visit = (node: Descendant, path: Path): Descendant => {
      if (!ElementApi.isElement(node)) return node;
      const rawId = Object.hasOwn(node, sourceKey) ? node[sourceKey] : node.id;
      const location = { path, root } as const;
      const id = (() => {
        if (rawId === undefined) {
          generated += 1;

          return assertElementId(
            generateId(),
            `Generated element ID at ${root}:[${path}]`
          );
        }
        if (typeof rawId === 'number') {
          if (!convertNumericId) {
            throw new Error(
              `Numeric element ID at ${root}:[${path}] requires convertNumericId.`
            );
          }

          return assertElementId(
            convertNumericId(rawId, location),
            `Converted element ID at ${root}:[${path}]`
          );
        }

        return assertElementId(rawId, `Element ID at ${root}:[${path}]`);
      })();
      const known = locations.get(id) ?? [];

      locations.set(id, [...known, location]);
      let changed = rawId !== id || sourceKey !== 'id';
      const innerChildren = node.children.map((child, index) => {
        const migrated = visit(child, [...path, index]);

        if (migrated !== child) changed = true;

        return migrated;
      });

      if (!changed) return node;
      if (sourceKey === 'id') return { ...node, children: innerChildren, id };
      const canonicalNode = { ...node, children: innerChildren, id } as Record<
        string,
        unknown
      >;

      delete canonicalNode[sourceKey];

      return canonicalNode as unknown as Element;
    };

    let changed = false;
    const migrated = children.map((node, index) => {
      const next = visit(node, [index]);

      if (next !== node) changed = true;

      return next;
    });

    return changed ? migrated : children;
  };
  const document: EditorDocumentValue = Array.isArray(value)
    ? { children: value }
    : (value as EditorDocumentValue);
  const children = migrateRoot(document.children, MAIN_ROOT_KEY) as Value;
  const roots = document.roots
    ? Object.fromEntries(
        Object.entries(document.roots).map(([root, rootValue]) => [
          root,
          migrateRoot(rootValue, root) as Value,
        ])
      )
    : undefined;
  const migratedDocument =
    children === document.children &&
    (!roots ||
      Object.entries(roots).every(
        ([root, rootValue]) => rootValue === document.roots?.[root]
      ))
      ? document
      : { ...document, children, ...(roots ? { roots } : {}) };
  const duplicates = [...locations]
    .filter(([, entries]) => entries.length > 1)
    .map(([id, entries]) => Object.freeze({ id, locations: entries }));

  return Object.freeze({
    duplicates: Object.freeze(duplicates),
    generated,
    value: Array.isArray(value) ? migratedDocument.children : migratedDocument,
  });
}

const elementIdInitialState: ElementIdPluginState = {
  generateId: () => nanoid(),
};

export const ElementIdPlugin = defineBasePlugin('elementId', {
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

    for (const root of documentRoots(value)) {
      roots.set(root, rootChildren(value, root));
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
          collectElementIdLocations(tx.value());
        },
        event: 'children',
        query: 'root',
      },
      {
        correct: ({ tx }) => {
          collectElementIdLocations(tx.value());
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
          for (const root of documentRoots(state.value())) {
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
      function id(element: Element): string;
      function id(key: NodeKey): string | undefined;
      function id(innerTarget: Element | NodeKey): string | undefined {
        if (typeof innerTarget === 'string') {
          if (!state.nodes.get(innerTarget)) return undefined;
          ensureRuntimeIndex();

          return nodeKeys.get(innerTarget);
        }

        return assertElementId(
          state.schema.getProperty(innerTarget, idProperty),
          'Element ID'
        );
      }

      return {
        entry(innerId: string): ElementIdEntry | undefined {
          const indexed = ensureRuntimeIndex().get(innerId);

          if (!indexed) return undefined;
          const value = state.value();
          const node = getDescendantAt(
            rootChildren(value, indexed.root),
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
    prepareDocument({ document, store }) {
      const result = migrateElementIds(document, {
        generateId: store.get().generateId,
      });

      if (result.duplicates.length > 0) {
        const duplicate = result.duplicates[0];
        const [first, second] = duplicate.locations;

        throw new Error(
          `Duplicate element ID "${duplicate.id}" at ${first.root}:[${first.path}] and ${second.root}:[${second.path}].`
        );
      }
      return result.value;
    },
  };
});
