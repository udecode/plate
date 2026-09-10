import {
  type Descendant,
  type EditorDocumentValue,
  ElementApi,
  MAIN_ROOT_KEY,
  NodeApi,
  type Path,
  type Point,
  RangeApi,
  type Selection,
  TextApi,
} from '../facade';
import type { DocumentMigrationContext } from '../lib/editor/documentMigrations';

type TextPointMapping = Readonly<{ offset: number; path: Path }>;

const pointMappingKey = (root: string, path: readonly number[]) =>
  `${root}:${path.join('.')}`;

type PlateV54CodeBlockMigrationResult = Readonly<{
  document: EditorDocumentValue;
  mapSelection?: (selection: Selection, mapped: Selection) => Selection;
}>;

/** Flatten legacy code-block lines inside the Plate v54 migration. */
export const migratePlateV54CodeBlocks = ({
  document,
  editor,
}: DocumentMigrationContext): PlateV54CodeBlockMigrationResult => {
  const { roots: inputRoots } = document;
  const codeBlockPlugin = editor.plugin('codeBlock');

  if (!codeBlockPlugin.installed) return { document };

  const codeBlockType = codeBlockPlugin.schema.type;
  const pointMappings = new Map<string, TextPointMapping>();
  const collectPointMappings = (
    input: Descendant,
    path: Path,
    targetPath: Path,
    root: string,
    offset: number
  ): number => {
    if (TextApi.isText(input)) {
      pointMappings.set(pointMappingKey(root, path), {
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
  const migrateDescendant = (
    input: Descendant,
    location: string,
    path: Path,
    root: string
  ): Descendant => {
    if (TextApi.isText(input)) return input;

    if (input.type === codeBlockType) {
      if (input.children.length === 1 && TextApi.isText(input.children[0])) {
        return input;
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

      return {
        ...input,
        children: [{ text: input.children.map(NodeApi.string).join('\n') }],
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

  const children = migrateChildren(
    document.children,
    'children',
    [],
    MAIN_ROOT_KEY
  );
  let roots = inputRoots;

  if (roots) {
    let rootsChanged = false;
    const nextRoots = Object.fromEntries(
      Object.entries(roots).map(([key, value]) => {
        const migrated = migrateChildren(value, `roots.${key}`, [], key);

        if (migrated !== value) rootsChanged = true;

        return [key, migrated];
      })
    );

    if (rootsChanged) {
      roots = nextRoots;
    }
  }

  if (children === document.children && roots === document.roots) {
    return { document };
  }

  const migrated = { ...document, children, ...(roots ? { roots } : {}) };
  const mapPoint = (point: Point) => {
    const mapping = pointMappings.get(
      pointMappingKey(point.root ?? MAIN_ROOT_KEY, point.path)
    );

    return mapping
      ? {
          ...point,
          offset: mapping.offset + point.offset,
          path: mapping.path,
        }
      : null;
  };

  return {
    document: migrated,
    mapSelection: (selection, mapped) => {
      if (!RangeApi.isRange(selection)) return mapped;

      const anchor = mapPoint(selection.anchor);
      const focus = mapPoint(selection.focus);

      if (!mapped && (!anchor || !focus)) return mapped;

      const fallback = RangeApi.isRange(mapped) ? mapped : selection;

      return {
        ...fallback,
        anchor: anchor ?? fallback.anchor,
        focus: focus ?? fallback.focus,
      };
    },
  };
};
