import type {
  ContentSlice,
  Editor,
  EditorStateView,
} from '../interfaces/editor';
import type { Location } from '../interfaces/location';
import { type Descendant, NodeApi } from '../interfaces/node';
import { PointApi } from '../interfaces/point';
import { RangeApi } from '../interfaces/range';
import { getDefined } from '../internal/get-defined';
import { ContentSlice as ContentSliceValue } from './content-slice';
import { editorReads } from './editor-reads';
import { getEditorSchema } from './editor-runtime';
import { sliceFitsLength } from './insert-limit';
import { getReplaceableEmptyBlock } from './is-empty-element';
import { MAIN_ROOT_KEY } from './public-root';
import { executeEditorRead } from './read-registry';
import type {
  SliceLanding,
  SliceLandingInput,
  SliceLandingTarget,
} from './slice-landing-types';

export const rootField = (root: string | undefined) =>
  root === undefined ? {} : { root };

export const landSlice = (editor: Editor, input: SliceLandingInput) =>
  executeEditorRead(
    editor,
    editorReads.slice.landing,
    input,
    ({ slice }): SliceLanding => ({ slice }),
    editor
  );

const toSliceRange = (location: Location | undefined) =>
  PointApi.isPoint(location)
    ? { anchor: location, focus: location }
    : RangeApi.isRange(location)
      ? location
      : undefined;

export const resolveSliceLandingTarget = (
  state: EditorStateView,
  location: Location | undefined,
  publicRoot: string | undefined
): SliceLandingTarget => {
  const range = toSliceRange(location);
  const root = rootField(publicRoot);

  const empty =
    range &&
    getReplaceableEmptyBlock(
      range,
      (path) => state.nodes.get(path)?.[0],
      state.schema
    );

  if (empty) return { block: empty, kind: 'empty', ...root };

  return {
    block:
      (location === undefined
        ? undefined
        : state.nodes.block({
            at: range ? RangeApi.start(range) : location,
          })) ?? null,
    kind: 'context',
    ...root,
  };
};

const canCloseSliceEdge = (
  state: EditorStateView,
  slice: ContentSlice,
  edge: 'end' | 'start'
) => {
  let nodes: readonly Descendant[] = slice.content;
  const copiedRoots = new Set(Object.keys(slice.roots ?? {}));

  for (
    let level = 0;
    level < (edge === 'start' ? slice.openStart : slice.openEnd);
    level += 1
  ) {
    const node = edge === 'start' ? nodes[0] : nodes.at(-1);

    if (!NodeApi.isElement(node)) break;
    const slots = state.schema.element(node.type)?.contentRoots;
    const roots = state.schema.getElementContentRoots(node);

    if (
      slots &&
      Object.keys(slots).some((slot) => {
        const childRoot = roots[slot];

        return typeof childRoot !== 'string' || !copiedRoots.has(childRoot);
      })
    ) {
      return false;
    }
    nodes = node.children;
  }

  return true;
};

export const prepareEmptyBlockReplacement = (
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
