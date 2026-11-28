import type {
  AnyEditor,
  ContentSlice as Slice,
  RootKey,
  Value,
} from '../interfaces/editor';
import { ElementApi } from '../interfaces/element';
import { NodeApi, type Descendant } from '../interfaces/node';
import { getDefined } from '../internal/get-defined';
import { createContentSliceFromFragment } from './content-slice';
import { getEditorSchema } from './editor-runtime';
import { holdsNoContent } from './is-empty-element';
import { MAIN_ROOT_KEY, toPublicRoot } from './public-root';
import type { CompiledEditorSchema } from './schema-compiler';

const declaresEndMatter = (
  schema: CompiledEditorSchema | null
): schema is CompiledEditorSchema =>
  !!schema &&
  [...schema.elements.byType.values()].some(
    (element) => element.slice.endMatter
  );

export const containsEndMatter = (
  nodes: readonly Descendant[],
  schema: CompiledEditorSchema | null
): boolean => {
  if (!declaresEndMatter(schema)) return false;

  const visit = (children: readonly Descendant[]): boolean => {
    for (const node of children) {
      if (!ElementApi.isElement(node)) continue;
      if (schema.elements.byType.get(node.type)?.slice.endMatter) {
        return true;
      }
      if (visit(node.children)) return true;
    }

    return false;
  };

  return visit(nodes);
};

export const sliceLandsEndMatter = (
  slice: Slice,
  schema: CompiledEditorSchema | null
): boolean => {
  if (!declaresEndMatter(schema)) return false;

  const visit = (
    children: readonly Descendant[],
    depth: number,
    start: boolean
  ): boolean => {
    for (let index = 0; index < children.length; index++) {
      const node = children[index];
      if (!ElementApi.isElement(node)) continue;

      const onStart = start && index === 0 && slice.openStart >= depth;
      if (!onStart && schema.elements.byType.get(node.type)?.slice.endMatter) {
        return true;
      }
      if (visit(node.children, depth + 1, onStart)) return true;
    }

    return false;
  };

  return visit(slice.content, 1, true);
};

export const findEndMatterLandingIndex = (
  editor: AnyEditor,
  children: readonly Descendant[],
  endMatter: readonly Descendant[],
  options: Readonly<{
    minIndex?: number;
    removing?: readonly number[];
    root?: RootKey;
    trailingTypes?: readonly string[];
  }> = {}
): number => {
  const schema = getEditorSchema(editor);
  const root = options.root ?? MAIN_ROOT_KEY;
  const trailing = schema.tryCreateDefaultChild({
    at: [children.length],
    root: toPublicRoot(root),
  });
  const defaultType = NodeApi.isElement(trailing) ? trailing.type : null;
  const acceptedTypes = new Set<string>();

  if (defaultType) acceptedTypes.add(defaultType);
  for (const type of options.trailingTypes ?? []) acceptedTypes.add(type);

  const minIndex = options.minIndex ?? 0;
  const removing = options.removing ?? [];
  let boundary = children.length;

  while (boundary > minIndex) {
    const node = getDefined(children[boundary - 1]);
    const behavior = NodeApi.isElement(node)
      ? schema.getElementBehavior(node)
      : null;

    if (
      !NodeApi.isElement(node) ||
      !behavior ||
      behavior.void ||
      behavior.atom ||
      behavior.object ||
      !acceptedTypes.has(node.type) ||
      !holdsNoContent(node, schema) ||
      !schema.canPlaceAt(null, children, endMatter, boundary - 1, {
        removing,
        root,
      })
    ) {
      break;
    }
    boundary -= 1;
  }

  return boundary;
};

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
