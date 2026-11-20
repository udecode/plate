import type { AnyEditor as Editor, ContentSlice } from '../interfaces/editor';
import type { EditorJsonValue } from '../interfaces/json';
import { type Descendant, NodeApi } from '../interfaces/node';
import { getDefined } from '../internal/get-defined';
import {
  ContentSlice as ContentSliceValue,
  createDetachedContentSlice,
} from './content-slice';
import { getEditorRuntimeOwner } from './editor-runtime';
import {
  acceptsPropertyValue,
  generateElementPropertyValue,
} from './editor-schema';
import { getCompiledEditorSchema } from './plugin-registry';
import { MAIN_ROOT_KEY } from './public-root';
import {
  applyDocumentChangeStep,
  getActiveDocumentChangeBuilder,
} from './public-state';
import {
  type CompiledEditorSchema,
  type CompiledSchemaProperty,
  matchesCompiledSchemaTarget,
  uniquePropertiesOf,
} from './schema-compiler';
import { renameChange } from './unique-values';
import { snapshotEditorJsonValue } from './value-codec';
import { countCoreWork } from './work';

type Holder = Readonly<Record<string, unknown>>;

type Renames = ReadonlyMap<string, ReadonlyMap<unknown, string>>;

export type RenewedCopy = Readonly<{ slice: ContentSlice; sources: Renames }>;

const RENEWAL_OFF = new WeakSet<object>();

const holds = (
  schema: CompiledEditorSchema,
  node: Holder,
  { descriptor, key, target }: CompiledSchemaProperty
) =>
  typeof key === 'string' &&
  node[key] !== undefined &&
  matchesCompiledSchemaTarget(schema, target, {
    root: null,
    type: String(node.type),
  }) &&
  acceptsPropertyValue(descriptor, node[key]);

const referringOf = (schema: CompiledEditorSchema) => {
  const properties = [...schema.properties.byId.values()].flatMap((property) =>
    typeof property.key === 'string' && property.references
      ? [{ ...property, key: property.key, references: property.references }]
      : []
  );
  const of = (node: Holder) =>
    properties.filter((property) => holds(schema, node, property));
  const mapped = (node: Holder, names: Renames, sharedNames?: Renames) =>
    of(node).map(({ key, references }) => {
      let renamed = false;
      const value = references.map(node[key] as EditorJsonValue, (name) => {
        const to =
          names.get(references.key)?.get(name) ??
          sharedNames?.get(references.key)?.get(name);

        renamed ||= to !== undefined;

        return to;
      });

      return { key, renamed, value };
    });

  return { mapped, of, properties };
};

/**
 * Builds no path, so its work follows the number of nodes and not their
 * depth.
 */
const rebuild = (
  slice: ContentSlice,
  write: (node: Holder, copied: Record<string, unknown>) => void
) => {
  const roots: Record<string, readonly Descendant[]> = {};
  const copies: object[] = [roots];
  const copy = (nodes: readonly Descendant[]): readonly Descendant[] =>
    Object.freeze(
      nodes.map((node) => {
        const copied: Record<string, unknown> = { ...node };

        if (NodeApi.isElement(node)) {
          write(node, copied);
          copied.children = copy(node.children);
        }
        copies.push(copied);

        return copied as Descendant;
      })
    );
  const content = copy(slice.content);

  for (const [root, held] of Object.entries(slice.roots ?? {})) {
    roots[root] = copy(held);
  }

  return () => {
    for (const copied of copies) Object.freeze(copied);

    return createDetachedContentSlice(content, slice.openStart, slice.openEnd, {
      roots,
    });
  };
};

export const withRenewalOff = <A extends unknown[], T>(
  editor: Editor,
  land: (...landing: A) => T,
  ...landing: A
): T => {
  const owner = getEditorRuntimeOwner(editor);

  if (RENEWAL_OFF.has(owner)) return land(...landing);
  RENEWAL_OFF.add(owner);
  try {
    return land(...landing);
  } finally {
    RENEWAL_OFF.delete(owner);
  }
};

export const renewCopy = (
  editor: Editor,
  slice: ContentSlice,
  separateCopies: readonly ContentSlice[] = []
) => {
  const schema = getCompiledEditorSchema(editor);
  const referring = referringOf(schema);
  const unique = uniquePropertiesOf(schema);
  const keys = new Set(
    referring.properties.map(({ references }) => references.key)
  );

  if (keys.size === 0 || RENEWAL_OFF.has(getEditorRuntimeOwner(editor))) {
    return null;
  }

  const sources = new Map<string, Map<unknown, string>>();
  const renew = (copy: ContentSlice, sharedNames?: Renames) => {
    const fresh = new Map<string, Map<string, string>>();
    const naming: Array<Record<string, unknown>> = [];
    const renewed = rebuild(
      ContentSliceValue.fromJSON(copy),
      (node, copied) => {
        countCoreWork('renewalVisits');
        for (const key of keys) {
          const name = node[key];
          const property = getDefined(unique.get(key));

          if (typeof name !== 'string' || !holds(schema, node, property)) {
            continue;
          }

          const value = generateElementPropertyValue(property) as string;
          const byName = fresh.get(key) ?? new Map<string, string>();

          if (!byName.has(name)) byName.set(name, value);
          fresh.set(key, byName);
          sources.set(key, (sources.get(key) ?? new Map()).set(value, name));
          copied[key] = value;
        }
        if (referring.of(node).length > 0) naming.push(copied);
      }
    );

    if (fresh.size === 0 && !sharedNames) return { slice: copy };
    for (const copied of naming) {
      for (const { key, value } of referring.mapped(
        copied,
        fresh,
        sharedNames
      )) {
        copied[key] = snapshotEditorJsonValue(value, 'Content slice');
      }
    }

    return { names: fresh.size > 0 ? fresh : undefined, slice: renewed() };
  };
  const whole = renew(slice);
  const renewed = separateCopies.map((copy) => renew(copy, whole.names).slice);

  return sources.size === 0
    ? null
    : { separateCopies: renewed, slice: whole.slice, sources };
};

export const restoreDroppedNames = (
  editor: Editor,
  { sources }: RenewedCopy
) => {
  const referring = referringOf(getCompiledEditorSchema(editor));
  const draft = getActiveDocumentChangeBuilder(editor);
  const dropped = new Map(
    [...sources].map(([key, sourceByDrawn]) => [key, new Map(sourceByDrawn)])
  );
  const naming: Array<[root: string, from: number, node: Holder]> = [];

  draft.change.iterChangedRanges((named, _fromA, _toA, from, to) => {
    const root = named ?? MAIN_ROOT_KEY;

    if (from === to) return;
    draft.getIndex(root).elementsOpeningIn(from, to, (node, at) => {
      countCoreWork('renewalVisits');
      for (const [key, sourceByDrawn] of dropped) {
        sourceByDrawn.delete(node[key]);
      }
      if (referring.properties.some(({ key }) => node[key] !== undefined)) {
        naming.push([root, at, node]);
      }
    });
  });
  if ([...dropped.values()].every(({ size }) => size === 0)) return null;

  const writes = naming.flatMap(([root, from, node]) =>
    referring
      .mapped(node, dropped)
      .flatMap(({ key, renamed, value }) =>
        renamed ? [{ from, key, root, value }] : []
      )
  );

  if (writes.length === 0) return null;
  applyDocumentChangeStep(
    editor,
    draft.apply(renameChange(writes, (root) => draft.getIndex(root)))
  );

  return dropped;
};

export const renameSlice = (
  editor: Editor,
  slice: ContentSlice,
  to: Renames
) => {
  const referring = referringOf(getCompiledEditorSchema(editor));

  return rebuild(slice, (node, copied) => {
    for (const { key, value } of referring.mapped(node, to)) {
      copied[key] = snapshotEditorJsonValue(value, 'Content slice');
    }
  })();
};
