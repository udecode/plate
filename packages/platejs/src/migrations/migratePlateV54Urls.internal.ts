import {
  type Descendant,
  type EditorDocumentValue,
  type Element,
  MAIN_ROOT_KEY,
  type Path,
  type Point,
  RangeApi,
  type Selection,
  TextApi,
  type Value,
} from '../facade';
import type {
  DocumentMigrationContext,
  DocumentMigrationTarget,
} from './documentMigrations';

const getCompiledPlatePlugin = (
  target: DocumentMigrationTarget,
  name: string
) => target.bindings.find((binding) => binding.name === name);

/** `null` marks text that was removed with its media. */
type TextPointMapping = Readonly<{ offset?: number; path: Path }> | null;

const pointMappingKey = (root: string, path: readonly number[]) =>
  `${root}:${path.join('.')}`;

type PlateV54UrlMigrationResult = Readonly<{
  document: EditorDocumentValue;
  mapSelection?: (selection: Selection, mapped: Selection) => Selection;
}>;

/**
 * Neutralize legacy URLs the current schema rejects inside the Plate v54
 * migration, with the cleanup import applies to the same values: a link keeps
 * its label, media keeps its caption, or else its alt text or file name, as a
 * paragraph, and an optional source URL is omitted. An empty URL is unresolved,
 * not unsafe.
 */
export const migratePlateV54Urls = ({
  document,
  target: conversionTarget,
}: Pick<
  DocumentMigrationContext,
  'document' | 'target'
>): PlateV54UrlMigrationResult => {
  const resolveElementType = (name: string) =>
    getCompiledPlatePlugin(conversionTarget, name)?.type;
  const fileType = resolveElementType('file');
  const linkType = resolveElementType('link');
  const paragraphType = resolveElementType('paragraph') ?? 'paragraph';
  const mediaTypes = new Set(
    ['audio', 'file', 'image', 'mediaEmbed', 'video']
      .map(resolveElementType)
      .filter((type): type is string => type !== undefined)
  );
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
  // Change diffs read an unwrapped label as removed content, so every text
  // this step moves maps explicitly; unrecorded text keeps its path.
  const pointMappings = new Map<string, TextPointMapping>();
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
        const key = pointMappingKey(root, from);

        pointMappings.set(key, { path: to });
        recordedKeys.push(key);
      }

      return [input];
    }

    const unwrap = input.type === linkType && rejects(input, 'url');
    const replace =
      !unwrap && mediaTypes.has(input.type) && rejects(input, 'url');
    const recorded = recordedKeys.length;
    // An unwrapped label takes the link's place in its parent.
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

    if (unwrap) return children;

    const element =
      children === input.children
        ? input
        : ({ ...input, children: [...children] } as Element);

    if (replace) {
      // A file's visible label is its name; other media carry alt text.
      const label = Reflect.get(
        element,
        element.type === fileType ? 'name' : 'alt'
      );
      const caption = children.some(
        (child) => !TextApi.isText(child) || child.text !== ''
      );
      const content = caption
        ? [...children]
        : typeof label === 'string' && label !== ''
          ? [{ text: label }]
          : undefined;

      if (!caption) {
        for (const key of recordedKeys.slice(recorded)) {
          pointMappings.set(
            key,
            content ? { offset: 0, path: [...to, 0] } : null
          );
        }
      }

      return content ? [{ children: content, type: paragraphType }] : [];
    }
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

  const children = migrateChildren(
    document.children,
    [],
    [],
    MAIN_ROOT_KEY,
    false
  ) as Value;
  let { roots } = document;

  if (roots) {
    let changed = false;
    const next = Object.fromEntries(
      Object.entries(roots).map(([root, rootChildren]) => {
        const migrated = migrateChildren(
          rootChildren,
          [],
          [],
          root,
          false
        ) as Value;

        if (migrated !== rootChildren) changed = true;

        return [root, migrated];
      })
    );

    if (changed) roots = next;
  }

  if (children === document.children && roots === document.roots) {
    return { document };
  }

  const mapPoint = (point: Point): Point | null => {
    const key = pointMappingKey(point.root ?? MAIN_ROOT_KEY, point.path);

    if (!pointMappings.has(key)) return point;

    const mapping = pointMappings.get(key);

    return mapping
      ? {
          ...point,
          offset: mapping.offset ?? point.offset,
          path: mapping.path,
        }
      : null;
  };

  return {
    document: { ...document, children, ...(roots ? { roots } : {}) },
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
