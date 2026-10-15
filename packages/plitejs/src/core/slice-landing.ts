import { createEditorViewRuntime } from '../editor-runtime-view';
import type {
  ContentSlice,
  Editor,
  EditorStateView,
  TransactionSpec,
} from '../interfaces/editor';
import { NodeApi } from '../interfaces/node';
import { getDefined } from '../internal/get-defined';
import { ContentSlice as ContentSliceValue } from './content-slice';
import type { ReplaceSliceCommand } from './editor-commands';
import { editorReads } from './editor-reads';
import { getEditorSchema } from './editor-runtime';
import { limitSliceToLength, sliceFitsLength } from './insert-limit';
import { MAIN_ROOT_KEY } from './public-root';
import {
  fitSliceAtSite,
  readAtSliceFitSite,
  resolveSliceFitSite,
  type SliceFitSite,
} from './public-state';
import { executeEditorRead } from './read-registry';
import type {
  SliceLanding,
  SliceLandingInput,
  SliceLandingTarget,
} from './slice-landing-types';

export type PastePlan = Readonly<{
  emptyBlockReplacement: ContentSlice | null;
  inputCut: boolean;
  landingCut: boolean;
  site: SliceFitSite;
  slice: ContentSlice | null;
}>;

export const planPaste = (
  editor: Editor,
  state: EditorStateView,
  input: ReplaceSliceCommand,
  intent: SliceLandingInput['intent']
): PastePlan | false => {
  const site = resolveSliceFitSite(editor, state, input.options);

  if (!site) return false;
  const limited = limitSliceToLength(input.slice, site.remainingLength);

  if (limited.content.length === 0 && input.slice.content.length > 0) {
    return {
      emptyBlockReplacement: null,
      inputCut: true,
      landingCut: false,
      site,
      slice: null,
    };
  }

  const { target } = site;
  const landed = executeEditorRead(
    editor,
    editorReads.slice.landing,
    { intent, slice: limited, source: input.slice, target },
    ({ slice }): SliceLanding => ({ slice }),
    target.root === editor.read.view.root()
      ? editor
      : () =>
          createEditorViewRuntime(
            editor,
            target.root === undefined ? {} : { root: target.root }
          )
  );
  const { replaceEmpty } = landed;
  const slice = limitSliceToLength(landed.slice, site.remainingLength);

  return {
    emptyBlockReplacement:
      target.kind === 'empty' && replaceEmpty
        ? readAtSliceFitSite(editor, site, (rootState) =>
            prepareEmptyBlockReplacement(
              editor,
              rootState,
              target,
              replaceEmpty,
              site.remainingLength
            )
          )
        : null,
    inputCut: limited !== input.slice,
    landingCut: slice !== landed.slice,
    site,
    slice:
      slice.content.length === 0 && landed.slice.content.length > 0
        ? null
        : slice,
  };
};

export const writePaste = (
  editor: Editor,
  plan: PastePlan,
  options: Readonly<{ landing?: true }> = {}
):
  | Readonly<{ lossy: boolean; spec: TransactionSpec; written: ContentSlice }>
  | false => {
  if (plan.emptyBlockReplacement) {
    const spec = fitSliceAtSite(editor, plan.site, plan.emptyBlockReplacement, {
      ...options,
      replaceEmptyBlock: true,
    });

    if (spec) {
      return {
        lossy: plan.inputCut,
        spec,
        written: plan.emptyBlockReplacement,
      };
    }
  }
  if (!plan.slice) return false;

  const spec = fitSliceAtSite(editor, plan.site, plan.slice, options);

  return (
    spec && {
      lossy: plan.inputCut || plan.landingCut,
      spec,
      written: plan.slice,
    }
  );
};

const prepareEmptyBlockReplacement = (
  editor: Editor,
  state: EditorStateView,
  target: Extract<SliceLandingTarget, { kind: 'empty' }>,
  {
    omitTargetProperties = [],
    slice,
  }: NonNullable<SliceLanding['replaceEmpty']>,
  remaining: number | undefined
): ContentSlice | null => {
  const [head, ...rest] = slice.content;

  if (!sliceFitsLength(slice, remaining) || !NodeApi.isElement(head)) {
    return null;
  }
  const [block, path] = target.block;
  const schema = getEditorSchema(editor);
  const behavior = schema.getElementBehavior(head);
  const root = target.root ?? MAIN_ROOT_KEY;
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
  const landedHead = { ...kept, ...head };
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
