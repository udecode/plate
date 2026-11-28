import { node as getNode } from '../editor/node';
import { nodes as getNodes } from '../editor/nodes';
import {
  type Descendant,
  type Element,
  ElementApi,
  type Location,
  LocationApi,
  NodeApi,
  type Point,
  type Range,
  RangeApi,
  SelectionApi,
} from '../interfaces';
import type { AnyEditor as Editor, RootKey } from '../interfaces/editor';
import {
  above as editorAbove,
  isBlock as editorIsBlock,
  isEnd as editorIsEnd,
  isStart as editorIsStart,
  point as editorPoint,
  range as editorRange,
} from '../interfaces/editor';
import { type Path, PathApi } from '../interfaces/path';
import { MAIN_ROOT_KEY, stripLocationRoots } from '../internal/root-location';
import { getEditorSchema } from './editor-runtime';
import { type NodeWriteVetoInput, vetoesWrite } from './node-write-veto';
import { hasNonWritableAt } from './non-writable';

export function* contentPaths(editor: Editor, range: Range) {
  const [start, end] = RangeApi.edges(range);
  const schema = getEditorSchema(editor);

  for (const [node, path] of getNodes(editor, {
    at: range,
    match: (candidate) =>
      NodeApi.isText(candidate) ||
      (NodeApi.isElement(candidate) &&
        schema.isInline(candidate) &&
        schema.isVoid(candidate)),
    mode: 'lowest',
  })) {
    if (
      !NodeApi.isText(node) ||
      (PathApi.equals(path, end.path) ? end.offset : node.text.length) >
        (PathApi.equals(path, start.path) ? start.offset : 0)
    ) {
      yield path;
    }
  }
}

export const trimToContent = (editor: Editor, range: Range): Range | null => {
  let first: Path | undefined;
  let last: Path | undefined;

  for (const path of contentPaths(editor, range)) {
    first ??= path;
    last = path;
  }

  if (!first || !last) return null;

  const [start, end] = RangeApi.edges(range);

  return {
    anchor: PathApi.equals(first, start.path)
      ? start
      : editorPoint(editor, first, { edge: 'start' }),
    focus: PathApi.equals(last, end.path)
      ? end
      : editorPoint(editor, last, { edge: 'end' }),
  };
};

export type PlannedInlineWrapBlock = Readonly<{
  blockPath: Path;
  parentPath: Path;
  range: Range;
  status: 'fit' | 'skip' | 'veto';
  vetoInput?: NodeWriteVetoInput;
}>;

const collectAncestors = (editor: Editor, path: Path): Element[] => {
  const ancestors: Element[] = [];
  let current = path;

  while (current.length > 0) {
    const [node] = getNode(editor, current);

    if (ElementApi.isElement(node)) {
      ancestors.push(node);
    }
    current = PathApi.parent(current);
  }

  return ancestors;
};

const flattenWrapperChildren = (
  children: readonly Descendant[],
  wrapperType: string
): Descendant[] => {
  const flattened: Descendant[] = [];

  for (const child of children) {
    if (ElementApi.isElement(child) && child.type === wrapperType) {
      flattened.push(...flattenWrapperChildren(child.children, wrapperType));
    } else {
      flattened.push(child);
    }
  }

  return flattened;
};

const sliceElementChildren = (
  element: Element,
  elementPath: Path,
  start: Point | undefined,
  end: Point | undefined
): Descendant[] => {
  const depth = elementPath.length;
  const result: Descendant[] = [];

  for (let index = 0; index < element.children.length; index++) {
    const child = element.children[index];
    const childPath = [...elementPath, index];

    if (start && index < start.path[depth]) continue;
    if (end && index > end.path[depth]) continue;

    if (NodeApi.isText(child)) {
      const from =
        start && PathApi.equals(childPath, start.path) ? start.offset : 0;
      const to =
        end && PathApi.equals(childPath, end.path)
          ? end.offset
          : child.text.length;

      if (to > from) {
        result.push({ ...child, text: child.text.slice(from, to) });
      }
      continue;
    }

    const startInside =
      start !== undefined && PathApi.isAncestor(childPath, start.path);
    const endInside =
      end !== undefined && PathApi.isAncestor(childPath, end.path);

    if (startInside || endInside) {
      const sliced = sliceElementChildren(
        child,
        childPath,
        startInside ? start : undefined,
        endInside ? end : undefined
      );

      if (sliced.length > 0) {
        result.push({ ...child, children: sliced });
      }
    } else {
      result.push(child);
    }
  }

  return result;
};

const withInlineTextSpacers = (
  editor: Editor,
  children: readonly Descendant[]
): Descendant[] => {
  const schema = getEditorSchema(editor);
  const isInlineElement = (node: Descendant) =>
    ElementApi.isElement(node) && schema.isInline(node);

  if (!children.some(isInlineElement)) return [...children];

  const spaced: Descendant[] = [];

  for (const child of children) {
    if (isInlineElement(child)) {
      const previous = spaced.at(-1);

      if (!previous || isInlineElement(previous)) {
        spaced.push({ text: '' });
      }
    }
    spaced.push(child);
  }

  const last = spaced.at(-1);

  if (last && isInlineElement(last)) {
    spaced.push({ text: '' });
  }

  return spaced;
};

export const hasReadOnlyElement = (
  schema: ReturnType<typeof getEditorSchema>,
  node: Descendant
): boolean => {
  if (!ElementApi.isElement(node)) return false;
  if (schema.isReadOnly(node)) return true;

  return node.children.some((child) => hasReadOnlyElement(schema, child));
};

const planBlockInlineWrap = (
  editor: Editor,
  wrapper: Element,
  blockPath: Path,
  rawScope: Range,
  options: Readonly<{ replace: boolean; root: RootKey; split: boolean }>
): PlannedInlineWrapBlock => {
  const { replace, root, split } = options;
  const schema = getEditorSchema(editor);
  const trimmed = trimToContent(editor, rawScope);

  if (!trimmed) {
    return {
      blockPath,
      parentPath: blockPath,
      range: rawScope,
      status: 'skip',
    };
  }
  if (hasNonWritableAt(editor, trimmed, { root })) {
    return { blockPath, parentPath: blockPath, range: trimmed, status: 'skip' };
  }

  const [start, end] = RangeApi.edges(trimmed);
  const common = PathApi.common(start.path, end.path);
  let parentPath = PathApi.equals(common, start.path)
    ? PathApi.parent(common)
    : common;

  while (parentPath.length > blockPath.length) {
    const [candidate] = getNode(editor, parentPath);

    if (!ElementApi.isElement(candidate)) break;
    if (replace && candidate.type === wrapper.type) {
      parentPath = PathApi.parent(parentPath);
      continue;
    }
    if (
      editorIsStart(editor, start, parentPath) &&
      editorIsEnd(editor, end, parentPath) &&
      !schema.canContain(candidate, wrapper)
    ) {
      parentPath = PathApi.parent(parentPath);
      continue;
    }
    break;
  }

  const [parentNode] = getNode(editor, parentPath);

  if (!ElementApi.isElement(parentNode) || schema.isReadOnly(parentNode)) {
    return { blockPath, parentPath, range: trimmed, status: 'skip' };
  }

  const depth = parentPath.length;
  const firstChildIndex = start.path[depth];
  const lastChildIndex = end.path[depth];

  if (firstChildIndex === undefined || lastChildIndex === undefined) {
    return { blockPath, parentPath, range: trimmed, status: 'skip' };
  }

  const prefixNodes: Descendant[] = [];
  const wrappedNodes: Descendant[] = [];
  const suffixNodes: Descendant[] = [];
  const unwrapTargets: Array<{ node: Element; path: Path }> = [];
  const wrapTargets: Array<{ node: Element; path: Path }> = [];

  const recordReplacedElement = (node: Element, path: Path) => {
    if (schema.isReadOnly(node)) return false;

    unwrapTargets.push({ node, path });

    for (let childIndex = 0; childIndex < node.children.length; childIndex++) {
      const child = node.children[childIndex];
      const childPath = [...path, childIndex];

      if (!ElementApi.isElement(child)) continue;
      if (child.type === wrapper.type) {
        if (!recordReplacedElement(child, childPath)) return false;
      } else {
        wrapTargets.push({ node: child, path: childPath });
      }
    }

    return true;
  };

  for (let index = firstChildIndex; index <= lastChildIndex; index++) {
    const child = parentNode.children[index];
    const childPath = [...parentPath, index];
    const isFirst = index === firstChildIndex;
    const isLast = index === lastChildIndex;

    if (NodeApi.isText(child)) {
      const from =
        split && isFirst && PathApi.equals(childPath, start.path)
          ? start.offset
          : 0;
      const to =
        split && isLast && PathApi.equals(childPath, end.path)
          ? end.offset
          : child.text.length;

      if (from > 0) {
        prefixNodes.push({ ...child, text: child.text.slice(0, from) });
      }
      if (to > from) {
        wrappedNodes.push({ ...child, text: child.text.slice(from, to) });
      }
      if (to < child.text.length) {
        suffixNodes.push({ ...child, text: child.text.slice(to) });
      }
      continue;
    }

    if (replace && child.type === wrapper.type) {
      if (!recordReplacedElement(child, childPath)) {
        return { blockPath, parentPath, range: trimmed, status: 'skip' };
      }

      const startSplits =
        split && isFirst && !editorIsStart(editor, start, childPath);
      const endSplits = split && isLast && !editorIsEnd(editor, end, childPath);

      if (startSplits) {
        const beforeChildren = sliceElementChildren(
          child,
          childPath,
          undefined,
          start
        );

        if (beforeChildren.length > 0) {
          prefixNodes.push({ ...child, children: beforeChildren });
        }
      }

      const middleChildren =
        startSplits || endSplits
          ? sliceElementChildren(
              child,
              childPath,
              startSplits ? start : undefined,
              endSplits ? end : undefined
            )
          : child.children;

      const flattenedMiddle = flattenWrapperChildren(
        middleChildren,
        wrapper.type
      );

      if (flattenedMiddle.some((node) => hasReadOnlyElement(schema, node))) {
        return { blockPath, parentPath, range: trimmed, status: 'skip' };
      }

      wrappedNodes.push(...flattenedMiddle);

      if (endSplits) {
        const afterChildren = sliceElementChildren(
          child,
          childPath,
          end,
          undefined
        );

        if (afterChildren.length > 0) {
          suffixNodes.push({ ...child, children: afterChildren });
        }
      }

      continue;
    }

    if (hasReadOnlyElement(schema, child)) {
      return { blockPath, parentPath, range: trimmed, status: 'skip' };
    }

    wrappedNodes.push(child);
    wrapTargets.push({ node: child, path: childPath });
  }

  const parentAncestors = collectAncestors(editor, parentPath);
  const simulatedWrapper: Element = { ...wrapper, children: wrappedNodes };

  if (
    !schema.holdsElementChildren(simulatedWrapper, wrappedNodes, {
      ancestors: [simulatedWrapper, ...parentAncestors],
      root,
    })
  ) {
    return { blockPath, parentPath, range: trimmed, status: 'skip' };
  }

  const simulatedParentChildren = withInlineTextSpacers(editor, [
    ...parentNode.children.slice(0, firstChildIndex),
    ...prefixNodes,
    simulatedWrapper,
    ...suffixNodes,
    ...parentNode.children.slice(lastChildIndex + 1),
  ]);

  if (
    !schema.holdsElementChildren(parentNode, simulatedParentChildren, {
      ancestors: parentAncestors,
      root,
    })
  ) {
    return { blockPath, parentPath, range: trimmed, status: 'skip' };
  }

  for (const target of unwrapTargets) {
    const input: NodeWriteVetoInput = {
      kind: 'unwrap',
      node: target.node,
      path: target.path,
      root,
    };

    if (vetoesWrite(editor, input)) {
      return {
        blockPath,
        parentPath,
        range: trimmed,
        status: 'veto',
        vetoInput: input,
      };
    }
  }

  for (const target of wrapTargets) {
    const input: NodeWriteVetoInput = {
      kind: 'wrap',
      node: target.node,
      path: target.path,
      root,
    };

    if (vetoesWrite(editor, input)) {
      return {
        blockPath,
        parentPath,
        range: trimmed,
        status: 'veto',
        vetoInput: input,
      };
    }
  }

  return { blockPath, parentPath, range: trimmed, status: 'fit' };
};

export const planInlineWrap = (
  editor: Editor,
  wrapper: Element,
  target: Range,
  options: Readonly<{ replace: boolean; root?: RootKey; split: boolean }>
): readonly PlannedInlineWrapBlock[] => {
  const root = options.root ?? MAIN_ROOT_KEY;
  const trimmed = trimToContent(editor, target);

  if (!trimmed) return [];

  const blocks = Array.from(
    getNodes(editor, {
      at: trimmed,
      match: (node) => NodeApi.isElement(node) && editorIsBlock(editor, node),
      mode: 'lowest',
    })
  );
  const plans: PlannedInlineWrapBlock[] = [];

  for (const [, blockPath] of blocks) {
    const scope = RangeApi.intersection(
      stripLocationRoots(trimmed),
      stripLocationRoots(editorRange(editor, blockPath))
    );

    if (!scope || !RangeApi.isRange(scope)) continue;

    plans.push(
      planBlockInlineWrap(editor, wrapper, blockPath, scope, {
        replace: options.replace,
        root,
        split: options.split,
      })
    );
  }

  return plans;
};

const canInsertInlineAtPoint = (
  editor: Editor,
  element: Element,
  point: Point,
  options: Readonly<{ replace: boolean; root: RootKey }>
): boolean => {
  const { replace, root } = options;
  const schema = getEditorSchema(editor);

  if (hasNonWritableAt(editor, point, { root })) return false;

  const blockEntry = editorAbove(editor, {
    at: point,
    match: (node) => NodeApi.isElement(node) && editorIsBlock(editor, node),
  });

  if (!blockEntry) return false;

  const { children, ...shell } = element;
  const probe: Element = {
    ...shell,
    children: children.length > 0 ? children : [{ text: '' }],
  };

  let parentPath = PathApi.parent(point.path);
  let replacedEntry: [Element, Path] | null = null;

  if (replace) {
    while (parentPath.length > blockEntry[1].length) {
      const [candidate] = getNode(editor, parentPath);

      if (ElementApi.isElement(candidate) && candidate.type === probe.type) {
        replacedEntry = [candidate, parentPath];
        parentPath = PathApi.parent(parentPath);
      } else {
        break;
      }
    }
  }

  const [parentNode] = getNode(editor, parentPath);

  if (!ElementApi.isElement(parentNode) || schema.isReadOnly(parentNode)) {
    return false;
  }

  const parentAncestors = collectAncestors(editor, parentPath);

  if (
    !schema.holdsElementChildren(probe, probe.children, {
      ancestors: [probe, ...parentAncestors],
      root,
    })
  ) {
    return false;
  }

  if (replacedEntry) {
    const [replacedNode, replacedPath] = replacedEntry;

    if (schema.isReadOnly(replacedNode)) return false;

    const replacedIndex = replacedPath.at(-1);

    if (replacedIndex === undefined) return false;

    const simulated = withInlineTextSpacers(
      editor,
      parentNode.children.with(replacedIndex, probe)
    );

    if (
      !schema.holdsElementChildren(parentNode, simulated, {
        ancestors: parentAncestors,
        root,
      })
    ) {
      return false;
    }

    return !vetoesWrite(editor, {
      kind: 'unwrap',
      node: replacedNode,
      path: replacedPath,
      root,
    });
  }

  const childIndex = point.path[parentPath.length];
  const child =
    childIndex === undefined ? undefined : parentNode.children[childIndex];
  let simulated: Descendant[];

  if (childIndex !== undefined && child && NodeApi.isText(child)) {
    const before = parentNode.children.slice(0, childIndex);
    const after = parentNode.children.slice(childIndex + 1);

    if (child.text.length === 0) {
      simulated = [...before, probe, ...after];
    } else if (point.offset === 0) {
      simulated = [...before, probe, child, ...after];
    } else if (point.offset === child.text.length) {
      simulated = [...before, child, probe, ...after];
    } else {
      simulated = [
        ...before,
        { ...child, text: child.text.slice(0, point.offset) },
        probe,
        { ...child, text: child.text.slice(point.offset) },
        ...after,
      ];
    }
  } else {
    simulated = [...parentNode.children, probe];
  }

  return schema.holdsElementChildren(
    parentNode,
    withInlineTextSpacers(editor, simulated),
    {
      ancestors: parentAncestors,
      root,
    }
  );
};

export const canWrapAtTarget = (
  editor: Editor,
  element: Element,
  at: Location,
  options: Readonly<{ replace?: boolean; root?: RootKey; split?: boolean }> = {}
): boolean => {
  const root = options.root ?? MAIN_ROOT_KEY;
  const replace = options.replace ?? false;
  const schema = getEditorSchema(editor);

  if (SelectionApi.isNode(at)) return false;

  if (!schema.isInline(element)) {
    if (hasNonWritableAt(editor, at, { root })) return false;

    const { children: _children, ...shell } = element;

    if (LocationApi.isPath(at)) {
      if (at.length === 0) return false;

      const [node] = getNode(editor, at);

      if (!ElementApi.isElement(node)) return false;

      const parentPath = PathApi.parent(at);
      const parent =
        parentPath.length > 0 ? getNode(editor, parentPath)[0] : null;

      return (
        schema.canWrapChildren(
          ElementApi.isElement(parent) ? parent : null,
          { ...shell, children: [node] },
          at.at(-1) ?? 0,
          root
        ) && !vetoesWrite(editor, { kind: 'wrap', node, path: at, root })
      );
    }

    const blocks = Array.from(
      getNodes(editor, {
        at,
        match: (node) =>
          ElementApi.isElement(node) && editorIsBlock(editor, node),
        mode: 'lowest',
      })
    );

    if (blocks.length === 0) return false;

    const [, firstPath] = blocks[0];
    const parentPath = PathApi.parent(firstPath);
    const parent =
      parentPath.length > 0 ? getNode(editor, parentPath)[0] : null;

    return (
      schema.canWrapChildren(
        ElementApi.isElement(parent) ? parent : null,
        { ...shell, children: blocks.map(([node]) => node as Element) },
        firstPath.at(-1) ?? 0,
        root
      ) &&
      !blocks.some(([node, path]) =>
        vetoesWrite(editor, {
          kind: 'wrap',
          node: node as Element,
          path,
          root,
        })
      )
    );
  }

  if (LocationApi.isPoint(at)) {
    return canInsertInlineAtPoint(editor, element, at, { replace, root });
  }

  if (RangeApi.isRange(at)) {
    if (RangeApi.isCollapsed(at)) {
      return canInsertInlineAtPoint(editor, element, at.anchor, {
        replace,
        root,
      });
    }

    const split = options.split ?? true;
    const { children: _children, ...shell } = element;
    const plans = planInlineWrap(editor, { ...shell, children: [] }, at, {
      replace: replace && split,
      root,
      split,
    });

    if (plans.some((plan) => plan.status === 'veto')) return false;

    return plans.some((plan) => plan.status === 'fit');
  }

  const range = editorRange(editor, at);

  if (RangeApi.isCollapsed(range)) {
    return canInsertInlineAtPoint(editor, element, range.anchor, {
      replace,
      root,
    });
  }

  const split = options.split ?? true;
  const { children: _children, ...shell } = element;
  const plans = planInlineWrap(editor, { ...shell, children: [] }, range, {
    replace: replace && split,
    root,
    split,
  });

  if (plans.some((plan) => plan.status === 'veto')) return false;

  return plans.some((plan) => plan.status === 'fit');
};
