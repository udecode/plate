import type { NodeEntry, PathRef, BasePlateEditor } from 'platejs';
import type { Operation } from '@platejs/plite';

import { KEYS, PathApi } from 'platejs';
import type { FootnoteElement } from './types';

type FootnoteRegistry = {
  definitionsByIdentifier: Map<string, PathRef[]>;
  referencesByIdentifier: Map<string, PathRef[]>;
  dirty: boolean;
};

const FOOTNOTE_REGISTRY = new WeakMap<BasePlateEditor, FootnoteRegistry>();

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

const getRegistry = (editor: BasePlateEditor) => {
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

const rebuildRegistry = (editor: BasePlateEditor, registry: FootnoteRegistry) => {
  cleanupRegistry(registry);

  const definitionType = editor.getType(KEYS.footnoteDefinition);
  const referenceType = editor.getType(KEYS.footnoteReference);

  for (const [, path] of editor.api.nodes<FootnoteElement>({
    at: [],
    match: (node) => {
      const type = (node as FootnoteElement).type;

      return type === definitionType || type === referenceType;
    },
  })) {
    const entry = editor.api.node<FootnoteElement>(path);

    if (!entry) continue;

    const [node] = entry;
    const identifier = node.identifier;

    if (!identifier) continue;

    const ref = editor.api.pathRef(path);

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

  for (const refs of registry.definitionsByIdentifier.values()) {
    refs.sort((a, b) => PathApi.compare(a.current!, b.current!));
  }

  for (const refs of registry.referencesByIdentifier.values()) {
    refs.sort((a, b) => PathApi.compare(a.current!, b.current!));
  }

  registry.dirty = false;
};

export const invalidateFootnoteRegistry = (editor: BasePlateEditor) => {
  getRegistry(editor).dirty = true;
};

const getOperationNodeType = (value: unknown) =>
  typeof value === 'object' &&
  value !== null &&
  'type' in value &&
  typeof value.type === 'string'
    ? value.type
    : undefined;

const hasOperationIdentifier = (value: unknown) =>
  typeof value === 'object' &&
  value !== null &&
  'identifier' in value &&
  value.identifier !== undefined;

export const shouldInvalidateFootnoteRegistry = (
  editor: BasePlateEditor,
  operation: Operation
) => {
  const definitionType = editor.getType(KEYS.footnoteDefinition);
  const referenceType = editor.getType(KEYS.footnoteReference);
  const isFootnoteType = (type?: string) =>
    type === definitionType || type === referenceType;

  if (operation.type === 'insert_node' || operation.type === 'remove_node') {
    return isFootnoteType(getOperationNodeType(operation.node));
  }

  if (operation.type === 'set_node') {
    if (
      isFootnoteType(getOperationNodeType(operation.properties)) ||
      isFootnoteType(getOperationNodeType(operation.newProperties)) ||
      hasOperationIdentifier(operation.properties) ||
      hasOperationIdentifier(operation.newProperties)
    ) {
      return true;
    }

    const current = editor.api.node<FootnoteElement>(operation.path)?.[0];

    return isFootnoteType(current?.type);
  }

  return false;
};

export const ensureFootnoteRegistry = (editor: BasePlateEditor) => {
  const registry = getRegistry(editor);

  if (registry.dirty) {
    rebuildRegistry(editor, registry);
  }

  return registry;
};

export const getRegistryDefinition = (
  editor: BasePlateEditor,
  { identifier }: { identifier: string }
) => {
  const definitions = getRegistryDefinitions(editor, { identifier });

  return definitions[0];
};

export const getRegistryReferences = (
  editor: BasePlateEditor,
  { identifier }: { identifier: string }
) => {
  const registry = ensureFootnoteRegistry(editor);
  const refs = registry.referencesByIdentifier.get(identifier) ?? [];
  const liveEntries: NodeEntry<FootnoteElement>[] = [];
  const liveRefs: PathRef[] = [];

  for (const ref of refs) {
    const path = ref.current;

    if (!path) {
      ref.unref();
      continue;
    }

    const entry = editor.api.node<FootnoteElement>(path);

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
  editor: BasePlateEditor,
  { identifier }: { identifier: string }
) => {
  const registry = ensureFootnoteRegistry(editor);
  const refs = registry.definitionsByIdentifier.get(identifier) ?? [];
  const liveEntries: NodeEntry<FootnoteElement>[] = [];
  const liveRefs: PathRef[] = [];

  for (const ref of refs) {
    const path = ref.current;

    if (!path) {
      ref.unref();
      continue;
    }

    const entry = editor.api.node<FootnoteElement>(path);

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

export const getRegistryIdentifiers = (editor: BasePlateEditor) => {
  const registry = ensureFootnoteRegistry(editor);

  return [...registry.definitionsByIdentifier.keys()];
};
