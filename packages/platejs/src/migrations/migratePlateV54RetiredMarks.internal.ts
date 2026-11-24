import {
  type EditorDocumentValue,
  type EditorStateSchemaApi,
  getCompiledEditorSchemaFromApi,
  getCompiledPropertyCandidates,
  type Selection,
  SelectionApi,
  TextApi,
  type Value,
} from '../facade';
import type {
  DocumentMigrationContext,
  DocumentMigrationTarget,
} from './documentMigrations';
import {
  createPropertyOwnership,
  type NodeContext,
} from './migratePlateV54Ownership.internal';
import {
  isRecord,
  LEGACY_SUGGESTION_PREFIX,
} from './migratePlateV54Suggestions.internal';
import { V53_RETIRED_TEXT_MARKS } from './v53-manifest.internal';

const undeclaredRetiredMarks = (target: DocumentMigrationTarget) => {
  const compiled = getCompiledEditorSchemaFromApi(
    target.schema as EditorStateSchemaApi
  );

  return compiled
    ? [...V53_RETIRED_TEXT_MARKS].filter(
        (key) =>
          getCompiledPropertyCandidates(compiled, 'text', key).length === 0
      )
    : [];
};

const changedByLegacyUpdate = (
  properties: Readonly<Record<string, unknown>>,
  key: string
) =>
  Object.entries(properties).some(
    ([name, data]) =>
      (name === 'suggestion' || name.startsWith(LEGACY_SUGGESTION_PREFIX)) &&
      isRecord(data) &&
      [data.properties, data.newProperties].some(
        (changed) => isRecord(changed) && Object.hasOwn(changed, key)
      )
  );

const withoutKeys = <T extends Readonly<Record<string, unknown>>>(
  properties: T,
  keys: readonly string[]
): T => {
  if (!keys.some((key) => Object.hasOwn(properties, key))) return properties;
  const next: Record<string, unknown> = { ...properties };

  for (const key of keys) delete next[key];

  return next as T;
};

const V53_NODE_LISTS = ['caption', 'children'] as const;

export const migratePlateV54RetiredMarks = ({
  document,
  target,
}: Pick<
  DocumentMigrationContext,
  'document' | 'target'
>): EditorDocumentValue => {
  const retired = undeclaredRetiredMarks(target);

  if (retired.length === 0) return document;
  const { ownsProperty } = createPropertyOwnership(target);
  const migrateList = <T extends readonly unknown[]>(
    list: T,
    context: NodeContext
  ): T => {
    const next = list.map((node) => migrateNode(node, context));

    return next.every((node, index) => node === list[index])
      ? list
      : (next as unknown as T);
  };
  const migrateNode = (node: unknown, context: NodeContext): unknown => {
    if (TextApi.isText(node)) {
      return withoutKeys(
        node,
        retired.filter((key) => !changedByLegacyUpdate(node, key))
      );
    }
    if (typeof node !== 'object' || node === null) return node;
    const record = node as Readonly<Record<string, unknown>>;
    const type = String(record.type);
    const childContext = {
      ancestors: [type, ...context.ancestors],
      root: context.root,
    };
    const changed = V53_NODE_LISTS.flatMap((key) => {
      const list = record[key];

      if (
        !Array.isArray(list) ||
        (key === 'caption' && ownsProperty(type, key, context))
      ) {
        return [];
      }
      const migrated = migrateList(list, childContext);

      return migrated === list ? [] : [[key, migrated] as const];
    });

    return changed.length > 0
      ? { ...record, ...Object.fromEntries(changed) }
      : record;
  };
  const children = migrateList(document.children, {
    ancestors: [],
    root: null,
  });
  const roots = document.roots
    ? Object.fromEntries(
        Object.entries(document.roots).map(([root, rootChildren]) => [
          root,
          migrateList(rootChildren, { ancestors: [], root }) as Value,
        ])
      )
    : undefined;

  if (
    children === document.children &&
    (!roots ||
      Object.entries(roots).every(
        ([root, rootChildren]) => rootChildren === document.roots?.[root]
      ))
  ) {
    return document;
  }

  return { ...document, children, ...(roots ? { roots } : {}) };
};

export const retainedSelectionMarks = (
  target: DocumentMigrationTarget,
  selection: Exclude<Selection, null>
) =>
  SelectionApi.isText(selection) && selection.marks !== undefined
    ? withoutKeys(selection.marks, undeclaredRetiredMarks(target))
    : undefined;
