import {
  type Descendant,
  DocumentChange,
  type EditorDocumentValue,
  ElementApi,
  type InternalEditorSchemaApi,
  MAIN_ROOT_KEY,
  mapDetachedSelectionThroughChange,
  type Path,
  type Point,
  RangeApi,
  type Selection,
  SelectionApi,
} from '../facade';
import { getDocumentMigrationAuthoredCapability } from './documentMigrationAuthored.internal';
import type {
  DocumentMigrationContext,
  DocumentMigrationStepResult,
} from './documentMigrations';
import {
  historicalSelectionGeometry,
  landSelectionMarks,
  textAt,
} from './documentMigrationSelection.internal';
import { migratePlateV54Ast } from './migratePlateV54Ast.internal';
import { migratePlateV54CodeBlocks } from './migratePlateV54CodeBlocks.internal';
import { migratePlateV54Inputs } from './migratePlateV54Inputs.internal';
import { migratePlateV54Profile } from './migratePlateV54Profile.internal';
import {
  migratePlateV54RetiredMarks,
  retainedSelectionMarks,
} from './migratePlateV54RetiredMarks.internal';
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

type StageAssociation = 'backward' | 'inward';

const rootEntries = (document: EditorDocumentValue) => [
  [MAIN_ROOT_KEY, document.children] as const,
  ...Object.entries(document.roots ?? {}),
];

const freezeDeep = (value: unknown) => {
  if (value === null || typeof value !== 'object' || Object.isFrozen(value)) {
    return;
  }
  Object.freeze(value);
  Object.values(value).forEach(freezeDeep);
};

const createStageMapper = (
  schema: InternalEditorSchemaApi,
  before: EditorDocumentValue,
  after: EditorDocumentValue
) => {
  let change: DocumentChange | undefined;
  let kept: Map<Descendant, Readonly<{ path: Path; root: string }>> | undefined;
  const keptTexts = () => {
    if (kept) return kept;
    const texts = new Map<Descendant, Readonly<{ path: Path; root: string }>>();
    const repeated = new Set<Descendant>();
    const visit = (nodes: readonly Descendant[], root: string, parent: Path) =>
      nodes.forEach((node, index) => {
        const path = [...parent, index];

        if (ElementApi.isElement(node)) visit(node.children, root, path);
        else if (texts.has(node)) repeated.add(node);
        else texts.set(node, { path, root });
      });

    for (const [root, children] of rootEntries(after)) {
      visit(children, root, []);
    }
    repeated.forEach((node) => texts.delete(node));
    kept = texts;

    return texts;
  };
  const followText = (point: Point): Point | null => {
    const root = point.root ?? MAIN_ROOT_KEY;
    const children =
      root === MAIN_ROOT_KEY ? before.children : before.roots?.[root];
    const text = children && textAt(children, point.path);
    const target = text && keptTexts().get(text);

    return target?.root === root ? { ...point, path: target.path } : null;
  };

  return (selection: Selection, association: StageAssociation): Selection => {
    if (!selection || before === after) return selection;
    const anchor = RangeApi.isRange(selection)
      ? followText(selection.anchor)
      : null;
    const focus = RangeApi.isRange(selection)
      ? followText(selection.focus)
      : null;

    if (anchor && focus && RangeApi.isRange(selection)) {
      return { ...selection, anchor, focus };
    }
    if (!change) {
      freezeDeep(before);
      freezeDeep(after);
      change = DocumentChange.between(before, after);
    }
    const mapped = mapDetachedSelectionThroughChange(
      schema,
      selection,
      change,
      before,
      after,
      SelectionApi.root(selection) ?? 'main',
      { association, preferPositionMapping: true }
    );

    if ((!anchor && !focus) || !RangeApi.isRange(mapped)) return mapped;

    return {
      ...mapped,
      anchor: anchor ?? mapped.anchor,
      focus: focus ?? mapped.focus,
    };
  };
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
  const source = migratePlateV54RetiredMarks(context);
  const legacy = migratePlateV54Suggestions(source);
  const shapedSource = shapeDocument(context, source);
  const { ast, codeBlocks, inputs, profile, urls } = shapedSource;
  const toProfile = createStageMapper(schema, inputs.document, profile);
  const toAst = createStageMapper(schema, profile, ast);
  const toUrls = createStageMapper(schema, ast, urls.document);
  const toCodeBlocks = createStageMapper(
    schema,
    urls.document,
    codeBlocks.document
  );
  const mapThroughStages = (
    document: EditorDocumentValue,
    toDocument: (
      selection: Selection,
      association: StageAssociation
    ) => Selection
  ): Pick<DocumentMigrationStepResult, 'mapRanges' | 'mapSelection'> => {
    const mapStages = (
      inputSelection: Exclude<Selection, null>,
      association: StageAssociation
    ) => {
      const astSelection = toAst(
        toProfile(inputSelection, association),
        association
      );
      const urlDiff = () => toUrls(astSelection, association);
      const urlSelection = urls.mapSelection
        ? urls.mapSelection(astSelection, urlDiff)
        : urlDiff();
      const codeDiff = () => toCodeBlocks(urlSelection, association);

      return toDocument(
        codeBlocks.mapSelection
          ? codeBlocks.mapSelection(urlSelection, codeDiff)
          : codeDiff(),
        association
      );
    };

    return {
      mapRanges: ({ ranges }) =>
        ranges.map((range) => {
          const mapped = mapStages(
            SelectionApi.text(inputs.mapRange?.(range) ?? range),
            'inward'
          );

          return RangeApi.isRange(mapped)
            ? { anchor: mapped.anchor, focus: mapped.focus }
            : null;
        }),
      mapSelection: ({ selection: original }) => {
        const selection = historicalSelectionGeometry(original);
        const mapped = mapStages(
          inputs.mapSelection?.(selection) ?? selection,
          'backward'
        );
        const marks = retainedSelectionMarks(context.target, original);
        const unmoved =
          mapped === selection ||
          (RangeApi.isRange(mapped) &&
            RangeApi.isRange(selection) &&
            RangeApi.equals(mapped, selection));

        if (unmoved) {
          return SelectionApi.isText(original) && marks !== original.marks
            ? { ...original, marks }
            : original;
        }

        return landSelectionMarks(schema, mapped, marks, document);
      },
    };
  };

  if (!legacy) {
    return Object.freeze({
      document: shapedSource.document,
      ...mapThroughStages(shapedSource.document, (selection) => selection),
    });
  }

  // Asserts the target installs the authored plugin, whose schema keeps marks.
  const authored = getDocumentMigrationAuthoredCapability(context.target);
  const document = authored.repair(
    context.target.schema.fitDocument(
      shapeDocument(context, legacy.review).document
    )
  );

  if (authored.pending(document) !== legacy.changes) {
    throw new Error(
      'Plate v54 migration cannot convert legacy suggestions whose nodes the target schema reshapes.'
    );
  }
  try {
    const rejected = authored.projectDecided(document, 'accepted');

    if (!rejected.ok) throw new Error(rejected.diagnostics[0].message);
    context.target.schema.fitDocument(rejected.document);
  } catch (error) {
    throw new Error(
      'Plate v54 migration cannot convert legacy suggestions that the target schema could not reject.',
      { cause: error }
    );
  }

  return Object.freeze({
    document,
    ...mapThroughStages(
      document,
      createStageMapper(schema, shapedSource.document, document)
    ),
  });
};
