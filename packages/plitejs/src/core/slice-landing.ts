import { createEditorViewRuntime } from '../editor-runtime-view';
import type {
  ContentSlice,
  Editor,
  EditorStateView,
  TransactionSpec,
  Value,
} from '../interfaces/editor';
import { NodeApi } from '../interfaces/node';
import { getDefined } from '../internal/get-defined';
import { ContentSlice as ContentSliceValue } from './content-slice';
import type { ReplaceSliceCommand } from './editor-commands';
import { editorReads } from './editor-reads';
import {
  type EditorRuntimeCarrier,
  getEditorRuntimeOwner,
  getEditorSchema,
} from './editor-runtime';
import { getCompiledEditorSchemaFromApi } from './editor-schema';
import { limitSliceToLength, sliceFitsLength } from './insert-limit';
import { renewCopy, type RenewedCopy } from './landed-names';
import { MAIN_ROOT_KEY } from './public-root';
import {
  fitSliceAtSite,
  readAtSliceFitSite,
  resolveSliceFitSite,
  type SliceFitSite,
} from './public-state';
import { executeEditorRead } from './read-registry';
import { dissolveOpenEndMatter } from './slice-end-matter';
import { identityKeysOf, replacesEmptyBlockHead } from './slice-fit/edge-plan';
import type {
  SliceLanding,
  SliceLandingInput,
  SliceLandingTarget,
} from './slice-landing-types';

export type PastePlan = Readonly<{
  copy: RenewedCopy | null;
  drop?: true;
  emptyBlockReplacement: ContentSlice | null;
  inputCut: boolean;
  landingCut: boolean;
  site: SliceFitSite;
  slice: ContentSlice | null;
}>;

export const readSliceLanding = <V extends Value>(
  editor: Editor<V>,
  input: SliceLandingInput
): SliceLanding => {
  const { root } = input.target;

  return executeEditorRead(
    editor,
    editorReads.slice.landing,
    input,
    ({ slice }): SliceLanding => ({ slice }),
    root === editor.read.view.root()
      ? editor
      : () =>
          createEditorViewRuntime(editor, root === undefined ? {} : { root })
  );
};

export const planPaste = (
  editor: Editor,
  state: EditorStateView,
  input: ReplaceSliceCommand,
  intent: SliceLandingInput['intent'],
  internal: Readonly<{ drop?: true }> = {}
): PastePlan | false => {
  const site = resolveSliceFitSite(editor, state, input.options);

  if (!site) return false;
  const copy = renewCopy(editor, input.slice);
  const dissolve = (slice: ContentSlice) =>
    internal.drop
      ? slice
      : dissolveOpenEndMatter(
          slice,
          getCompiledEditorSchemaFromApi(getEditorSchema(editor))
        );
  const source = dissolve(copy?.slice ?? input.slice);
  const limited = limitSliceToLength(source, site.remainingLength);

  if (limited.content.length === 0 && input.slice.content.length > 0) {
    return {
      copy,
      emptyBlockReplacement: null,
      inputCut: true,
      landingCut: false,
      site,
      slice: null,
    };
  }

  const { target } = site;
  const landed = readSliceLanding(editor, {
    intent,
    slice: limited,
    source: copy?.slice ?? input.slice,
    target,
  });
  const { replaceEmpty } = landed;
  const landingSource = dissolve(landed.slice);
  const slice = limitSliceToLength(landingSource, site.remainingLength);

  return {
    copy,
    ...(internal.drop ? { drop: true } : {}),
    emptyBlockReplacement:
      target.kind === 'empty' && replaceEmpty
        ? readAtSliceFitSite(editor, site, (rootState) =>
            prepareEmptyBlockReplacement(
              editor,
              rootState,
              target,
              replaceEmpty,
              site.remainingLength,
              copy,
              intent
            )
          )
        : null,
    inputCut: limited !== source,
    landingCut: slice !== landingSource,
    site,
    slice:
      slice.content.length === 0 && landed.slice.content.length > 0
        ? null
        : slice,
  };
};

const TRACKED_PASTES = new WeakSet<object>();

export const withTrackedPastes = <T>(editor: Editor, run: () => T): T => {
  const owner = getEditorRuntimeOwner(editor);

  TRACKED_PASTES.add(owner);
  try {
    return run();
  } finally {
    TRACKED_PASTES.delete(owner);
  }
};

export const writePaste = (
  editor: Editor,
  plan: PastePlan,
  requested: Readonly<{ landing?: true }> = {}
):
  | Readonly<{ lossy: boolean; spec: TransactionSpec; written: ContentSlice }>
  | false => {
  const options = TRACKED_PASTES.has(getEditorRuntimeOwner(editor))
    ? { landing: true as const }
    : requested;

  if (plan.emptyBlockReplacement) {
    const fit = fitSliceAtSite(editor, plan.site, plan.emptyBlockReplacement, {
      ...options,
      copy: plan.copy,
      ...(plan.drop ? { drop: true } : {}),
      replaceEmptyBlock: true,
    });

    if (fit) {
      return {
        lossy: plan.inputCut,
        ...fit,
      };
    }
  }
  if (!plan.slice) return false;

  const fit = fitSliceAtSite(editor, plan.site, plan.slice, {
    ...options,
    copy: plan.copy,
    ...(plan.drop ? { drop: true } : {}),
  });

  return (
    fit && {
      lossy: plan.inputCut || plan.landingCut,
      ...fit,
    }
  );
};

const PASTE_LOSS_NOTES = new WeakMap<object, { lossy: boolean }>();

/** @internal */
export const notePasteLoss = (editor: EditorRuntimeCarrier, lossy: boolean) => {
  const note = PASTE_LOSS_NOTES.get(getEditorRuntimeOwner(editor));

  if (note) note.lossy = lossy;
};

/** @internal */
export const captureSliceLanding = (
  editor: EditorRuntimeCarrier,
  evaluate: () => TransactionSpec | false
): Readonly<{ lossy: boolean; result: TransactionSpec | false }> => {
  const owner = getEditorRuntimeOwner(editor);
  const outer = PASTE_LOSS_NOTES.get(owner);
  const note = { lossy: false };

  PASTE_LOSS_NOTES.set(owner, note);

  try {
    const result = evaluate();

    return { lossy: result !== false && note.lossy, result };
  } finally {
    if (outer) PASTE_LOSS_NOTES.set(owner, outer);
    else PASTE_LOSS_NOTES.delete(owner);
  }
};

const prepareEmptyBlockReplacement = (
  editor: Editor,
  state: EditorStateView,
  target: Extract<SliceLandingTarget, { kind: 'empty' }>,
  {
    omitTargetProperties = [],
    slice,
  }: NonNullable<SliceLanding['replaceEmpty']>,
  remaining: number | undefined,
  copy: RenewedCopy | null,
  intent: SliceLandingInput['intent']
): ContentSlice | null => {
  const [head, ...rest] = slice.content;

  if (!sliceFitsLength(slice, remaining) || !NodeApi.isElement(head)) {
    return null;
  }
  const [block, path] = target.block;
  const schema = getEditorSchema(editor);
  const behavior = schema.getElementBehavior(head);
  const root = target.root ?? MAIN_ROOT_KEY;
  const replaces = replacesEmptyBlockHead(
    block,
    head,
    (node) => schema.getElementBehavior(node),
    intent === 'move'
  );
  const identityKeys = identityKeysOf(getCompiledEditorSchemaFromApi(schema));
  // The pasted head brings its own children, so only the block's own
  // properties go through the type change.
  const kept: Record<string, unknown> =
    behavior.object || behavior.void
      ? {}
      : NodeApi.extractProps(
          schema.elementForTypeChangeAt(
            { ...block, children: [] },
            head.type,
            path,
            root
          )
        );

  for (const key of omitTargetProperties) delete kept[key];
  if (replaces && identityKeys) {
    for (const key of identityKeys) delete kept[key];
  }
  const landedHead = { ...kept, ...head };

  for (const [key, sourceByDrawn] of copy?.sources ?? []) {
    const headWasDrawn = sourceByDrawn.has(head[key]);

    if (key in kept && headWasDrawn) landedHead[key] = kept[key];
  }
  const content = [landedHead, ...rest];
  const index = getDefined(path.at(-1));
  const parentEntry = state.nodes.parent(path);
  const parent =
    parentEntry && NodeApi.isElement(parentEntry[0]) ? parentEntry[0] : null;

  if (
    !schema.canContainAt(parent, landedHead, index, root) ||
    !schema.canPlaceAt(
      parent,
      parent
        ? parent.children
        : target.root === undefined
          ? state.children()
          : state.root(target.root),
      content,
      index,
      { removing: [index], root }
    )
  ) {
    return null;
  }

  return ContentSliceValue.withContent(slice, content, { open: 'closed' });
};
