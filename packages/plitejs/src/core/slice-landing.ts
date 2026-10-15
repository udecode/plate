import { createEditorViewRuntime } from '../editor-runtime-view';
import type {
  ContentSlice,
  Editor,
  EditorStateView,
  TransactionSpec,
} from '../interfaces/editor';
import { type Descendant, NodeApi } from '../interfaces/node';
import { SelectionApi } from '../interfaces/selection';
import { getDefined } from '../internal/get-defined';
import { ContentSlice as ContentSliceValue } from './content-slice';
import type { ReplaceSliceCommand } from './editor-commands';
import { editorReads } from './editor-reads';
import { getEditorRuntimeOwner, getEditorSchema } from './editor-runtime';
import { limitSliceToLength, sliceFitsLength } from './insert-limit';
import { MAIN_ROOT_KEY } from './public-root';
import {
  fitSliceAtSite,
  getCurrentNodeSelection,
  namesUncopiedRoot,
  moveImplicitTarget,
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
  const implicitTarget =
    input.options?.at === undefined
      ? (getCurrentNodeSelection(state) ??
        state.selection() ??
        moveImplicitTarget(getEditorRuntimeOwner(editor))?.target ??
        null)
      : null;
  const nodes = SelectionApi.isNode(implicitTarget) ? implicitTarget : null;
  const options =
    implicitTarget && !SelectionApi.isNode(implicitTarget)
      ? { ...input.options, at: implicitTarget }
      : input.options;
  const viewRoot = state.view.root();
  const site = resolveSliceFitSite(editor, viewRoot, options, nodes);

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
  plan: PastePlan
):
  | Readonly<{ lossy: boolean; spec: TransactionSpec; written: ContentSlice }>
  | false => {
  const proposed =
    plan.emptyBlockReplacement &&
    fitSliceAtSite(editor, plan.site, plan.emptyBlockReplacement, {
      replaceEmptyBlock: true,
    });

  if (proposed && plan.emptyBlockReplacement) {
    return {
      lossy: plan.inputCut,
      spec: proposed,
      written: plan.emptyBlockReplacement,
    };
  }
  if (!plan.slice) return false;

  const spec = fitSliceAtSite(editor, plan.site, plan.slice);

  return (
    spec && {
      lossy: plan.inputCut || plan.landingCut,
      spec,
      written: plan.slice,
    }
  );
};

const canCloseSliceEdge = (
  state: EditorStateView,
  slice: ContentSlice,
  edge: 'end' | 'start'
) => {
  let nodes: readonly Descendant[] = slice.content;

  for (
    let level = 0;
    level < (edge === 'start' ? slice.openStart : slice.openEnd);
    level += 1
  ) {
    const node = edge === 'start' ? nodes[0] : nodes.at(-1);

    if (!NodeApi.isElement(node)) break;
    if (namesUncopiedRoot(state, node, slice)) return false;
    nodes = node.children;
  }

  return true;
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

  if (
    !sliceFitsLength(slice, remaining) ||
    !NodeApi.isElement(head) ||
    !canCloseSliceEdge(state, slice, 'start') ||
    !canCloseSliceEdge(state, slice, 'end')
  ) {
    return null;
  }
  const [block, path] = target.block;
  const schema = getEditorSchema(editor);
  const behavior = schema.getElementBehavior(head);
  const root = target.root ?? MAIN_ROOT_KEY;
  const kept: Record<string, unknown> = {
    ...(behavior.object || behavior.void
      ? {}
      : block.type === head.type
        ? NodeApi.extractProps(block)
        : schema.elementPropertiesForTypeChangeAt(block, head, path, root)),
  };

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
