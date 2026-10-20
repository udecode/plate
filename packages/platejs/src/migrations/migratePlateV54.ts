import { projectAuthoredDocument } from '../authored';
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
import { migratePlateV54Inputs } from './migratePlateV54Inputs.internal';
import { migratePlateV54Profile } from './migratePlateV54Profile.internal';
import { migratePlateV54Suggestions } from './migratePlateV54Suggestions.internal';
import { migratePlateV54Urls } from './migratePlateV54Urls.internal';

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
  document: EditorDocumentValue
): PlateV54Shape => {
  const inputs = migratePlateV54Inputs({ ...context, document });
  const profile = migratePlateV54Profile({
    ...context,
    document: inputs.document,
  });
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
  context: DocumentMigrationContext
) => DocumentMigrationStepResult;

/**
 * Upgrade the frozen first-party Plate v53 document profile to v54. Links and
 * media whose stored URL the current schema rejects keep their label, caption,
 * alt text or file name as ordinary content.
 */
export const migrateV54: PlateV54Migration = (context) => {
  const schema = context.target.schema as InternalEditorSchemaApi;
  const legacy = migratePlateV54Suggestions(context.document);
  const shapedSource = shapeDocument(context, context.document);
  // One diff across stages that rename some blocks and restructure others
  // replaces everything between them, so the selection follows each stage.
  const mapThroughStages = (selection: Selection) => {
    const { ast, codeBlocks, inputs, profile, urls } = shapedSource;
    const inputSelection = inputs.mapSelection?.(selection) ?? selection;
    const astSelection = mapBetween(
      schema,
      mapBetween(schema, inputSelection, inputs.document, profile),
      profile,
      ast
    );
    const urlDiff = mapBetween(schema, astSelection, ast, urls.document);
    const urlSelection = urls.mapSelection?.(astSelection, urlDiff) ?? urlDiff;
    const codeDiff = mapBetween(
      schema,
      urlSelection,
      urls.document,
      codeBlocks.document
    );

    return codeBlocks.mapSelection?.(urlSelection, codeDiff) ?? codeDiff;
  };

  if (!legacy) {
    return Object.freeze({
      document: shapedSource.document,
      mapSelection: ({ selection }) => mapThroughStages(selection),
    });
  }

  // Asserts the target installs the authored plugin, whose schema keeps marks.
  getDocumentMigrationAuthoredCapability(context.target);
  const document = context.target.schema.fitDocument(
    shapeDocument(context, legacy.review).document
  );

  if (
    projectAuthoredDocument(document, { projection: 'proposed' }).pending !==
    legacy.changes
  ) {
    throw new Error(
      'Plate v54 migration cannot convert legacy suggestions whose nodes the target schema reshapes.'
    );
  }
  try {
    context.target.schema.fitDocument(
      projectAuthoredDocument(document, { projection: 'accepted' }).document
    );
  } catch (error) {
    throw new Error(
      'Plate v54 migration cannot convert legacy suggestions that the target schema could not reject.',
      { cause: error }
    );
  }

  return Object.freeze({
    document,
    mapSelection: ({ selection }) =>
      mapBetween(
        schema,
        mapThroughStages(selection),
        shapedSource.document,
        document
      ),
  });
};
