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
import { getFirstPartyBinding } from './documentMigrationFirstParty.internal';
import type { DocumentMigrationContext } from './documentMigrations';
import { migratePlateV54ReplacementText } from './migratePlateV54Suggestions.internal';

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
  target: conversionTarget,
}: DocumentMigrationContext): PlateV54CodeBlockMigrationResult => {
  const { roots: inputRoots } = document;
  const codeBlockDescriptor = getFirstPartyBinding(
    conversionTarget,
    'codeBlock'
  );

  if (!codeBlockDescriptor?.type) return { document };

  const codeBlockType = codeBlockDescriptor.type;
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
  // Flattening rewrites only a code block's own children, so a point outside
  // every converted block keeps its path and offset.
  const mapPoint = (point: Point): Point => {
    const mapping = pointMappings.get(
      pointMappingKey(point.root ?? MAIN_ROOT_KEY, point.path)
    );

    return mapping
      ? {
          ...point,
          offset: mapping.offset + point.offset,
          path: mapping.path,
        }
      : point;
  };

  return {
    document: migrated,
    mapSelection: (selection, mapped) =>
      RangeApi.isRange(selection)
        ? {
            ...selection,
            anchor: mapPoint(selection.anchor),
            focus: mapPoint(selection.focus),
          }
        : mapped,
  };
};
