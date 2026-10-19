import {
  ContentSlice,
  ElementApi,
  type Descendant,
  type EditorCoreStateView,
  type Element,
  type SliceLanding,
  type SliceLandingInput,
} from '../../../core';
import { landListContent } from './listIdentity.internal';
import { isListItem, LIST_FIELDS } from './listIndex.internal';

const peelOpenWrappers = (slice: ContentSlice) => {
  let content: readonly Descendant[] = slice.content;
  const wrappers: Element[] = [];

  for (
    let edge = Math.min(slice.openStart, slice.openEnd);
    edge > 1;
    edge -= 1
  ) {
    const [wrapper] = content;

    if (content.length !== 1 || !ElementApi.isElement(wrapper)) break;
    wrappers.push(wrapper);
    content = wrapper.children;
  }

  return { content, wrappers };
};

const rewrap = (
  wrappers: readonly Element[],
  content: readonly Descendant[]
) => {
  let wrapped = content;

  for (const wrapper of wrappers.toReversed()) {
    wrapped = [{ ...wrapper, children: Array.from(wrapped) }];
  }

  return wrapped;
};

const copiesWholeItems = (source: ContentSlice) => {
  const { content } = peelOpenWrappers(source);
  const [head] = content;

  return (
    ElementApi.isElement(head) &&
    isListItem(head) &&
    (content.length > 1 || (source.openStart === 0 && source.openEnd === 0))
  );
};

export const landListPaste = (
  state: EditorCoreStateView,
  { intent, source, target }: SliceLandingInput,
  landed: SliceLanding,
  {
    headingType,
    paragraphType,
  }: Readonly<{ headingType: string | undefined; paragraphType: string }>
): SliceLanding => {
  const { slice } = landed;
  const { content: blocks, wrappers } = peelOpenWrappers(slice);
  const placement = intent === 'move' ? 'move' : 'paste';
  const kept = landListContent(
    state,
    blocks,
    { block: target.block?.[0], kind: 'kept' },
    { headingType, placement }
  );
  const fallback =
    kept === blocks
      ? landed
      : {
          slice: ContentSlice.withContent(slice, rewrap(wrappers, kept), {
            open: 'preserve',
          }),
        };

  if (
    target.kind !== 'empty' ||
    (target.block[0].type !== paragraphType &&
      target.block[0].type !== headingType) ||
    !copiesWholeItems(source)
  ) {
    return fallback;
  }

  const [line, path] = target.block;
  const content = isListItem(line)
    ? kept
    : landListContent(
        state,
        blocks,
        { kind: 'line', line: [line, path] },
        { headingType, placement }
      );
  const [head, ...rest] = content;
  const openStart = slice.openStart - wrappers.length;
  const openEnd = slice.openEnd - wrappers.length;

  if (
    !ElementApi.isElement(head) ||
    (rest.length === 0 &&
      (openStart > 0 || openEnd > 0) &&
      state.nodes.isEmpty(head))
  ) {
    return fallback;
  }

  const inheritedNumbering = isListItem(head)
    ? {
        ...(typeof line.listStart === 'number'
          ? { listStart: line.listStart }
          : {}),
        ...(typeof line.listRestart === 'number'
          ? { listRestart: line.listRestart }
          : {}),
      }
    : {};

  return {
    ...fallback,
    replaceEmpty: {
      omitTargetProperties: LIST_FIELDS,
      slice: ContentSlice.fromJSON({
        ...slice,
        content: [{ ...head, ...inheritedNumbering }, ...rest],
        openEnd,
        openStart,
      }),
    },
  };
};
