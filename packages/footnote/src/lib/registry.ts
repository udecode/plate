import type { BaseEditor } from '@platejs/core';
import {
  type Anchor,
  type Descendant,
  type EditorDocumentValue,
  type EditorTransactionChanged,
  ElementApi,
  type NodeEntry,
  NodeApi,
  type Path,
  PathApi,
} from '@platejs/plite';
import { KEYS } from '@platejs/utils';

import type { TFootnoteElement } from './types';

type FootnoteRegistry = {
  definitionsByIdentifier: Map<string, Anchor<Path>[]>;
  referencesByIdentifier: Map<string, Anchor<Path>[]>;
  dirty: boolean;
};

const FOOTNOTE_REGISTRY = new WeakMap<BaseEditor, FootnoteRegistry>();

const cleanupRegistry = (registry: FootnoteRegistry) => {
  for (const refs of registry.definitionsByIdentifier.values()) {
    for (const ref of refs) {
      ref.release();
    }
  }

  for (const refs of registry.referencesByIdentifier.values()) {
    for (const ref of refs) {
      ref.release();
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

const rebuildRegistry = (editor: BaseEditor, registry: FootnoteRegistry) => {
  cleanupRegistry(registry);

  const definitionType = editor.getType(KEYS.footnoteDefinition);
  const referenceType = editor.getType(KEYS.footnoteReference);

  for (const [node, path] of editor.read.nodes.entries<TFootnoteElement>({
    at: [],
    match: { type: [definitionType, referenceType] },
  })) {
    const { identifier } = node;

    if (!identifier) continue;

    const ref = editor.anchor(path, {
      association: 'forward',
      deletion: 'drop',
    });

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
  before: EditorDocumentValue,
  after: EditorDocumentValue,
  changed: EditorTransactionChanged
) => {
  if (changed.has('structure')) return true;
  if (!changed.has('properties')) return false;

  const definitionType = editor.getType(KEYS.footnoteDefinition);
  const referenceType = editor.getType(KEYS.footnoteReference);
  const containsFootnote = (node: Descendant) => {
    for (const [candidate] of NodeApi.nodes(node)) {
      if (
        ElementApi.isElement(candidate) &&
        (candidate.type === definitionType || candidate.type === referenceType)
      ) {
        return true;
      }
    }

    return false;
  };
  const nodeAt = (
    value: EditorDocumentValue,
    path: readonly number[]
  ): Descendant | null => {
    let children = value.children as readonly Descendant[];
    let node: Descendant | undefined;

    for (const index of path) {
      node = children[index];

      if (!node) return null;
      children = ElementApi.isElement(node) ? node.children : [];
    }

    return node ?? null;
  };
  const affectedPaths = changed.paths();

  for (const path of affectedPaths) {
    if (path.length === 0) {
      if (
        before.children.some((node) => containsFootnote(node)) ||
        after.children.some((node) => containsFootnote(node))
      ) {
        return true;
      }

      continue;
    }

    const previousNode = nodeAt(before, path);
    const nextNode = nodeAt(after, path);

    if (
      (previousNode && containsFootnote(previousNode)) ||
      (nextNode && containsFootnote(nextNode))
    ) {
      return true;
    }
  }

  return false;
};

export const ensureFootnoteRegistry = (editor: BaseEditor) => {
  const registry = getRegistry(editor);

  if (registry.dirty) {
    rebuildRegistry(editor, registry);
  }

  return registry;
};

export const getRegistryDefinition = (
  editor: BaseEditor,
  { identifier }: { identifier: string }
) => {
  const definitions = getRegistryDefinitions(editor, { identifier });

  return definitions[0];
};

export const getRegistryReferences = (
  editor: BaseEditor,
  { identifier }: { identifier: string }
) => {
  const registry = ensureFootnoteRegistry(editor);
  const refs = registry.referencesByIdentifier.get(identifier) ?? [];
  const liveEntries: NodeEntry<TFootnoteElement>[] = [];
  const liveRefs: Anchor<Path>[] = [];

  for (const ref of refs) {
    const path = ref.resolve();

    if (!path) {
      ref.release();
      continue;
    }

    const entry = editor.read.nodes.get<TFootnoteElement>(path);

    if (!entry) {
      ref.release();
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
  { identifier }: { identifier: string }
) => {
  const registry = ensureFootnoteRegistry(editor);
  const refs = registry.definitionsByIdentifier.get(identifier) ?? [];
  const liveEntries: NodeEntry<TFootnoteElement>[] = [];
  const liveRefs: Anchor<Path>[] = [];

  for (const ref of refs) {
    const path = ref.resolve();

    if (!path) {
      ref.release();
      continue;
    }

    const entry = editor.read.nodes.get<TFootnoteElement>(path);

    if (!entry) {
      ref.release();
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
