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
  DocumentMigrationSelectionContext,
  DocumentMigrationStepResult,
} from './documentMigrations';
import { migratePlateV54Ast } from './migratePlateV54Ast.internal';
import { migratePlateV54CodeBlocks } from './migratePlateV54CodeBlocks.internal';
import { migratePlateV54Inputs } from './migratePlateV54Inputs.internal';
import {
  type MigrationListSiblingOptions,
  migratePlateV54Profile,
} from './migratePlateV54Profile.internal';
import { migratePlateV54Suggestions } from './migratePlateV54Suggestions.internal';
import { migratePlateV54Urls } from './migratePlateV54Urls.internal';

export type MigratePlateV54Options = Readonly<{
  /** Frozen v53 list sibling policy used to interpret historical numbering. */
  list?: MigrationListSiblingOptions;
}>;

type PlateV54Shape = Readonly<{
  ast: EditorDocumentValue;
  codeBlocks: ReturnType<typeof migratePlateV54CodeBlocks>;
  document: EditorDocumentValue;
  inputs: ReturnType<typeof migratePlateV54Inputs>;
  profile: EditorDocumentValue;
  urls: ReturnType<typeof migratePlateV54Urls>;
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
  const inputs = migratePlateV54Inputs(document);
  const profile = migratePlateV54Profile(
    { ...context, document: inputs.document },
    { list: options.list }
  );
  const ast = migratePlateV54Ast({ ...context, document: profile });
  const urls = migratePlateV54Urls({ ...context, document: ast });
  const codeBlocks = migratePlateV54CodeBlocks({
    ...context,
    document: urls.document,
  });

  return Object.freeze({
    ast,
    codeBlocks,
    document: codeBlocks.document,
    inputs,
    profile,
    urls,
  });
};

export type PlateV54Migration = (
  context: DocumentMigrationContext,
  options?: MigratePlateV54Options
) => DocumentMigrationStepResult;

/**
 * Upgrade the frozen first-party Plate v53 document profile to v54. Links and
 * media whose stored URL the current schema rejects keep their label, caption,
 * alt text or file name as ordinary content.
 */
export const migrateV54: PlateV54Migration = (context, options = {}) => {
  const schema = context.target.schema as InternalEditorSchemaApi;
  const legacy = migratePlateV54Suggestions(context.document);
  const shapedSource = shapeDocument(context, context.document, options);
  // The code-block stage falls back to `mapped` outside code, so URL-stage
  // points must win there too.
  const mapThroughUrls = ({
    mappedSelection,
    selection,
  }: DocumentMigrationSelectionContext) => {
    const { inputs } = shapedSource;
    const inputSelection = inputs.mapSelection?.(selection) ?? selection;
    const profileSelection = mapBetween(
      schema,
      inputSelection,
      inputs.document,
      shapedSource.profile
    );
    const astSelection = mapBetween(
      schema,
      profileSelection,
      shapedSource.profile,
      shapedSource.ast
    );
    const { mapSelection: mapUrls } = shapedSource.urls;
    const mapped = inputs.mapSelection
      ? mapBetween(
          schema,
          inputSelection,
          inputs.document,
          shapedSource.document
        )
      : mappedSelection;

    if (!mapUrls) {
      return { mapped, urlSelection: astSelection };
    }

    return {
      mapped: mapUrls(astSelection, mapped),
      urlSelection: mapUrls(
        astSelection,
        mapBetween(
          schema,
          astSelection,
          shapedSource.ast,
          shapedSource.urls.document
        )
      ),
    };
  };

  if (!legacy) {
    const mapSelection: NonNullable<
      DocumentMigrationStepResult['mapSelection']
    > = (selectionContext) => {
      const { mapped, urlSelection } = mapThroughUrls(selectionContext);

      return (
        shapedSource.codeBlocks.mapSelection?.(urlSelection, mapped) ?? mapped
      );
    };

    return Object.freeze({
      document: shapedSource.document,
      ...(shapedSource.codeBlocks.mapSelection ||
      shapedSource.inputs.mapSelection ||
      shapedSource.urls.mapSelection
        ? { mapSelection }
        : {}),
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
    mapSelection: (selectionContext) => {
      const { mapped, urlSelection } = mapThroughUrls(selectionContext);
      const shapedSelection = shapedSource.codeBlocks.mapSelection
        ? shapedSource.codeBlocks.mapSelection(urlSelection, mapped)
        : mapBetween(
            schema,
            urlSelection,
            shapedSource.urls.document,
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
