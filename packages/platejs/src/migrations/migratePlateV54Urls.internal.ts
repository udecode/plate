import {
  type Descendant,
  type Element,
  MAIN_ROOT_KEY,
  type Path,
  type Point,
  RangeApi,
  SelectionApi,
  TextApi,
  type Value,
} from '../facade';
import type { DocumentMigrationContext } from './documentMigrations';
import { resolveV54BuiltIns } from './migratePlateV54BuiltIns.internal';
import {
  adjacentTextPoint,
  createRangeMapper,
  mapDocumentRoots,
  mapNodeSelectionPaths,
  pathKey,
  type PlateV54StageResult,
  type PointEdge,
  type ReplacementPoint,
} from './migratePlateV54Stage.internal';

type TextPointMapping =
  | Readonly<{ kind: 'moved'; path: Path }>
  | Readonly<{
      first: ReplacementPoint;
      kind: 'replaced';
      last: ReplacementPoint;
    }>
  | Readonly<{ index: number; kind: 'removed'; parent: Path; root: string }>;

export const migratePlateV54Urls = ({
  document,
  target: conversionTarget,
}: Pick<
  DocumentMigrationContext,
  'document' | 'target'
>): PlateV54StageResult => {
  const { elementType, mediaTypes } = resolveV54BuiltIns(conversionTarget);
  const fileType = elementType('file');
  const linkType = elementType('link');
  const paragraphType = elementType('paragraph') ?? 'paragraph';
  // Only string values are URLs; other invalid values keep failing closed.
  const rejects = (element: Element, key: string) => {
    const value = Reflect.get(element, key);
    const validate = conversionTarget.schema.property({
      key,
      placement: 'element',
      type: element.type,
    })?.value.validate;

    return (
      Object.hasOwn(element, key) &&
      typeof value === 'string' &&
      validate !== undefined &&
      !validate(value)
    );
  };
  const pointMappings = new Map<string, TextPointMapping>();
  const elementTargets = new Map<string, Path | null>();
  const recordedKeys: string[] = [];

  const migrateDescendant = (
    input: Descendant,
    from: Path,
    to: Path,
    root: string,
    record: boolean
  ): readonly Descendant[] => {
    if (TextApi.isText(input)) {
      if (record) {
        const key = pathKey(root, from);

        pointMappings.set(key, { kind: 'moved', path: to });
        recordedKeys.push(key);
      }

      return [input];
    }

    const unwrap = input.type === linkType && rejects(input, 'url');
    const replace =
      !unwrap && mediaTypes.has(input.type) && rejects(input, 'url');
    const recorded = recordedKeys.length;
    const children = unwrap
      ? migrateChildren(
          input.children,
          from,
          to.slice(0, -1),
          root,
          true,
          to.at(-1)
        )
      : migrateChildren(input.children, from, to, root, record || replace);

    if (unwrap) {
      elementTargets.set(pathKey(root, from), null);

      return children;
    }

    const element =
      children === input.children
        ? input
        : ({ ...input, children: [...children] } as Element);

    if (replace) {
      const label = Reflect.get(
        element,
        element.type === fileType ? 'name' : 'alt'
      );
      const caption = children.some(
        (child) => !TextApi.isText(child) || child.text !== ''
      );
      const labelText =
        !caption && typeof label === 'string' && label !== ''
          ? label
          : undefined;
      const content = caption
        ? [...children]
        : labelText !== undefined
          ? [{ text: labelText }]
          : undefined;

      elementTargets.set(pathKey(root, from), content ? to : null);
      if (!caption) {
        const removalParent = to.slice(0, -1);
        const removalIndex = to.at(-1) ?? 0;

        for (const key of recordedKeys.slice(recorded)) {
          pointMappings.set(
            key,
            labelText !== undefined
              ? {
                  first: { offset: 0, path: [...to, 0] },
                  kind: 'replaced',
                  last: { offset: labelText.length, path: [...to, 0] },
                }
              : {
                  index: removalIndex,
                  kind: 'removed',
                  parent: removalParent,
                  root,
                }
          );
        }
      }

      return content ? [{ children: content, type: paragraphType }] : [];
    }

    if (record) elementTargets.set(pathKey(root, from), to);
    if (mediaTypes.has(element.type) && rejects(element, 'sourceUrl')) {
      const { sourceUrl: _sourceUrl, ...withoutSourceUrl } = element;

      return [withoutSourceUrl];
    }

    return [element];
  };

  function migrateChildren(
    children: readonly Descendant[],
    from: Path,
    to: Path,
    root: string,
    record: boolean,
    start = 0
  ): readonly Descendant[] {
    let changed = false;
    const next: Descendant[] = [];

    children.forEach((child, index) => {
      const at = start + next.length;
      const migrated = migrateDescendant(
        child,
        [...from, index],
        [...to, at],
        root,
        record || at !== index
      );

      if (migrated.length !== 1 || migrated[0] !== child) changed = true;
      next.push(...migrated);
    });

    return changed ? next : children;
  }

  const migratedDocument = mapDocumentRoots(
    document,
    (rootChildren, root) =>
      migrateChildren(rootChildren, [], [], root, false) as Value
  );

  if (migratedDocument === document) return { document };

  const rootChildrenOf = (root: string) =>
    root === MAIN_ROOT_KEY
      ? migratedDocument.children
      : (migratedDocument.roots?.[root] ?? []);

  const mapPoint = (point: Point, edge: PointEdge): Point | null => {
    const key = pathKey(point.root ?? MAIN_ROOT_KEY, point.path);
    const mapping = pointMappings.get(key);

    if (!mapping) return point;
    if (mapping.kind === 'moved') {
      return { ...point, path: [...mapping.path] };
    }
    if (mapping.kind === 'replaced') {
      const landing = edge === 'start' ? mapping.last : mapping.first;

      return { ...point, offset: landing.offset, path: [...landing.path] };
    }

    const rootChildren = rootChildrenOf(mapping.root);
    const landing =
      edge === 'start'
        ? adjacentTextPoint(
            rootChildren,
            mapping.parent,
            mapping.index,
            'forward'
          )
        : edge === 'end'
          ? adjacentTextPoint(
              rootChildren,
              mapping.parent,
              mapping.index,
              'backward'
            )
          : (adjacentTextPoint(
              rootChildren,
              mapping.parent,
              mapping.index,
              'backward'
            ) ??
            adjacentTextPoint(
              rootChildren,
              mapping.parent,
              mapping.index,
              'forward'
            ));

    return landing
      ? { ...point, offset: landing.offset, path: [...landing.path] }
      : null;
  };

  return {
    document: migratedDocument,
    mapRange: createRangeMapper(mapPoint),
    mapSelection: (selection) => {
      if (!selection) return selection;
      if (RangeApi.isRange(selection)) {
        const anchor = mapPoint(selection.anchor, 'caret');
        const focus = mapPoint(selection.focus, 'caret');

        return anchor && focus ? { ...selection, anchor, focus } : null;
      }
      if (SelectionApi.isNode(selection)) {
        return mapNodeSelectionPaths(selection, (root, source) => {
          const key = pathKey(root, source);

          return elementTargets.has(key)
            ? (elementTargets.get(key) ?? null)
            : source;
        });
      }

      return selection;
    },
  };
};
