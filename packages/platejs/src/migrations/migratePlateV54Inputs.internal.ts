import type { AuthoredMark } from '../authored';
import {
  type Descendant,
  type EditorDocumentValue,
  type Element,
  ElementApi,
  MAIN_ROOT_KEY,
  NodeApi,
  type Point,
  type Range,
  RangeApi,
  type Selection,
  TextApi,
  type Value,
} from '../facade';
import type { DocumentMigrationContext } from './documentMigrations';
import { resolveV54BuiltIns } from './migratePlateV54BuiltIns.internal';
import {
  migratePlateV54DrawingCodeText,
  migratePlateV54ReplacementText,
} from './migratePlateV54Suggestions.internal';
import { V53_FIRST_PARTY_IDENTITIES } from './v53-manifest.internal';

const LEGACY_INPUT_TRIGGERS: ReadonlyMap<string, string> = new Map(
  V53_FIRST_PARTY_IDENTITIES.flatMap((entry) =>
    entry.kind === 'input-literal' ? [[entry.identity, entry.trigger]] : []
  )
);

type KeptChildIndex = number;
type ReplacementPoint = Readonly<{ offset: number; path: number[] }>;
type Replacement = Readonly<{ caret: ReplacementPoint }> &
  (
    | Readonly<{ endEdge: ReplacementPoint; startEdge: ReplacementPoint }>
    | Readonly<{
        text: (inner: readonly number[], offset: number) => ReplacementPoint;
      }>
  );
type ChildMapping = KeptChildIndex | Replacement;
type PointEdge = 'caret' | 'end' | 'start';

// v53's textarea and select showed a saved value the way String() does: an
// array joins its items, and any other object reads [object Object].
const shown = (value: unknown, fallback: string): string => {
  if (value === null || value === undefined) return fallback;
  if (Array.isArray(value)) return value.join(',');
  if (typeof value === 'object') return '[object Object]';

  return typeof value === 'string' ? value : JSON.stringify(value);
};

const parentKey = (root: string, path: readonly number[]) =>
  `${root}:${path.join('.')}`;

const drawingData = (drawing: Element): Record<string, unknown> => {
  const { data } = drawing;

  return typeof data === 'object' && data !== null && !Array.isArray(data)
    ? (data as Record<string, unknown>)
    : {};
};

const hasContent = (input: Element) =>
  input.children.some((child) => !TextApi.isText(child) || child.text !== '');

const lettersBefore = (
  children: readonly Descendant[],
  [index, ...inner]: readonly number[]
): number => {
  const before = children
    .slice(0, index)
    .reduce((length, child) => length + NodeApi.string(child).length, 0);
  const child = children[index];

  return inner.length > 0 && ElementApi.isElement(child)
    ? before + lettersBefore(child.children, inner)
    : before;
};

type PlateV54InputMigrationResult = Readonly<{
  document: EditorDocumentValue;
  mapRange?: (range: Range) => Range;
  mapSelection?: (selection: Selection) => Selection;
}>;

export const migratePlateV54Inputs = ({
  document,
  target,
}: DocumentMigrationContext): PlateV54InputMigrationResult => {
  const childMappings = new Map<string, ChildMapping[]>();
  const drawingTarget = target.schema.element('code_drawing')
    ? undefined
    : resolveV54BuiltIns(target).elementType('codeBlock');

  // A v53 drawing becomes a code block before the profile stage, so the later
  // stages upgrade its block properties as they do any code block's. Without a
  // saved code, its only content is the text v53's Turn into left in it.
  const drawing = (
    source: Element,
    codeBlockType: string,
    location: string
  ): Element => {
    const { data: _data, ...input } = source;
    const record = drawingData(source);
    const authored = Reflect.get(input, 'authored') as
      | readonly AuthoredMark[]
      | undefined;

    if (
      authored?.some((mark) => mark.kind === 'format' && mark.key === 'data')
    ) {
      throw new Error(
        `Plate v54 migration cannot keep the suggested change to the drawing at ${location}, because the code block it becomes has no data.`
      );
    }

    return {
      ...input,
      children: [
        Object.hasOwn(record, 'code')
          ? migratePlateV54DrawingCodeText(input, shown(record.code, ''))
          : migratePlateV54ReplacementText(
              input.children,
              NodeApi.string(input),
              location
            ),
      ],
      language: shown(record.drawingType, 'Mermaid').toLowerCase(),
      type: codeBlockType,
    };
  };

  const literal = (
    input: Element,
    trigger: string,
    previous: Descendant | undefined
  ): Descendant[] => {
    const storedTrigger = Reflect.get(input, 'trigger');
    const value = Reflect.get(input, 'value');
    const stored =
      typeof storedTrigger === 'string' && storedTrigger !== ''
        ? storedTrigger
        : trigger;
    const prefix =
      stored === '[^' &&
      previous !== undefined &&
      TextApi.isText(previous) &&
      previous.text.endsWith('[')
        ? '^'
        : stored;
    if (hasContent(input)) return [{ text: prefix }, ...input.children];

    return [
      {
        text: prefix + (typeof value === 'string' ? value : ''),
      },
    ];
  };

  const migrateChildren = (
    children: readonly Descendant[],
    from: readonly number[],
    to: readonly number[],
    root: string
  ): readonly Descendant[] => {
    const next: Descendant[] = [];
    const mapping: ChildMapping[] = [];
    let changed = false;

    children.forEach((child, index) => {
      const at = next.length;

      if (
        drawingTarget &&
        ElementApi.isElement(child) &&
        child.type === 'code_drawing'
      ) {
        const location = [
          root === MAIN_ROOT_KEY ? 'children' : `roots.${root}`,
          [...from, index].join('.children.'),
        ].join('.');

        const path = [...to, at, 0];
        const start = { offset: 0, path };

        next.push(drawing(child, drawingTarget, location));
        mapping.push(
          Object.hasOwn(drawingData(child), 'code')
            ? {
                caret: start,
                endEdge: start,
                startEdge: { offset: NodeApi.string(next[at]).length, path },
              }
            : {
                caret: start,
                text: (inner, offset) => ({
                  offset: lettersBefore(child.children, inner) + offset,
                  path,
                }),
              }
        );
        changed = true;

        return;
      }

      const trigger = ElementApi.isElement(child)
        ? LEGACY_INPUT_TRIGGERS.get(child.type)
        : undefined;

      if (trigger !== undefined && ElementApi.isElement(child)) {
        const text = literal(child, trigger, next.at(-1));
        const last = text.at(-1);

        next.push(...text);

        const end = {
          offset: last && TextApi.isText(last) ? last.text.length : 0,
          path: [...to, next.length - 1],
        };

        mapping.push(
          hasContent(child)
            ? {
                caret: end,
                text: ([first, ...inner], offset) => ({
                  offset,
                  path: [...to, at + 1 + first, ...inner],
                }),
              }
            : {
                caret: end,
                endEdge: { offset: 0, path: end.path },
                startEdge: end,
              }
        );
        changed = true;

        return;
      }

      mapping.push(at);
      if (at !== index) changed = true;

      if (TextApi.isText(child)) {
        next.push(child);

        return;
      }

      const migrated = migrateChildren(
        child.children,
        [...from, index],
        [...to, at],
        root
      );

      next.push(
        migrated === child.children
          ? child
          : { ...child, children: [...migrated] }
      );
      if (migrated !== child.children) changed = true;
    });

    if (!changed) return children;

    childMappings.set(parentKey(root, from), mapping);

    return next;
  };

  const children = migrateChildren(
    document.children,
    [],
    [],
    MAIN_ROOT_KEY
  ) as Value;
  let { roots } = document;

  if (roots) {
    let changed = false;
    const next = Object.fromEntries(
      Object.entries(roots).map(([root, rootChildren]) => {
        const migrated = migrateChildren(rootChildren, [], [], root) as Value;

        if (migrated !== rootChildren) changed = true;

        return [root, migrated];
      })
    );

    if (changed) roots = next;
  }

  if (children === document.children && roots === document.roots) {
    return { document };
  }

  const mapPoint = (point: Point, edge: PointEdge): Point => {
    const root = point.root ?? MAIN_ROOT_KEY;
    const path: number[] = [];

    for (const [depth, index] of point.path.entries()) {
      const mapped = childMappings.get(
        parentKey(root, point.path.slice(0, depth))
      )?.[index];

      if (mapped === undefined) {
        path.push(index);
        continue;
      }
      if (typeof mapped === 'number') {
        path.push(mapped);
        continue;
      }

      const landing =
        edge === 'caret'
          ? mapped.caret
          : 'text' in mapped
            ? mapped.text(point.path.slice(depth + 1), point.offset)
            : edge === 'start'
              ? mapped.startEdge
              : mapped.endEdge;

      return { ...point, offset: landing.offset, path: [...landing.path] };
    }

    return { ...point, path };
  };

  return {
    document: { ...document, children, ...(roots ? { roots } : {}) },
    mapRange: (range) => {
      const backward = RangeApi.isBackward(range);

      return {
        anchor: mapPoint(range.anchor, backward ? 'end' : 'start'),
        focus: mapPoint(range.focus, backward ? 'start' : 'end'),
      };
    },
    mapSelection: (selection) =>
      RangeApi.isRange(selection)
        ? {
            ...selection,
            anchor: mapPoint(selection.anchor, 'caret'),
            focus: mapPoint(selection.focus, 'caret'),
          }
        : selection,
  };
};
