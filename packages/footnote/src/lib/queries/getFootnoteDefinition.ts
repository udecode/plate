import type { BaseEditor } from '@platejs/core';
import type { EditorUpdateTransaction } from '@platejs/plite';
import { PathApi } from '@platejs/plite';
import { KEYS } from '@platejs/utils';

import {
  getRegistryDefinition,
  getRegistryDefinitions,
  getRegistryIdentifiers,
  ensureFootnoteRegistry,
} from '../registry';
import type { TFootnoteElement } from '../types';

export const getFootnoteDefinition = (
  editor: BaseEditor,
  { identifier }: { identifier: string },
  tx?: EditorUpdateTransaction
) => getRegistryDefinition(editor, { identifier }, tx);

export const getFootnoteDefinitions = (editor: BaseEditor) =>
  editor.read.nodes.toArray<TFootnoteElement>({
    at: [],
    match: { type: editor.getType(KEYS.footnoteDefinition) },
  });

export const getFootnoteDefinitionsByIdentifier = (
  editor: BaseEditor,
  { identifier }: { identifier: string },
  tx?: EditorUpdateTransaction
) => getRegistryDefinitions(editor, { identifier }, tx);

export const getDuplicateFootnoteDefinitions = (
  editor: BaseEditor,
  { identifier }: { identifier: string }
) => getRegistryDefinitions(editor, { identifier }).slice(1);

export const isFootnoteResolved = (
  editor: BaseEditor,
  { identifier }: { identifier: string }
) => getRegistryDefinitions(editor, { identifier }).length > 0;

export const hasDuplicateFootnoteDefinitions = (
  editor: BaseEditor,
  { identifier }: { identifier: string }
) => getRegistryDefinitions(editor, { identifier }).length > 1;

export const getDuplicateFootnoteIdentifiers = (editor: BaseEditor) => {
  const registry = ensureFootnoteRegistry(editor);

  return [...registry.definitionsByIdentifier.entries()]
    .filter(([, definitions]) => definitions.length > 1)
    .map(([identifier]) => identifier);
};

export const getFootnoteIdentifiers = (editor: BaseEditor) =>
  getRegistryIdentifiers(editor);

export const isDuplicateFootnoteDefinition = (
  editor: BaseEditor,
  { path }: { path: number[] },
  tx?: EditorUpdateTransaction
) => {
  const entry = editor.read.nodes.get<TFootnoteElement>(path);

  if (!entry) return false;

  const [node] = entry;
  const definitionType = editor.getType(KEYS.footnoteDefinition);

  if (node.type !== definitionType) return false;

  const { identifier } = node;

  if (!identifier) return false;

  return getRegistryDefinitions(editor, { identifier }, tx).some(
    ([, definitionPath], index) =>
      index > 0 && PathApi.equals(definitionPath, path)
  );
};
