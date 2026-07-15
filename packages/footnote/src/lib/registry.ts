import type { BaseEditor } from '@platejs/core';
import {
  type EditorUpdateTransaction,
  ElementApi,
  type NodeEntry,
  NodeApi,
  type Operation,
  type PathRef,
  PathApi,
} from '@platejs/plite';
import { KEYS } from '@platejs/utils';

import type { TFootnoteElement } from './types';

type FootnoteRegistry = {
  definitionsByIdentifier: Map<string, PathRef[]>;
  referencesByIdentifier: Map<string, PathRef[]>;
  dirty: boolean;
};

const FOOTNOTE_REGISTRY = new WeakMap<BaseEditor, FootnoteRegistry>();

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

const getRegistry = (editor: BaseEditor) => {
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

type FootnoteRegistryTransaction = Pick<EditorUpdateTransaction, 'refs'>;

const rebuildRegistry = (
  editor: BaseEditor,
  registry: FootnoteRegistry,
  tx?: FootnoteRegistryTransaction
) => {
  cleanupRegistry(registry);

  const definitionType = editor.getType(KEYS.footnoteDefinition);
  const referenceType = editor.getType(KEYS.footnoteReference);

  for (const [node, path] of editor.read.nodes.entries<TFootnoteElement>({
    at: [],
    match: { type: [definitionType, referenceType] },
  })) {
    const { identifier } = node;

    if (!identifier) continue;

    const ref = tx ? tx.refs.path(path) : editor.update.refs.path(path);

    if (node.type === definitionType) {
      const refs = registry.definitionsByIdentifier.get(identifier) ?? [];
      refs.push(ref);
      registry.definitionsByIdentifier.set(identifier, refs);

      continue;
    }

    const refs = registry.referencesByIdentifier.get(identifier) ?? [];
    refs.push(ref);
    registry.referencesByIdentifier.set(identifier, refs);
  }

  registry.dirty = false;
};

export const invalidateFootnoteRegistry = (editor: BaseEditor) => {
  getRegistry(editor).dirty = true;
};

export const shouldInvalidateFootnoteRegistry = (
  editor: BaseEditor,
  operation: Operation
) => {
  const definitionType = editor.getType(KEYS.footnoteDefinition);
  const referenceType = editor.getType(KEYS.footnoteReference);
  const isFootnoteType = (type?: string | null) =>
    type === definitionType || type === referenceType;
  if (operation.type === 'insert_node' || operation.type === 'remove_node') {
    for (const [node] of NodeApi.nodes(operation.node)) {
      if (ElementApi.isElement(node) && isFootnoteType(node.type)) {
        return true;
      }
    }

    return false;
  }

  if (operation.type === 'set_node') {
    const previousType =
      'type' in operation.properties &&
      typeof operation.properties.type === 'string'
        ? operation.properties.type
        : undefined;
    const nextType =
      'type' in operation.newProperties &&
      typeof operation.newProperties.type === 'string'
        ? operation.newProperties.type
        : undefined;

    if (
      isFootnoteType(previousType) ||
      isFootnoteType(nextType) ||
      'identifier' in operation.properties ||
      'identifier' in operation.newProperties
    ) {
      return true;
    }

    const current = editor.read.nodes.get<TFootnoteElement>(
      operation.path
    )?.[0];

    return isFootnoteType(current?.type);
  }

  return false;
};

export const ensureFootnoteRegistry = (
  editor: BaseEditor,
  tx?: FootnoteRegistryTransaction
) => {
  const registry = getRegistry(editor);

  if (registry.dirty) {
    rebuildRegistry(editor, registry, tx);
  }

  return registry;
};

export const getRegistryDefinition = (
  editor: BaseEditor,
  { identifier }: { identifier: string },
  tx?: FootnoteRegistryTransaction
) => {
  const definitions = getRegistryDefinitions(editor, { identifier }, tx);

  return definitions[0];
};

export const getRegistryReferences = (
  editor: BaseEditor,
  { identifier }: { identifier: string },
  tx?: FootnoteRegistryTransaction
) => {
  const registry = ensureFootnoteRegistry(editor, tx);
  const refs = registry.referencesByIdentifier.get(identifier) ?? [];
  const liveEntries: NodeEntry<TFootnoteElement>[] = [];
  const liveRefs: PathRef[] = [];

  for (const ref of refs) {
    const path = ref.current;

    if (!path) {
      ref.unref();
      continue;
    }

    const entry = editor.read.nodes.get<TFootnoteElement>(path);

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
  editor: BaseEditor,
  { identifier }: { identifier: string },
  tx?: FootnoteRegistryTransaction
) => {
  const registry = ensureFootnoteRegistry(editor, tx);
  const refs = registry.definitionsByIdentifier.get(identifier) ?? [];
  const liveEntries: NodeEntry<TFootnoteElement>[] = [];
  const liveRefs: PathRef[] = [];

  for (const ref of refs) {
    const path = ref.current;

    if (!path) {
      ref.unref();
      continue;
    }

    const entry = editor.read.nodes.get<TFootnoteElement>(path);

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

export const getRegistryIdentifiers = (editor: BaseEditor) => {
  const registry = ensureFootnoteRegistry(editor);

  return [...registry.definitionsByIdentifier.keys()];
};
