import { readAuthoredFragmentRoots } from '../core/authored-fragment-view';
import {
  readAuthoredViewFragmentSlots,
  type NativeAuthoredFragment,
  type NativeAuthoredRenderSegment,
} from '../core/authored-runtime';
import { DocumentIndex } from '../core/change/document-index';
import { getEditorProjectionSnapshotIndex } from '../core/public-state';
import type { AnyEditor as Editor } from '../interfaces/editor';
import { NodeApi, type Descendant } from '../interfaces/node';
import { PathApi, type Path } from '../interfaces/path';
import { getDefined } from '../internal/get-defined';
import type { AuthoredRangeProjection } from './anchors';
import {
  authoredContentLocations,
  authoredOriginalLocation,
} from './counterparts';
import {
  readAuthoredFragmentBounds,
  readAuthoredFragmentProjection,
  readAuthoredMarkupFragments,
} from './markup';
import {
  authoredPositionAt,
  authoredPositionSpans,
  resolveAuthoredPosition,
  type AuthoredPositions,
  type AuthoredSpan,
} from './positions';
import { readRecord } from './record-tree';
import { authoredOriginOperation } from './state';
import { authoredRootNodes } from './steps';

type RetainedFragment = Exclude<NativeAuthoredFragment, { kind: 'properties' }>;
type Source = Readonly<{
  document: DocumentIndex;
  fragment: RetainedFragment | null;
  nodes: readonly Descendant[];
  positions: AuthoredPositions;
}>;
type Ancestor = Readonly<{
  key: string;
  path: Path;
  source: Source;
  span: AuthoredSpan;
}>;

const spanAt = (positions: AuthoredPositions, offset: number): AuthoredSpan => {
  const entry = getDefined(
    authoredPositionSpans(positions, offset, offset + 1).next().value
  );
  return {
    ...entry.span,
    offset: entry.span.offset + offset - entry.from,
    length: 1,
  };
};

const ancestry = (source: Source, path: Path): readonly Ancestor[] =>
  path.map((_, index) => {
    const ancestor = path.slice(0, index + 1);
    const span = spanAt(
      source.positions,
      source.document.nodeRange(ancestor).from
    );
    return {
      key: JSON.stringify([span.origin, span.offset, span.placement]),
      path: ancestor,
      source,
      span,
    };
  });

const projectedSource = (
  projection: AuthoredRangeProjection,
  root: string,
  fragment: RetainedFragment | null = null
): Source => {
  const nodes = authoredRootNodes(
    projection.value,
    root
  ) as readonly Descendant[];
  return {
    document: DocumentIndex.fromValue(nodes),
    fragment,
    nodes,
    positions: getDefined(readRecord(projection.positions, root)).positions,
  };
};

export const readAuthoredFragmentRenderScopes = (
  editor: Editor,
  fragments: readonly NativeAuthoredFragment[],
  proposed: AuthoredRangeProjection,
  root: string
) => {
  const source = projectedSource(proposed, root);
  let scope: Path | null = null;
  let structural = false;
  const retained: Source[] = [];
  for (const fragment of fragments) {
    if (fragment.kind === 'properties' || !fragment.placement) continue;
    const local = readAuthoredFragmentProjection(fragment, proposed.state);
    const bounds = readAuthoredFragmentBounds(fragment);
    if (!local || !bounds) continue;
    const current = projectedSource(local, root, fragment);
    retained.push(current);
    structural ||= readAuthoredFragmentRoots(fragment).length === 0;
    let path: Path;
    if (fragment.placement.kind === 'text') {
      path = fragment.placement.point.path.slice(0, -1);
      while (
        path.length &&
        editor.read.schema.isInline(source.document.node(path) as Descendant)
      ) {
        path = path.slice(0, -1);
      }
    } else {
      const { path: parent, index } = fragment.placement;
      const children = parent.length
        ? source.document.node(parent).children
        : source.nodes;
      path = children?.[index]
        ? [...parent, index]
        : index > 0 && children?.[index - 1]
          ? [...parent, index - 1]
          : parent;
    }
    scope = scope ? PathApi.common(scope, path) : path;
  }
  if (!structural || !scope) return new Map<string, Path>();
  // Context ancestors retain origin identity even when their visible children were merged.
  while (scope.length > 1) {
    const outside = ancestry(source, scope.slice(0, -1));
    if (
      retained.every((current) => {
        let { nodes } = current;
        const path: number[] = [];
        for (const ancestor of outside) {
          if (nodes.length !== 1 || !NodeApi.isElement(nodes[0])) return false;
          path.push(0);
          if (ancestry(current, path).at(-1)?.key !== ancestor.key) {
            return false;
          }
          nodes = nodes[0].children;
        }
        return true;
      })
    ) {
      break;
    }
    scope = scope.slice(0, -1);
  }
  return new Map(
    fragments
      .filter((fragment) => fragment.kind !== 'properties')
      .map((fragment) => [fragment.id, scope] as const)
  );
};

/** Reconcile native ancestor identities without constructing another editable document. */
export const composeAuthoredRenderSegments = (
  editor: Editor,
  children: readonly Descendant[],
  root: string,
  scope: Path,
  accepted: AuthoredRangeProjection,
  proposed: AuthoredRangeProjection
): readonly NativeAuthoredRenderSegment[] => {
  const normal = {
    ...projectedSource(proposed, root),
    nodes: children,
    document: DocumentIndex.fromValue(children),
  };
  const baseline = projectedSource(accepted, root);
  const sources = new Map<string, Source>();
  const registry = new Map<string, Ancestor>();
  const result: NativeAuthoredRenderSegment[] = [];
  const originalOrder = new WeakMap<NativeAuthoredRenderSegment, number>();
  const emitted = new Map<
    string,
    Extract<NativeAuthoredRenderSegment, { kind: 'element' }> & {
      children: NativeAuthoredRenderSegment[];
    }
  >();
  const continuations = new Map<string, readonly Ancestor[]>();
  const renderedSpans = new WeakMap<
    NativeAuthoredRenderSegment,
    AuthoredSpan
  >();
  const outside = ancestry(normal, scope.slice(0, -1));
  const fragments = new Map<string, readonly NativeAuthoredFragment[]>();
  const slots = new Map<
    string,
    ReturnType<typeof readAuthoredViewFragmentSlots>
  >();
  const nodeIndex = getEditorProjectionSnapshotIndex(editor, children);
  const partCounts = new Map<string, number>();
  const reference = (source: Source, path: Path, span?: AuthoredSpan) => {
    const owner =
      span ?? spanAt(source.positions, source.document.nodeRange(path).from);
    const operation = authoredOriginOperation(
      proposed.state,
      owner.placement ?? owner.origin
    );
    const nodeKey = getDefined(
      getEditorProjectionSnapshotIndex(editor, source.nodes).keyAt(path)
    );
    const key = JSON.stringify([source.fragment?.id ?? null, nodeKey]);
    const part = partCounts.get(key) ?? 0;
    partCounts.set(key, part + 1);
    return {
      changeId: source.fragment?.changeId ?? operation?.changeId ?? null,
      childIndex: getDefined(path.at(-1)),
      fragment: source.fragment,
      key: `${key}:${part}`,
      node: source.document.node(path) as Descendant,
      nodeKey,
      path,
    };
  };
  const remember = (source: Source, path: Path) => {
    const entry = getDefined(ancestry(source, path).at(-1));
    if (!registry.has(entry.key) || !source.fragment) {
      registry.set(entry.key, entry);
    }
  };
  const scanRetained = (source: Source) => {
    const visit = (node: Descendant, path: Path) => {
      if (NodeApi.isText(node)) return;
      remember(source, path);
      node.children.forEach((child, index) => visit(child, [...path, index]));
    };
    source.nodes.forEach((node, index) => visit(node, [index]));
  };
  const readSlots = (path?: Path) => {
    const key = path?.join(',') ?? '';
    let current = slots.get(key);
    if (current) return current;
    current = readAuthoredViewFragmentSlots(
      editor,
      path ? getDefined(nodeIndex.keyAt(path)) : undefined,
      root
    );
    slots.set(key, current);
    for (const slot of current) {
      if (sources.has(slot.id)) continue;
      let values = fragments.get(slot.changeId);
      if (!values) {
        values = readAuthoredMarkupFragments(slot.changeId, accepted, proposed);
        fragments.set(slot.changeId, values);
      }
      const fragment = values.find(
        (value) => value.id === slot.id && value.root === root
      );
      if (!fragment || fragment.kind === 'properties') continue;
      const local = readAuthoredFragmentProjection(fragment, proposed.state);
      if (!local) continue;
      const source = projectedSource(local, root, fragment);
      sources.set(fragment.id, source);
      scanRetained(source);
    }
    return current;
  };
  const scan = (node: Descendant, path: Path) => {
    readSlots(path);
    if (NodeApi.isText(node)) return;
    remember(normal, path);
    node.children.forEach((child, index) => scan(child, [...path, index]));
  };
  if (scope.length) {
    for (let depth = 1; depth < scope.length; depth++) {
      remember(normal, scope.slice(0, depth));
    }
    scan(normal.document.node(scope) as Descendant, scope);
  } else {
    readSlots();
    children.forEach((node, index) => scan(node, [index]));
  }
  const ensure = (ancestors: readonly Ancestor[]) => {
    if (outside.some((entry, index) => entry.key !== ancestors[index]?.key)) {
      throw new Error('Retained ancestry escapes its native render scope.');
    }
    let parent = result;
    let parentAncestor = outside.at(-1);
    for (const ancestor of ancestors.slice(outside.length)) {
      let segment = emitted.get(ancestor.key);
      if (!segment) {
        const entry = getDefined(registry.get(ancestor.key));
        segment = {
          ...reference(entry.source, entry.path),
          childIndex: childIndex(entry.source, entry.path, parentAncestor),
          kind: 'element',
          children: [],
        };
        const location = authoredContentLocations(
          accepted.positions,
          entry.span
        ).next().value;
        if (
          location?.root === root &&
          location.span.placement === entry.span.placement
        ) {
          originalOrder.set(
            segment,
            location.from + location.fromOffset - location.span.offset
          );
        }
        emitted.set(ancestor.key, segment);
        parent.push(segment);
      }
      parent = segment.children;
      parentAncestor = ancestor;
    }
    return parent;
  };
  const acceptedLocation = (span: AuthoredSpan) =>
    authoredOriginalLocation(proposed.state, accepted.positions, span);
  const continuedAncestry = (ancestors: readonly Ancestor[]) => {
    if (!continuations.size) return ancestors;
    for (let index = ancestors.length - 1; index >= 0; index--) {
      const continuation = continuations.get(ancestors[index].key);
      if (continuation) {
        return [...continuation, ...ancestors.slice(index + 1)];
      }
    }
    return ancestors;
  };
  const ordinaryAncestry = (
    span: AuthoredSpan,
    ancestors: readonly Ancestor[]
  ) => {
    if (
      span.placement ||
      ancestors.some(
        (ancestor) =>
          ancestor.span.placement ||
          (ancestor.span.birth &&
            readRecord(proposed.state.changes, ancestor.span.birth)?.status !==
              'accepted')
      )
    ) {
      return ancestors;
    }
    const location = acceptedLocation(span);
    if (!location || location.root !== root) return ancestors;
    const position = location.offset;
    const context = baseline.document
      .openContextAt(position)
      .filter((entry) => entry.kind === 'element');
    const path = context.at(-1)?.path;
    if (!path) return ancestors;
    const original = ancestry(baseline, [...path]);
    return original.every((entry) => registry.has(entry.key))
      ? original
      : ancestors;
  };
  const childIndex = (
    source: Source,
    path: Path,
    ancestor?: Ancestor,
    position = source.document.nodeRange(path).from + 1
  ) => {
    if (!ancestor) return getDefined(path.at(-1));
    let parent = getDefined(registry.get(ancestor.key));
    if (parent.source.fragment) {
      const original = authoredContentLocations(
        accepted.positions,
        parent.span
      ).next().value;
      if (original?.root === root) {
        const offset =
          original.from + original.fromOffset - original.span.offset;
        const originalPath = baseline.document
          .openContextAt(offset + 1)
          .find(
            (entry) => entry.kind === 'element' && entry.from === offset
          )?.path;
        if (originalPath) {
          parent = { ...parent, source: baseline, path: [...originalPath] };
        }
      }
    }
    if (
      parent.source === source &&
      PathApi.equals(parent.path, path.slice(0, -1))
    ) {
      return getDefined(path.at(-1));
    }
    const resolveChild = (input: Source, offset: number) => {
      const target = resolveAuthoredPosition(
        parent.source.positions,
        authoredPositionAt(input.positions, offset),
        'right',
        'collapse'
      );
      return target === null
        ? null
        : parent.source.document
            .openContextAt(target)
            .find((entry) => PathApi.isParent(parent.path, [...entry.path]));
    };
    let child = resolveChild(source, position);
    if (!child) {
      const original = acceptedLocation(spanAt(source.positions, position));
      if (original?.root === root) {
        const { offset } = original;
        child = resolveChild(baseline, offset + 1);
        if (!child) {
          const originalPath = baseline.document
            .openContextAt(offset + 1)
            .at(-1)?.path;
          if (originalPath) {
            child = resolveChild(
              baseline,
              baseline.document.nodeRange(originalPath).from + 1
            );
          }
        }
      }
    }
    if (!child) {
      child = resolveChild(source, source.document.nodeRange(path).from + 1);
    }
    if (!child && (source.fragment || parent.source.fragment)) {
      child = resolveChild(source, source.document.nodeRange(path).to - 1);
    }
    if (!child && source.fragment) return getDefined(path.at(-1));
    if (!child) throw new Error('Cannot resolve authored child slot.');
    return getDefined(child.path.at(-1));
  };
  const text = (source: Source, path: Path, start: number, end: number) => {
    const ancestors = ancestry(source, path.slice(0, -1));
    const from = source.document.nodeRange(path).from + 1;
    const spans = [
      ...authoredPositionSpans(source.positions, from + start, from + end),
    ];
    if (!spans.length && start === end && !source.fragment) {
      ensure(ancestors).push(
        Object.freeze({ ...reference(source, path), kind: 'text', start, end })
      );
    }
    for (const entry of spans) {
      const left = Math.max(from + start, entry.from);
      const right = Math.min(from + end, entry.to);
      const span = {
        ...entry.span,
        offset: entry.span.offset + left - entry.from,
        length: right - left,
      };
      const context = continuedAncestry(
        source.fragment ? ancestors : ordinaryAncestry(span, ancestors)
      );
      const parent = ensure(context);
      const segment = Object.freeze({
        ...reference(source, path, span),
        childIndex: childIndex(source, path, context.at(-1), left),
        kind: 'text' as const,
        start: left - from,
        end: right - from,
      });
      const location = acceptedLocation(span);
      const originalPosition =
        location?.root === root && location.placement === span.placement
          ? location.offset
          : undefined;
      const previous = parent.at(-1);
      const previousSpan = previous ? renderedSpans.get(previous) : undefined;
      if (
        previous?.kind === 'text' &&
        previousSpan?.origin === span.origin &&
        previousSpan.offset + previousSpan.length === span.offset &&
        previousSpan.birth === span.birth &&
        previousSpan.placement === span.placement &&
        previous.changeId === segment.changeId &&
        previous.childIndex === segment.childIndex &&
        previous.fragment === segment.fragment &&
        previous.node === segment.node &&
        previous.nodeKey === segment.nodeKey &&
        PathApi.equals(previous.path, segment.path) &&
        previous.end === segment.start
      ) {
        const combined = Object.freeze({ ...previous, end: segment.end });
        renderedSpans.set(combined, {
          ...previousSpan,
          length: previousSpan.length + span.length,
        });
        const position = originalOrder.get(previous) ?? originalPosition;
        if (position !== undefined) originalOrder.set(combined, position);
        parent[parent.length - 1] = combined;
      } else {
        renderedSpans.set(segment, span);
        if (originalPosition !== undefined) {
          originalOrder.set(segment, originalPosition);
        }
        parent.push(segment);
      }
    }
  };
  const retain = (id: string) => {
    const source = sources.get(id);
    const bounds =
      source?.fragment && readAuthoredFragmentBounds(source.fragment);
    if (!source || !bounds) return;
    const visit = (node: Descendant, path: Path) => {
      const range = source.document.nodeRange(path);
      if (NodeApi.isText(node)) {
        const start = Math.max(range.from + 1, bounds.from);
        const end = Math.min(range.to - 1, bounds.to);
        if (start < end) {
          text(source, path, start - range.from - 1, end - range.from - 1);
        }
      } else {
        if (
          (bounds.from <= range.from && range.from < bounds.to) ||
          (bounds.from < range.to && range.to <= bounds.to)
        ) {
          ensure(ancestry(source, path));
        }
        node.children.forEach((child, index) => visit(child, [...path, index]));
      }
    };
    source.nodes.forEach((node, index) => visit(node, [index]));
    for (const entry of source.document.openContextAt(bounds.to)) {
      if (entry.kind !== 'element') continue;
      const path = [...entry.path];
      const context = ancestry(source, path);
      const current = getDefined(context.at(-1));
      const operation = authoredOriginOperation(
        proposed.state,
        current.span.placement ?? current.span.origin
      );
      if (operation?.retained !== id) continue;
      const original = acceptedLocation(spanAt(source.positions, entry.to - 1));
      if (original?.root !== root) continue;
      const originalParent = baseline.document
        .openContextAt(original.offset)
        .find(
          (parent) =>
            parent.kind === 'element' && parent.to === original.offset + 1
        );
      if (!originalParent) continue;
      const originalAncestor = getDefined(
        ancestry(baseline, [...originalParent.path]).at(-1)
      );
      // A retained split keeps the original closing token on its final block.
      continuations.set(originalAncestor.key, continuedAncestry(context));
    }
  };
  const visit = (node: Descendant, path: Path) => {
    const current = readSlots(path);
    const at = (side: (typeof current)[number]['side']) =>
      current.filter((slot) => slot.side === side);
    at('before').forEach((slot) => retain(slot.id));
    if (NodeApi.isText(node)) {
      let start = 0;
      for (const slot of at('text')) {
        const fragment = sources.get(slot.id)?.fragment;
        if (fragment?.placement?.kind !== 'text') continue;
        const end = fragment.placement.point.offset;
        if (start < end) text(normal, path, start, end);
        retain(slot.id);
        start = end;
      }
      if (start < node.text.length || !node.text.length) {
        text(normal, path, start, node.text.length);
      }
    } else {
      ensure(ancestry(normal, path));
      at('children').forEach((slot) => retain(slot.id));
      node.children.forEach((child, index) => visit(child, [...path, index]));
    }
    at('after').forEach((slot) => retain(slot.id));
  };
  if (scope.length) visit(normal.document.node(scope) as Descendant, scope);
  else {
    readSlots()
      .filter((slot) => slot.side === 'children')
      .forEach((slot) => retain(slot.id));
    children.forEach((node, index) => visit(node, [index]));
  }
  const order = (segments: NativeAuthoredRenderSegment[]) => {
    // Each original placement keeps its native order; proposed moves retain their rendered slots.
    const originals = segments
      .filter((child) => originalOrder.has(child))
      .sort(
        (left, right) =>
          getDefined(originalOrder.get(left)) -
          getDefined(originalOrder.get(right))
      );
    let index = 0;
    segments.forEach((child, position) => {
      if (originalOrder.has(child)) {
        segments[position] = originals[index];
        index += 1;
      }
    });
  };
  emitted.forEach((segment) => {
    order(segment.children);
    Object.freeze(segment.children);
    Object.freeze(segment);
  });
  order(result);
  return Object.freeze(result);
};
