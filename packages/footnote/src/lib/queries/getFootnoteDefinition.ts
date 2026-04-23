import type { NodeEntry, SlateEditor, TElement } from 'platejs';

import { KEYS, PathApi } from 'platejs';

import {
  getRegistryDefinition,
  getRegistryDefinitions,
  getRegistryIdentifiers,
  ensureFootnoteRegistry,
} from '../registry';

export const getFootnoteDefinition = (
  editor: SlateEditor,
  { identifier }: { identifier: string }
) => getRegistryDefinition(editor, { identifier });

export const getFootnoteDefinitions = (editor: SlateEditor) =>
  [
    ...editor.api.nodes<TElement>({
      at: [],
      match: (node) =>
        (node as TElement).type === editor.getType(KEYS.footnoteDefinition),
    }),
  ] as NodeEntry<TElement>[];

export const getFootnoteDefinitionsByIdentifier = (
  editor: SlateEditor,
  { identifier }: { identifier: string }
) => getRegistryDefinitions(editor, { identifier });

export const getDuplicateFootnoteDefinitions = (
  editor: SlateEditor,
  { identifier }: { identifier: string }
) => getRegistryDefinitions(editor, { identifier }).slice(1);

export const isFootnoteResolved = (
  editor: SlateEditor,
  { identifier }: { identifier: string }
) => getRegistryDefinitions(editor, { identifier }).length > 0;

export const hasDuplicateFootnoteDefinitions = (
  editor: SlateEditor,
  { identifier }: { identifier: string }
) => getRegistryDefinitions(editor, { identifier }).length > 1;

export const getDuplicateFootnoteIdentifiers = (editor: SlateEditor) => {
  const registry = ensureFootnoteRegistry(editor);

  return [...registry.definitionsByIdentifier.entries()]
    .filter(([, definitions]) => definitions.length > 1)
    .map(([identifier]) => identifier);
};

export const getFootnoteIdentifiers = (editor: SlateEditor) =>
  getRegistryIdentifiers(editor);

export const isDuplicateFootnoteDefinition = (
  editor: SlateEditor,
  { path }: { path: number[] }
) => {
  const entry = editor.api.node<TElement>(path);

  if (!entry) return false;

  const [node] = entry;
  const definitionType = editor.getType(KEYS.footnoteDefinition);

  if (node.type !== definitionType) return false;

  const identifier = (node as TElement & { identifier?: string }).identifier;

  if (!identifier) return false;

  return getRegistryDefinitions(editor, { identifier }).some(
    ([, definitionPath], index) =>
      index > 0 && PathApi.equals(definitionPath, path)
  );
};
