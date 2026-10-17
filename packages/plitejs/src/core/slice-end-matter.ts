import type { ContentSlice as Slice, Value } from '../interfaces/editor';
import { ElementApi } from '../interfaces/element';
import type { Descendant } from '../interfaces/node';
import { createContentSliceFromFragment } from './content-slice';
import type { CompiledEditorSchema } from './schema-compiler';

const declaresEndMatter = (
  schema: CompiledEditorSchema | null
): schema is CompiledEditorSchema =>
  !!schema &&
  [...schema.elements.byType.values()].some(
    (element) => element.slice.endMatter
  );

export const dissolveOpenEndMatter = <V extends Value>(
  slice: Slice<V>,
  schema: CompiledEditorSchema | null
): Slice<V> => {
  if (!declaresEndMatter(schema)) {
    return slice;
  }
  let { openStart, openEnd } = slice;
  const walk = (
    children: readonly Descendant[],
    depth: number,
    start: boolean,
    end: boolean
  ): readonly Descendant[] => {
    let changed = false;
    const result = children.flatMap((node, index): readonly Descendant[] => {
      if (!ElementApi.isElement(node)) return [node];
      const onStart = start && index === 0 && slice.openStart >= depth;
      const onEnd =
        end && index === children.length - 1 && slice.openEnd >= depth;
      if (!onStart && !onEnd) return [node];
      const nested = walk(node.children, depth + 1, onStart, onEnd);
      if (schema.elements.byType.get(node.type)?.slice.endMatter) {
        if (onStart) openStart -= 1;
        if (onEnd) openEnd -= 1;
        changed = true;
        return nested;
      }
      if (nested === node.children) return [node];
      changed = true;
      return [{ ...node, children: nested }];
    });
    return changed ? result : children;
  };
  const content = walk(slice.content, 1, true, true);
  return content === slice.content
    ? slice
    : createContentSliceFromFragment<V>(
        content,
        openStart,
        openEnd,
        slice.roots
      );
};

export const splitEndMatter = (
  slice: Slice,
  schema: CompiledEditorSchema | null
): Readonly<{ endMatter: readonly Descendant[]; flow: Slice }> => {
  const endMatter: Descendant[] = [];
  if (!declaresEndMatter(schema)) {
    return { endMatter, flow: slice };
  }
  let { openStart, openEnd } = slice;
  const walk = (
    children: readonly Descendant[],
    depth: number,
    start: boolean,
    end: boolean
  ): readonly Descendant[] => {
    let changed = false;
    const result = children.flatMap((node, index): Descendant[] => {
      if (!ElementApi.isElement(node)) return [node];
      const onStart = start && index === 0;
      const onEnd = end && index === children.length - 1;
      if (schema.elements.byType.get(node.type)?.slice.endMatter) {
        const position = endMatter.length;
        endMatter.push(node);
        const nested = walk(node.children, depth + 1, onStart, onEnd);
        if (nested !== node.children) {
          endMatter[position] = { ...node, children: nested };
        }
        if (onStart) openStart = Math.min(openStart, depth - 1);
        if (onEnd) openEnd = Math.min(openEnd, depth - 1);
        changed = true;
        return [];
      }
      const nested = walk(node.children, depth + 1, onStart, onEnd);
      if (nested === node.children) return [node];
      changed = true;
      return [{ ...node, children: nested }];
    });
    return changed ? result : children;
  };
  const content = walk(slice.content, 1, true, true);
  return {
    endMatter,
    flow:
      content === slice.content
        ? slice
        : createContentSliceFromFragment(
            content,
            openStart,
            openEnd,
            slice.roots
          ),
  };
};
