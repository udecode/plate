import {
  DocumentChange,
  type EditorDocumentValue,
  type InternalEditorSchemaApi,
  mapDetachedSelectionThroughChange,
  type Selection,
  SelectionApi,
} from '../facade';
import { getDocumentMigrationAuthoredCapability } from './documentMigrationAuthored.internal';
import type {
  DocumentMigrationContext,
  DocumentMigrationStepResult,
} from './documentMigrations';
import { migratePlateV54Ast } from './migratePlateV54Ast.internal';
import { migratePlateV54CodeBlocks } from './migratePlateV54CodeBlocks.internal';
import {
  type MigrationListSiblingOptions,
  migratePlateV54Profile,
} from './migratePlateV54Profile.internal';
import { migratePlateV54Suggestions } from './migratePlateV54Suggestions.internal';

export type MigratePlateV54Options = Readonly<{
  /** Frozen v53 list sibling policy used to interpret historical numbering. */
  list?: MigrationListSiblingOptions;
}>;

type PlateV54Shape = Readonly<{
  ast: EditorDocumentValue;
  codeBlocks: ReturnType<typeof migratePlateV54CodeBlocks>;
  document: EditorDocumentValue;
  profile: EditorDocumentValue;
}>;

const mapBetween = (
  schema: InternalEditorSchemaApi,
  selection: Selection,
  before: EditorDocumentValue,
  after: EditorDocumentValue
): Selection => {
  if (!selection) return selection;

  return mapDetachedSelectionThroughChange(
    schema,
    selection,
    DocumentChange.between(before, after),
    before,
    after,
    SelectionApi.root(selection) ?? 'main',
    { association: 'backward', preferPositionMapping: true }
  );
};

const shapeDocument = (
  context: DocumentMigrationContext,
  document: EditorDocumentValue,
  options: MigratePlateV54Options
): PlateV54Shape => {
  const profile = migratePlateV54Profile(
    { ...context, document },
    { list: options.list }
  );
  const ast = migratePlateV54Ast({ ...context, document: profile });
  const codeBlocks = migratePlateV54CodeBlocks({
    ...context,
    document: ast,
  });

  return Object.freeze({
    ast,
    codeBlocks,
    document: codeBlocks.document,
    profile,
  });
};

export type PlateV54Migration = (
  context: DocumentMigrationContext,
  options?: MigratePlateV54Options
) => DocumentMigrationStepResult;

/** Upgrade the frozen first-party Plate v53 document profile to v54. */
export const migrateV54: PlateV54Migration = (context, options = {}) => {
  const schema = context.target.schema as InternalEditorSchemaApi;
  const legacy = migratePlateV54Suggestions(
    context.document as EditorDocumentValue
  );
  const shapedSource = shapeDocument(
    context,
    context.document as EditorDocumentValue,
    options
  );

  if (!legacy) {
    const mapSelection: NonNullable<
      DocumentMigrationStepResult['mapSelection']
    > = ({ mappedSelection, selection }) => {
      const profileSelection = mapBetween(
        schema,
        selection,
        context.document as EditorDocumentValue,
        shapedSource.profile
      );
      const astSelection = mapBetween(
        schema,
        profileSelection,
        shapedSource.profile,
        shapedSource.ast
      );

      return (
        shapedSource.codeBlocks.mapSelection?.(astSelection, mappedSelection) ??
        mappedSelection
      );
    };

    return Object.freeze({
      document: shapedSource.document,
      ...(shapedSource.codeBlocks.mapSelection ? { mapSelection } : {}),
    });
  }

  const accepted = context.target.schema.fitDocument(
    shapeDocument(context, legacy.accepted, options).document
  );
  let previous = accepted;
  const revisions = legacy.revisions.map((revision) => {
    const proposed = context.target.schema.fitDocument(
      shapeDocument(context, revision.proposed, options).document
    );
    const change = DocumentChange.between(previous, proposed);

    previous = proposed;

    return Object.freeze({
      authorId: revision.authorId,
      change,
      createdAt: revision.createdAt,
      id: revision.id,
    });
  });
  const document = getDocumentMigrationAuthoredCapability(
    context.target
  ).createCheckpoint({
    accepted,
    revisions,
    schema,
  });

  return Object.freeze({
    document,
    mapSelection: ({ mappedSelection, selection }) => {
      const profileSelection = mapBetween(
        schema,
        selection,
        context.document as EditorDocumentValue,
        shapedSource.profile
      );
      const astSelection = mapBetween(
        schema,
        profileSelection,
        shapedSource.profile,
        shapedSource.ast
      );
      const shapedSelection = shapedSource.codeBlocks.mapSelection
        ? shapedSource.codeBlocks.mapSelection(astSelection, mappedSelection)
        : mapBetween(
            schema,
            astSelection,
            shapedSource.ast,
            shapedSource.document
          );

      return mapBetween(
        schema,
        shapedSelection,
        shapedSource.document,
        accepted
      );
    },
  });
};
