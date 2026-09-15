import { createAuthoredReviewDocument } from '../authored';
import { DocumentChange, MAIN_ROOT_KEY, SelectionApi } from '../facade';
import { attachDocumentMigrationSelectionMapper } from '../internal/plugin/documentMigrationSelection.internal';
import {
  mapDocumentSelection,
  prepareDocumentWithPlugin,
} from '../internal/plugin/pipePrepareDocument';
import type { DocumentMigration } from '../lib/editor/documentMigrations';
import { ElementIdPlugin } from '../lib/plugins/element-id/ElementIdPlugin';
import { migratePlateV54Ast } from './migratePlateV54Ast.internal';
import { migratePlateV54CodeBlocks } from './migratePlateV54CodeBlocks.internal';
import { migratePlateV54Profile } from './migratePlateV54Profile.internal';
import { migratePlateV54Suggestions } from './migratePlateV54Suggestions.internal';

/** Upgrade the frozen first-party Plate v53 document profile to v54. */
export const migrateV54: DocumentMigration = (context) => {
  const migrateShape = (document: typeof context.document) => {
    const profile = migratePlateV54Profile({ ...context, document });
    const ast = migratePlateV54Ast({ ...context, document: profile });
    const codeBlocks = migratePlateV54CodeBlocks({
      ...context,
      document: ast,
    });

    return { ast, codeBlocks };
  };
  const detectedLegacy = migratePlateV54Suggestions(context.document);
  const shaped = migrateShape(context.document);
  // Canonicalize the legacy tree before splitting it so shared elements keep
  // one persisted identity across accepted and proposed projections.
  const sourceDocument = detectedLegacy
    ? prepareDocumentWithPlugin(
        context.editor,
        shaped.codeBlocks.document,
        ElementIdPlugin.name
      )
    : context.document;
  const legacy =
    sourceDocument === context.document
      ? detectedLegacy
      : migratePlateV54Suggestions(sourceDocument);
  const { ast } = shaped;
  const mapCodeBlockSelection = shaped.codeBlocks.mapSelection;
  const acceptedDocument = legacy
    ? context.editor.read.schema.fitDocument(legacy.accepted)
    : shaped.codeBlocks.document;
  const document = legacy
    ? createAuthoredReviewDocument({
        accepted: acceptedDocument,
        revisions: (() => {
          let previous = acceptedDocument;

          return legacy.revisions.map((revision) => {
            const { proposed: sourceProposed, ...metadata } = revision;
            const proposed =
              context.editor.read.schema.fitDocument(sourceProposed);
            const change = DocumentChange.between(previous, proposed);

            previous = proposed;

            return { ...metadata, change };
          });
        })(),
      })
    : acceptedDocument;

  if (!mapCodeBlockSelection && !legacy) return document;

  return attachDocumentMigrationSelectionMapper(
    document,
    (selection, mapped) => {
      const root = SelectionApi.root(selection) ?? MAIN_ROOT_KEY;
      const astSelection = mapDocumentSelection(
        context.editor,
        selection,
        context.document,
        ast,
        root
      );

      const codeBlockSelection = mapCodeBlockSelection
        ? mapCodeBlockSelection(astSelection, mapped)
        : astSelection;

      return legacy
        ? mapDocumentSelection(
            context.editor,
            codeBlockSelection,
            sourceDocument,
            acceptedDocument,
            root
          )
        : codeBlockSelection;
    }
  );
};
