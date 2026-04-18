import type { NodeEntry, PathRef, SlateEditor, TElement } from 'platejs';

import { KEYS, PathApi } from 'platejs';

type FootnoteRegistry = {
  definitionsByIdentifier: Map<string, PathRef[]>;
  referencesByIdentifier: Map<string, PathRef[]>;
  dirty: boolean;
};

const FOOTNOTE_REGISTRY = new WeakMap<SlateEditor, FootnoteRegistry>();

const cleanupRegistry = (registry: FootnoteRegistry) => {
  for (const refs of registry.definitionsByIdentifier.values()) {
    for (const ref of refs) {
      ref.unref();
    }
  }

  for (const refs of registry.referencesByIdentifier.values()) {
    for (const ref of refs) {
      ref.unref();
    }
  }

  registry.definitionsByIdentifier.clear();
  registry.referencesByIdentifier.clear();
};

const getRegistry = (editor: SlateEditor) => {
  let registry = FOOTNOTE_REGISTRY.get(editor);

  if (!registry) {
    registry = {
      definitionsByIdentifier: new Map(),
      referencesByIdentifier: new Map(),
      dirty: true,
    };
    FOOTNOTE_REGISTRY.set(editor, registry);
  }

  return registry;
};

const rebuildRegistry = (editor: SlateEditor, registry: FootnoteRegistry) => {
  cleanupRegistry(registry);

  const definitionType = editor.getType(KEYS.footnoteDefinition);
  const referenceType = editor.getType(KEYS.footnoteReference);

  for (const [, path] of editor.api.nodes<TElement>({
    at: [],
    match: (node) => {
      const type = (node as TElement).type;

      return type === definitionType || type === referenceType;
    },
  })) {
    const entry = editor.api.node<TElement>(path);

    if (!entry) continue;

    const [node] = entry;
    const identifier = (node as TElement & { identifier?: string }).identifier;

    if (!identifier) continue;

    const ref = editor.api.pathRef(path);

    if ((node as TElement).type === definitionType) {
      const refs = registry.definitionsByIdentifier.get(identifier) ?? [];
      refs.push(ref);
      registry.definitionsByIdentifier.set(identifier, refs);

      continue;
    }

    const refs = registry.referencesByIdentifier.get(identifier) ?? [];
    refs.push(ref);
    registry.referencesByIdentifier.set(identifier, refs);
  }

  for (const refs of registry.definitionsByIdentifier.values()) {
    refs.sort((a, b) => PathApi.compare(a.current!, b.current!));
  }

  for (const refs of registry.referencesByIdentifier.values()) {
    refs.sort((a, b) => PathApi.compare(a.current!, b.current!));
  }

  registry.dirty = false;
};

export const invalidateFootnoteRegistry = (editor: SlateEditor) => {
  getRegistry(editor).dirty = true;
};

export const shouldInvalidateFootnoteRegistry = (
  editor: SlateEditor,
  operation: any
) => {
  const definitionType = editor.getType(KEYS.footnoteDefinition);
  const referenceType = editor.getType(KEYS.footnoteReference);
  const isFootnoteType = (type?: string) =>
    type === definitionType || type === referenceType;

  if (operation.type === 'insert_node' || operation.type === 'remove_node') {
    return isFootnoteType(operation.node?.type);
  }

  if (operation.type === 'set_node') {
    if (
      isFootnoteType(operation.properties?.type) ||
      isFootnoteType(operation.newProperties?.type) ||
      operation.properties?.identifier !== undefined ||
      operation.newProperties?.identifier !== undefined
    ) {
      return true;
    }

    const current = editor.api.node<TElement>(operation.path)?.[0];

    return isFootnoteType((current as TElement | undefined)?.type);
  }

  return false;
};

export const ensureFootnoteRegistry = (editor: SlateEditor) => {
  const registry = getRegistry(editor);

  if (registry.dirty) {
    rebuildRegistry(editor, registry);
  }

  return registry;
};

export const getRegistryDefinition = (
  editor: SlateEditor,
  { identifier }: { identifier: string }
) => {
  const definitions = getRegistryDefinitions(editor, { identifier });

  return definitions[0];
};

export const getRegistryReferences = (
  editor: SlateEditor,
  { identifier }: { identifier: string }
) => {
  const registry = ensureFootnoteRegistry(editor);
  const refs = registry.referencesByIdentifier.get(identifier) ?? [];
  const liveEntries: NodeEntry<TElement>[] = [];
  const liveRefs: PathRef[] = [];

  for (const ref of refs) {
    const path = ref.current;

    if (!path) {
      ref.unref();
      continue;
    }

    const entry = editor.api.node<TElement>(path);

    if (!entry) {
      ref.unref();
      continue;
    }

    liveEntries.push(entry);
    liveRefs.push(ref);
  }

  liveEntries.sort((a, b) => PathApi.compare(a[1], b[1]));
  registry.referencesByIdentifier.set(identifier, liveRefs);

  return liveEntries;
};

export const getRegistryDefinitions = (
  editor: SlateEditor,
  { identifier }: { identifier: string }
) => {
  const registry = ensureFootnoteRegistry(editor);
  const refs = registry.definitionsByIdentifier.get(identifier) ?? [];
  const liveEntries: NodeEntry<TElement>[] = [];
  const liveRefs: PathRef[] = [];

  for (const ref of refs) {
    const path = ref.current;

    if (!path) {
      ref.unref();
      continue;
    }

    const entry = editor.api.node<TElement>(path);

    if (!entry) {
      ref.unref();
      continue;
    }

    liveEntries.push(entry);
    liveRefs.push(ref);
  }

  liveEntries.sort((a, b) => PathApi.compare(a[1], b[1]));
  registry.definitionsByIdentifier.set(identifier, liveRefs);

  return liveEntries;
};

export const getRegistryIdentifiers = (editor: SlateEditor) => {
  const registry = ensureFootnoteRegistry(editor);

  return [...registry.definitionsByIdentifier.keys()];
};
