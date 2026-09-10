import type { EditorDocumentValue, Selection } from '../../facade';

type DocumentMigrationSelectionMapper = (
  selection: Selection,
  mapped: Selection
) => Selection;

const documentMigrationSelectionMappers = new WeakMap<
  EditorDocumentValue,
  DocumentMigrationSelectionMapper
>();

export const attachDocumentMigrationSelectionMapper = <
  TDocument extends EditorDocumentValue,
>(
  document: TDocument,
  mapper: DocumentMigrationSelectionMapper
): TDocument => {
  documentMigrationSelectionMappers.set(document, mapper);

  return document;
};

export const applyDocumentMigrationSelectionMapper = (
  document: EditorDocumentValue,
  selection: Selection,
  mapped: Selection
) =>
  documentMigrationSelectionMappers.get(document)?.(selection, mapped) ??
  mapped;
