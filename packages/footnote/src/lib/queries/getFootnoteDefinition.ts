import type { NodeEntry, BasePlateEditor } from 'platejs';

import { KEYS, PathApi } from 'platejs';
import type { FootnoteElement } from '../types';

import {
  getRegistryDefinition,
  getRegistryDefinitions,
  getRegistryIdentifiers,
  ensureFootnoteRegistry,
} from '../registry';

export const getFootnoteDefinition = (
  editor: BasePlateEditor,
  { identifier }: { identifier: string }
) => getRegistryDefinition(editor, { identifier });

export const getFootnoteDefinitions = (editor: BasePlateEditor) =>
  [
    ...editor.api.nodes<FootnoteElement>({
      at: [],
      match: (node) =>
        (node as FootnoteElement).type ===
        editor.getType(KEYS.footnoteDefinition),
    }),
  ] as NodeEntry<FootnoteElement>[];

export const getFootnoteDefinitionsByIdentifier = (
  editor: BasePlateEditor,
  { identifier }: { identifier: string }
) => getRegistryDefinitions(editor, { identifier });

export const getDuplicateFootnoteDefinitions = (
  editor: BasePlateEditor,
  { identifier }: { identifier: string }
) => getRegistryDefinitions(editor, { identifier }).slice(1);

export const isFootnoteResolved = (
  editor: BasePlateEditor,
  { identifier }: { identifier: string }
) => getRegistryDefinitions(editor, { identifier }).length > 0;

export const hasDuplicateFootnoteDefinitions = (
  editor: BasePlateEditor,
  { identifier }: { identifier: string }
) => getRegistryDefinitions(editor, { identifier }).length > 1;

export const getDuplicateFootnoteIdentifiers = (editor: BasePlateEditor) => {
  const registry = ensureFootnoteRegistry(editor);

  return [...registry.definitionsByIdentifier.entries()]
    .filter(([, definitions]) => definitions.length > 1)
    .map(([identifier]) => identifier);
};

export const getFootnoteIdentifiers = (editor: BasePlateEditor) =>
  getRegistryIdentifiers(editor);

export const isDuplicateFootnoteDefinition = (
  editor: BasePlateEditor,
  { path }: { path: number[] }
) => {
  const entry = editor.api.node<FootnoteElement>(path);

  if (!entry) return false;

  const [node] = entry;
  const definitionType = editor.getType(KEYS.footnoteDefinition);

  if (node.type !== definitionType) return false;

  const identifier = node.identifier;

  if (!identifier) return false;

  return getRegistryDefinitions(editor, { identifier }).some(
    ([, definitionPath], index) =>
      index > 0 && PathApi.equals(definitionPath, path)
  );
};
