import type { DocumentChangeRootClassification } from '../../src/core/change/classification';
import {
  createInternalDocumentChange,
  getInternalDocumentChangeEntries,
  getInternalDocumentRootChange,
  type DocumentChange,
} from '../../src/core/change/document-change';
import type { RootChange } from '../../src/core/change/root-change';

type TestDocumentChangeInput = Readonly<{
  createRoots?: Iterable<string>;
  deleteRoots?: Iterable<string>;
  primary?: RootChange | null;
  primaryClassification?: DocumentChangeRootClassification | null;
  rootClassifications?: ReadonlyMap<string, DocumentChangeRootClassification>;
  roots?: ReadonlyMap<string, RootChange>;
}>;

export const createTestDocumentChange = (
  input: TestDocumentChangeInput = {}
) => {
  const changes = new Map(input.roots ?? []);
  const classifications = new Map(input.rootClassifications ?? []);

  if (input.primary && !input.primary.empty) {
    changes.set('main', input.primary);
  }
  if (input.primaryClassification) {
    classifications.set('main', input.primaryClassification);
  }

  return createInternalDocumentChange(changes, {
    classifications,
    createRoots: input.createRoots,
    deleteRoots: input.deleteRoots,
  });
};

export const getTestDocumentRootChange = (
  change: DocumentChange,
  root = 'main'
) => getInternalDocumentRootChange(change, root);

export const getTestDocumentChangeEntries = (change: DocumentChange) => [
  ...getInternalDocumentChangeEntries(change),
];

export const getTestDocumentRootChanges = (change: DocumentChange) =>
  new Map(
    getTestDocumentChangeEntries(change).filter(([root]) => root !== 'main')
  );
