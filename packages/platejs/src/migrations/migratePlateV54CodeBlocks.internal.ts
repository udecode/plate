import type { AuthoredMark } from '../authored';
import {
  type Descendant,
  ElementApi,
  MAIN_ROOT_KEY,
  NodeApi,
  type Path,
  PathApi,
  type Point,
  RangeApi,
  SelectionApi,
  type Text,
  TextApi,
} from '../facade';
import type { DocumentMigrationContext } from './documentMigrations';
import { resolveV54BuiltIns } from './migratePlateV54BuiltIns.internal';
import {
  createRangeMapper,
  mapDocumentRoots,
  mapNodeSelectionPaths,
  pathKey,
  type PlateV54StageResult,
} from './migratePlateV54Stage.internal';
import { migratePlateV54ReplacementText } from './migratePlateV54Suggestions.internal';

type TextPointMapping = Readonly<{ offset: number; path: Path }>;

export const migratePlateV54CodeBlocks = ({
  document,
  target: conversionTarget,
}: DocumentMigrationContext): PlateV54StageResult => {
  const codeBlockType =
    resolveV54BuiltIns(conversionTarget).elementType('codeBlock');

  if (!codeBlockType) return { document };

  const pointMappings = new Map<string, TextPointMapping>();
  const flattenedBlocks = new Map<string, Path[]>();
  const collectPointMappings = (
    input: Descendant,
    path: Path,
    targetPath: Path,
    root: string,
    offset: number
  ): number => {
    if (TextApi.isText(input)) {
      pointMappings.set(pathKey(root, path), {
        offset,
        path: targetPath,
      });

      return offset + input.text.length;
    }

    return input.children.reduce(
      (nextOffset, child, index) =>
        collectPointMappings(
          child,
          [...path, index],
          targetPath,
          root,
          nextOffset
        ),
      offset
    );
  };
  const isAllowedCodeTextProperty = (key: string) =>
    Boolean(
      conversionTarget.schema.property({
        key,
        placement: 'text',
        type: codeBlockType,
      })
    );
  const stripDisallowedCodeText = (child: Text): Text => {
    let changed = false;
    const next: Record<string, unknown> = { text: child.text };

    for (const [key, value] of Object.entries(child)) {
      if (key === 'text') continue;
      if (!isAllowedCodeTextProperty(key)) {
        changed = true;
        continue;
      }
      if (key === 'authored' && Array.isArray(value)) {
        const filtered = (value as readonly AuthoredMark[]).filter(
          (mark) =>
            mark.kind !== 'format' || isAllowedCodeTextProperty(mark.key)
        );

        if (filtered.length !== value.length) {
          changed = true;
        }
        if (filtered.length > 0) {
          next[key] = filtered;
        }
        continue;
      }
      next[key] = value;
    }

    return changed ? (next as Text) : child;
  };
  const migrateDescendant = (
    input: Descendant,
    location: string,
    path: Path,
    root: string
  ): Descendant => {
    if (TextApi.isText(input)) return input;

    if (input.type === codeBlockType) {
      if (
        input.children.length > 0 &&
        input.children.every((child) => TextApi.isText(child))
      ) {
        let changed = false;
        const children = input.children.map((child) => {
          const nextChild = stripDisallowedCodeText(child);

          if (nextChild !== child) changed = true;

          return nextChild;
        });

        return changed ? { ...input, children } : input;
      }

      if (!input.children.every((child) => ElementApi.isElement(child))) {
        throw new Error(
          `Plate v54 migration cannot flatten code block at ${location}: expected legacy line elements.`
        );
      }

      let offset = 0;

      input.children.forEach((line, index) => {
        offset = collectPointMappings(
          line,
          [...path, index],
          [...path, 0],
          root,
          offset
        );
        if (index < input.children.length - 1) offset += 1;
      });
      const blocks = flattenedBlocks.get(root);

      if (blocks) blocks.push(path);
      else flattenedBlocks.set(root, [path]);

      return {
        ...input,
        children: [
          migratePlateV54ReplacementText(
            input.children,
            input.children.map(NodeApi.string).join('\n'),
            location
          ),
        ],
      };
    }

    const children = migrateChildren(
      input.children,
      `${location}.children`,
      path,
      root
    );

    return children === input.children ? input : { ...input, children };
  };

  function migrateChildren<T extends readonly Descendant[]>(
    children: T,
    location: string,
    parentPath: Path,
    root: string
  ): T {
    let changed = false;
    const next = children.map((child, index) => {
      const migrated = migrateDescendant(
        child,
        `${location}.${index}`,
        [...parentPath, index],
        root
      );

      if (migrated !== child) changed = true;

      return migrated;
    });

    return (changed ? next : children) as T;
  }

  const migrated = mapDocumentRoots(document, (rootChildren, root) =>
    migrateChildren(
      rootChildren,
      root === MAIN_ROOT_KEY ? 'children' : `roots.${root}`,
      [],
      root
    )
  );

  if (migrated === document) return { document };

  const mapPoint = (point: Point): Point => {
    const mapping = pointMappings.get(
      pathKey(point.root ?? MAIN_ROOT_KEY, point.path)
    );

    return mapping
      ? {
          ...point,
          offset: mapping.offset + point.offset,
          path: [...mapping.path],
        }
      : point;
  };

  return {
    document: migrated,
    mapRange: createRangeMapper(mapPoint),
    mapSelection: (selection) => {
      if (!selection) return selection;
      if (RangeApi.isRange(selection)) {
        return {
          ...selection,
          anchor: mapPoint(selection.anchor),
          focus: mapPoint(selection.focus),
        };
      }
      if (SelectionApi.isNode(selection)) {
        return mapNodeSelectionPaths(selection, (root, source) => {
          const blocks = flattenedBlocks.get(root);

          return blocks?.some((blockPath) =>
            PathApi.isAncestor(blockPath, source)
          )
            ? null
            : source;
        });
      }

      return selection;
    },
  };
};
