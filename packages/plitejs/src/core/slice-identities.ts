import type { Value } from '../interfaces';
import type {
  ContentSlice as ContentSliceType,
  Editor,
  EditorDocumentValue,
} from '../interfaces/editor';
import { type Descendant, NodeApi } from '../interfaces/node';
import type { SchemaContentRootOwnership } from '../interfaces/schema';
import { getDefined } from '../internal/get-defined';
import { isDocumentRootKey } from './change/document-change';
import { ContentSlice } from './content-slice';
import { rewriteContentRootReferences } from './content-slice-roots';
import { getEditorSchema } from './editor-runtime';
import { contentProgramsEqual } from './editor-schema';
import {
  getActiveDocumentChangeBuilder,
  getTransactionSnapshot,
  getUpdateStartValue,
  nextCopiedRootName,
  takenRootNames,
} from './public-state';
import type { CompiledSchemaContentProgram } from './schema-compiler';
import { isBoundToSharedRoom } from './shared-room';

export type RenewedRoot = Readonly<{
  landsAs: string;
  kind: 'aliased' | 'cloned' | 'created';
}>;

export type RenewedContentSlice<V extends Value = Value> = Readonly<{
  bySliceKey: ReadonlyMap<string, RenewedRoot>;
  slice: ContentSliceType<V>;
}>;

type Grammar = Readonly<{
  content: CompiledSchemaContentProgram;
  ownership: SchemaContentRootOwnership;
}>;

const NO_ROOTS: ReadonlyMap<string, RenewedRoot> = new Map();

export const aliasedRoots = ({
  bySliceKey,
}: Readonly<{
  bySliceKey: ReadonlyMap<string, RenewedRoot>;
}>): ReadonlySet<string> =>
  new Set(
    [...bySliceKey.values()].flatMap(({ kind, landsAs }) =>
      kind === 'aliased' ? [landsAs] : []
    )
  );

const agree = (grammars: readonly Grammar[]) =>
  grammars.length > 0 &&
  grammars.every(
    ({ content, ownership }) =>
      ownership === 'shared' &&
      contentProgramsEqual(grammars[0].content, content)
  );

const sliceGrammars = <V extends Value>(
  editor: Editor<V>,
  slice: ContentSliceType<V>
) => {
  const schema = getEditorSchema(editor);
  const grammars = new Map<string, Grammar[]>();
  const visit = (nodes: readonly Descendant[]) => {
    for (const node of nodes) {
      if (!NodeApi.isElement(node)) continue;

      for (const { content, ownership, root } of schema.getElementOwnedRoots(
        node
      )) {
        grammars.set(root, [
          ...(grammars.get(root) ?? []),
          { content, ownership },
        ]);
      }
      visit(node.children);
    }
  };

  visit(slice.content);
  for (const children of Object.values(slice.roots ?? {})) visit(children);

  return grammars;
};

const rootAndEnclosingRoots = <V extends Value>(
  editor: Editor<V>,
  value: EditorDocumentValue,
  root: string
) => {
  const around = new Set([root]);

  if (root === 'main') return around;
  const ownerRoots = getEditorSchema(editor).readContentRootOwnerRoots(value);

  for (const inner of around) {
    for (const outer of ownerRoots.get(inner) ?? []) around.add(outer);
  }

  return around;
};

const residentGrammars = <V extends Value>(
  editor: Editor<V>,
  draft: EditorDocumentValue,
  start: () => EditorDocumentValue | undefined
) => {
  const schema = getEditorSchema(editor);

  return (root: string) => {
    const updateStart = start();

    return [
      ...schema.readRootGrammars(root, draft),
      ...(updateStart ? schema.readRootGrammars(root, updateStart) : []),
    ];
  };
};

const keptRoots = <V extends Value>(
  editor: Editor<V>,
  slice: ContentSliceType<V>,
  target: string
) => {
  const kept = new Map<string, 'aliased' | 'created'>();

  if (isBoundToSharedRoom(editor)) return kept;
  const schema = getEditorSchema(editor);
  const draft = getActiveDocumentChangeBuilder(editor)
    .value as EditorDocumentValue;
  const reserved = getTransactionSnapshot(editor)?.reservedRoots;
  const declared = sliceGrammars(editor, slice);
  let updateStart: EditorDocumentValue | undefined;
  const start = () => (updateStart ??= getUpdateStartValue(editor));
  const resident = residentGrammars(editor, draft, start);

  for (const root of Object.keys(slice.roots ?? {})) {
    const owners = declared.get(root) ?? [];

    if (!isDocumentRootKey(root) || !agree(owners)) continue;
    const held =
      draft.roots && Object.hasOwn(draft.roots, root)
        ? draft.roots[root]
        : undefined;
    const residents = held ? resident(root) : [];

    if (residents.length > 0) {
      if (agree([...owners, ...residents])) kept.set(root, 'aliased');
      continue;
    }
    if (schema.getRootContent(root, draft) !== null) continue;
    if (!held) {
      if (!reserved?.has(root)) kept.set(root, 'created');
    } else if (
      [held, start()?.roots?.[root]].every(
        (children) =>
          !children ||
          schema.holdsRootContent(root, children, getDefined(owners[0]).content)
      )
    ) {
      kept.set(root, 'aliased');
    }
  }
  if ([...kept.values()].includes('aliased')) {
    for (const root of rootAndEnclosingRoots(editor, draft, target)) {
      if (kept.get(root) === 'aliased') kept.delete(root);
    }
  }

  return kept;
};

const reachedRoots = <V extends Value>(
  editor: Editor<V>,
  content: readonly Descendant[],
  roots: Readonly<Record<string, readonly Descendant[]>>,
  unentered: ReadonlySet<string>
) => {
  const schema = getEditorSchema(editor);
  const reached = new Set<string>();
  const visit = (nodes: readonly Descendant[]) => {
    for (const node of nodes) {
      if (!NodeApi.isElement(node)) continue;

      for (const { root } of schema.getElementOwnedRoots(node)) {
        if (reached.has(root) || !Object.hasOwn(roots, root)) continue;
        reached.add(root);
        if (!unentered.has(root)) visit(getDefined(roots[root]));
      }
      visit(node.children);
    }
  };

  visit(content);

  return reached;
};

export const renewContentSlice = <V extends Value>(
  editor: Editor<V>,
  slice: ContentSliceType<V>,
  target: string
): RenewedContentSlice<V> => {
  if (!slice.roots || Object.keys(slice.roots).length === 0) {
    return { bySliceKey: NO_ROOTS, slice };
  }

  const sourceRoots = slice.roots;
  const kept = keptRoots(editor, slice, target);
  const taken = takenRootNames(editor);
  const renewed = new Map<string, RenewedRoot>();

  for (const root of kept.keys()) taken.add(root);
  for (const root of Object.keys(sourceRoots).sort()) {
    const name = nextCopiedRootName(editor, root, taken);
    const kind = kept.get(root);

    renewed.set(
      root,
      kind ? { kind, landsAs: root } : { kind: 'cloned', landsAs: name }
    );
  }

  const aliased = aliasedRoots({ bySliceKey: renewed });

  if (aliased.size > 0) {
    const landing = reachedRoots(editor, slice.content, sourceRoots, aliased);

    for (const root of reachedRoots(
      editor,
      slice.content,
      sourceRoots,
      new Set()
    )) {
      if (!landing.has(root)) renewed.delete(root);
    }
  }

  const rewrite = (children: readonly Descendant[]) =>
    rewriteContentRootReferences(
      editor,
      children,
      (root) => renewed.get(root)?.landsAs ?? root
    );
  const roots = Object.freeze(
    Object.fromEntries(
      [...renewed].flatMap(([source, { kind, landsAs }]) =>
        kind === 'aliased'
          ? []
          : [[landsAs, rewrite(getDefined(sourceRoots[source]))]]
      )
    )
  );

  return {
    bySliceKey: renewed,
    slice: ContentSlice.fromJSON<V>({
      content: rewrite(slice.content),
      openEnd: slice.openEnd,
      openStart: slice.openStart,
      roots,
    }),
  };
};
