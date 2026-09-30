import { render } from '@testing-library/react';
import React from 'react';

import {
  ElementApi,
  NodeApi,
  property,
  schema,
  TextApi,
  type Descendant,
  type EditorDocumentValue,
  type Element,
  type Path,
  type RenderStaticNodeWrapper,
  type Text,
} from '../../core';
import { BaseHeadingPlugin } from '../../features/basic-nodes/lib/BaseHeadingPlugins';
import { BaseListPlugin } from '../../features/list/lib/BaseListPlugin';
import {
  BaseTableCellPlugin,
  BaseTablePlugin,
  BaseTableRowPlugin,
} from '../../features/table/lib/BaseTablePlugin';
import { BaseTocPlugin } from '../../features/toc/lib/BaseTocPlugin';
import {
  BaseParagraphPlugin,
  type Editor,
  createEditor,
  definePlugin,
} from '../../lib';
import { EditorStatic } from './PlateStatic';
import { type EditorElementProps, EditorElement } from './plite-nodes';

// The reuse law: re-rendering a sequence of documents reuses work, and the DOM
// after each step equals a fresh render of that step's document. Generated
// documents keep unchanged nodes by identity, as a streaming parser does.

const SPEC_PATH = 'src/static/components/PlateStatic.reuse-oracle.spec.tsx';
const STEPS = 20;
const MAX_BLOCKS = 7;

type Mode = 'document' | 'editor';
// Caption documents add figures whose caption is an element-owned content root.
type Profile = 'blocks' | 'captions';

// Regression seeds: blocks 4 reused a table holding a table of contents,
// blocks 31 kept a list ordinal after an earlier item became numbered, and
// captions 2 reuses a table of contents inside a figure caption.
const SEEDS: Record<Profile, Record<Mode, readonly number[]>> = {
  blocks: { document: [1, 2, 3, 4], editor: [1, 2, 31] },
  captions: { document: [1, 2], editor: [1, 2] },
};

// `PLATE_STATIC_ORACLE_SEEDS=31` replays one seed and `=1-200` sweeps a range.
const [seedFrom, seedTo = seedFrom] = (
  process.env.PLATE_STATIC_ORACLE_SEEDS ?? ''
)
  .split('-')
  .map(Number);
const chosenSeeds = seedFrom
  ? Array.from(
      { length: seedTo - seedFrom + 1 },
      (_, index) => seedFrom + index
    )
  : null;

/** Mulberry32, so a seed replays the exact document sequence. */
const createRandom = (seed: number) => {
  let state = seed >>> 0;
  const next = () => {
    state = (state + 0x6d_2b_79_f5) >>> 0;
    let value = state;

    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);

    return ((value ^ (value >>> 14)) >>> 0) / 4_294_967_296;
  };
  const int = (max: number) => Math.floor(next() * max);

  return {
    chance: (probability: number) => next() < probability,
    int,
    pick: <T,>(items: readonly T[]) => items[int(items.length)],
    weighted: <T,>(entries: ReadonlyArray<readonly [number, T]>) => {
      let roll = int(entries.reduce((total, [weight]) => total + weight, 0));

      for (const [weight, value] of entries) {
        if (roll < weight) return value;
        roll -= weight;
      }

      throw new Error('Weighted entries are empty.');
    },
  };
};

type Random = ReturnType<typeof createRandom>;

// Plugins. Real plugins where they exist, with renderers that read beyond
// their element the way registry components do.

let elementRenders = 0;

function CountedElement(props: Parameters<typeof EditorElement>[0]) {
  elementRenders += 1;

  return <EditorElement {...props} />;
}

// Reads every heading of the document, including later ones.
function TocElement(props: EditorElementProps<typeof BaseTocPlugin>) {
  elementRenders += 1;
  const headings = props.editor.plugin(BaseTocPlugin).read.headings();

  return (
    <EditorElement {...props}>
      <nav>
        {headings.map(({ depth, title }) => `${depth}:${title}`).join('|')}
      </nav>
      {props.children}
    </EditorElement>
  );
}

// Reads the whole table: column widths, the grid width and its row height.
function TableCellElement(
  props: EditorElementProps<typeof BaseTableCellPlugin>
) {
  elementRenders += 1;
  const cell = props.editor
    .plugin(BaseTablePlugin)
    .read.cell({ at: props.path });
  const borders = cell
    ? Object.entries(cell.borders)
        .map(([side, border]) => `${side}:${border?.width}`)
        .join(',')
    : '';

  return (
    <EditorElement
      {...props}
      attributes={{
        ...props.attributes,
        'data-cell': cell
          ? `${cell.size.width}x${cell.size.minHeight} ${cell.colSpan}/${cell.rowSpan} ${borders}`
          : 'none',
      }}
    />
  );
}

// Reads earlier siblings, as the registry list numbering does.
const NumberedList: RenderStaticNodeWrapper<typeof BaseListPlugin> = ({
  element,
}) =>
  element.listType === 'numbered'
    ? (props) => (
        <ol
          start={props.editor
            .plugin(BaseListPlugin)
            .read.ordinal(props.element)}
        >
          <li>{props.children}</li>
        </ol>
      )
    : undefined;

const textEntries = (
  node: Descendant,
  path: Path
): ReadonlyArray<readonly [Text, Path]> =>
  TextApi.isText(node)
    ? [[node, path]]
    : node.type === 'toc' || node.type === 'figure'
      ? []
      : node.children.flatMap((child, index) =>
          textEntries(child, [...path, index])
        );

const decoration = (
  attribute: string,
  key: string,
  path: Path,
  start: number,
  end: number
) => ({
  attributes: { [attribute]: '' },
  key,
  range: { anchor: { offset: start, path }, focus: { offset: end, path } },
});

// Content-local: each run of digits in a text.
const DigitsPlugin = definePlugin('oracleDigits', {
  decorate: {
    read: ({ entry: [node, path] }) =>
      TextApi.isText(node)
        ? [...node.text.matchAll(/\d+/g)].map(({ 0: digits, index }) =>
            decoration(
              'data-digits',
              `digits:${index}`,
              path,
              index,
              index + digits.length
            )
          )
        : [],
  },
});

// Content-local, read once at the block as element-level highlighting is.
const BlockLeadPlugin = definePlugin('oracleBlockLead', {
  decorate: {
    read: ({ entry: [node, path] }) =>
      path.length === 1 &&
      ElementApi.isElement(node) &&
      (node.type === 'heading' || node.type === 'table')
        ? textEntries(node, path).map(([text, textPath]) =>
            decoration(
              'data-lead',
              'lead',
              textPath,
              0,
              Math.min(2, text.text.length)
            )
          )
        : [],
  },
});

// Reads forward: marks the document's last text, like a streaming end marker.
const LastTextPlugin = definePlugin('oracleLastText', {
  decorate: {
    read: ({ editor, entry: [node, path] }) =>
      TextApi.isText(node) &&
      NodeApi.last({ children: editor.read.children(), type: '' }, [])[0] ===
        node
        ? [decoration('data-last', 'last', path, 0, node.text.length)]
        : [],
  },
});

// Reads backward: marks a block's first text when a heading precedes it.
const AfterHeadingPlugin = definePlugin('oracleAfterHeading', {
  decorate: {
    read: ({ editor, entry: [node, path] }) => {
      const [index = 0] = path;
      const blocks = editor.read.children();
      // Content-root entries carry paths within their own root.
      const previous =
        path.length === 1 && index > 0 && blocks[index] === node
          ? blocks[index - 1]
          : undefined;

      if (
        !ElementApi.isElement(node) ||
        !ElementApi.isElement(previous) ||
        previous.type !== 'heading'
      ) {
        return [];
      }

      const [first] = textEntries(node, path);

      return first
        ? [
            decoration(
              'data-after-heading',
              'after-heading',
              first[1],
              0,
              first[0].text.length
            ),
          ]
        : [];
    },
  },
});

// Renders an element-owned content root, the caption, inside the block.
const FigurePlugin = definePlugin('figure', {
  component: (props) => {
    elementRenders += 1;

    return (
      <EditorElement {...props}>
        <figcaption>{props.slots.contentRoot('caption')}</figcaption>
        {props.children}
      </EditorElement>
    );
  },
  schema: {
    element: {
      contentRoots: {
        caption: {
          content: schema.content.types(['paragraph', 'heading', 'toc'], {
            default: { type: 'paragraph' },
            min: 1,
          }),
          ownership: 'exclusive',
        },
      },
      blockContent: true,
      void: 'block',
    },
  },
});

const plugins = [
  definePlugin('bold', {
    schema: { mark: property.boolean({ default: false, omitDefault: true }) },
  }),
  BaseParagraphPlugin.configure({ component: CountedElement }),
  BaseHeadingPlugin.configure({ component: CountedElement }),
  BaseListPlugin.configure({ slots: { wrapNodeChildren: NumberedList } }),
  BaseTablePlugin.configure({ component: CountedElement }),
  BaseTableRowPlugin.configure({ component: CountedElement }),
  BaseTableCellPlugin.configure({ component: TableCellElement }),
  FigurePlugin,
  DigitsPlugin,
  BlockLeadPlugin,
  LastTextPlugin,
  AfterHeadingPlugin,
];
const declaredPlugins = [
  ...plugins,
  BaseTocPlugin.configure({ component: TocElement }),
];
const undeclaredPlugins = [
  ...plugins,
  BaseTocPlugin.configure({
    component: TocElement,
    render: { readsDocument: false },
  }),
];

const createOracleEditor = (tocReadsDocument: boolean) =>
  createEditor({
    plugins: tocReadsDocument ? declaredPlugins : undeclaredPlugins,
  });

// Documents.

const WORDS = ['alpha', 'beta 2', 'gamma', 'delta 40', 'eps', 'zeta 7'];

const word = (random: Random) => random.pick(WORDS);

const listProperties = (random: Random) => ({
  indent: random.pick([1, 1, 2]),
  listType: 'numbered',
  ...random.weighted<object>([
    [4, {}],
    [1, { listRestart: 1 + random.int(4) }],
    [1, { listStart: 2 + random.int(4) }],
  ]),
});

const paragraph = (random: Random, list = random.chance(0.45)): Element => ({
  // Alternating marks keep adjacent texts from merging.
  children: Array.from({ length: 1 + random.int(3) }, (_, index) =>
    index % 2 ? { bold: true, text: word(random) } : { text: word(random) }
  ),
  type: 'paragraph',
  ...(list ? listProperties(random) : {}),
});

const heading = (random: Random): Element => ({
  children: [{ text: word(random) }],
  level: 1 + random.int(3),
  type: 'heading',
});

const toc = (): Element => ({ children: [{ text: '' }], type: 'toc' });

const tableCell = (random: Random): Element => ({
  children: [
    random.weighted([
      [8, () => paragraph(random, false)],
      [2, () => heading(random)],
      [1, toc],
    ])(),
  ],
  type: 'tableCell',
  ...(random.chance(0.3)
    ? { borders: { right: { width: random.int(3) } } }
    : {}),
});

const columnWidths = (random: Random, count: number) =>
  Array.from({ length: count }, () => 40 + 20 * random.int(3));

const table = (random: Random): Element => {
  const columns = 1 + random.int(2);

  return {
    children: Array.from({ length: 1 + random.int(2) }, () => ({
      children: Array.from({ length: columns }, () => tableCell(random)),
      type: 'tableRow',
    })),
    type: 'table',
    ...(random.chance(0.5)
      ? { columnWidths: columnWidths(random, columns) }
      : {}),
  };
};

type Roots = Record<string, readonly Element[]>;

const captionKey = (node: Descendant) =>
  ElementApi.isElement(node) && node.type === 'figure'
    ? (node.childRoots as { caption: string }).caption
    : undefined;

const captionBlock = (random: Random) =>
  random.weighted([
    [5, () => paragraph(random)],
    [2, () => heading(random)],
    [2, toc],
  ])();

// Registers the new caption in `roots`.
const figure = (random: Random, roots: Roots): Element => {
  const key = `caption:${random.int(1_000_000_000)}`;

  roots[key] = Array.from({ length: 1 + random.int(2) }, () =>
    captionBlock(random)
  );

  return {
    childRoots: { caption: key },
    children: [{ text: '' }],
    type: 'figure',
  };
};

// A zero weight draws the same numbers, so blocks seeds replay unchanged.
const block = (random: Random, roots: Roots, captions: boolean) =>
  random.weighted([
    [4, () => paragraph(random)],
    [3, () => heading(random)],
    [2, () => table(random)],
    [1, toc],
    [captions ? 2 : 0, () => figure(random, roots)],
  ])();

// Keeps the captions the blocks reference, as each root has one owner.
const withRoots = (
  children: readonly Element[],
  roots: Roots
): EditorDocumentValue => {
  const keys = children.flatMap((node) => captionKey(node) ?? []);

  return keys.length === 0
    ? { children }
    : {
        children,
        roots: Object.fromEntries(keys.map((key) => [key, roots[key]])),
      };
};

const updateText = (
  node: Descendant,
  [index, ...rest]: Path,
  update: (text: string) => string
): Descendant =>
  TextApi.isText(node)
    ? { ...node, text: update(node.text) }
    : {
        ...node,
        children: node.children.map((child, childIndex) =>
          childIndex === index ? updateText(child, rest, update) : child
        ),
      };

const withoutKeys = (element: Element, keys: readonly string[]): Element =>
  Object.fromEntries(
    Object.entries(element).filter(([key]) => !keys.includes(key))
  ) as Element;

// A new object for an existing block, with some of its content kept.
const changeBlock = (random: Random, node: Element): Element => {
  if (node.type === 'heading') {
    return random.chance(0.5)
      ? { ...node, level: (Number(node.level) % 3) + 1 }
      : (updateText(node, [0], () => word(random)) as Element);
  }
  if (node.type === 'paragraph') {
    if (!node.listType) return { ...node, ...listProperties(random) };

    return random.chance(0.5)
      ? withoutKeys(node, ['indent', 'listRestart', 'listStart', 'listType'])
      : { ...node, listRestart: 1 + random.int(4) };
  }
  if (node.type !== 'table') return { ...node };

  const rows = node.children as readonly Element[];
  const rowIndex = random.int(rows.length);
  const row = rows[rowIndex];
  const withRow = (next: Element) => ({
    ...node,
    children: rows.map((current, index) =>
      index === rowIndex ? next : current
    ),
  });

  return random.weighted<() => Element>([
    [
      1,
      () =>
        node.columnWidths
          ? withoutKeys(node, ['columnWidths'])
          : { ...node, columnWidths: columnWidths(random, 3) },
    ],
    [
      1,
      () =>
        withRow({
          ...row,
          children:
            row.children.length > 1 && random.chance(0.5)
              ? row.children.slice(0, -1)
              : [...row.children, tableCell(random)],
        }),
    ],
    [1, () => withRow({ ...row, height: 10 * (1 + random.int(3)) })],
  ])();
};

const initialDocument = (
  random: Random,
  captions: boolean
): EditorDocumentValue => {
  const roots: Roots = {};

  return withRoots(
    [
      ...(random.chance(0.7) ? [toc()] : []),
      ...Array.from({ length: 1 + random.int(3) }, () =>
        block(random, roots, captions)
      ),
    ],
    roots
  );
};

type Step = Readonly<{ document: EditorDocumentValue; label: string }>;

const nextStep = (
  random: Random,
  document: EditorDocumentValue,
  captions: boolean
): Step => {
  const { children } = document;
  const count = children.length;
  const roots: Roots = { ...document.roots };
  const at = (label: string, next: readonly Element[]): Step => ({
    document: withRoots(next, roots),
    label,
  });
  const replaceAt = (index: number, node: Element) =>
    children.map((current, currentIndex) =>
      currentIndex === index ? node : current
    );
  const editableTexts = (index: number) =>
    textEntries(children[index], []).map(([, path]) => path);
  const append = () => {
    const node = block(random, roots, captions);

    return at(`append ${node.type}`, [...children, node]);
  };
  let kind = random.weighted([
    [6, 'append'],
    [6, 'grow'],
    [2, 'replace'],
    [2, 'insert'],
    [2, 'delete'],
    [3, 'nested'],
    [1, 'same'],
    [1, 'rewrap'],
    [1, 'respread'],
    [1, 'clone'],
    [captions ? 3 : 0, 'caption'],
  ] as const);

  if (count >= MAX_BLOCKS && (kind === 'append' || kind === 'insert')) {
    kind = 'delete';
  }
  if (count < 2 && (kind === 'delete' || kind === 'replace')) kind = 'append';

  switch (kind) {
    case 'append': {
      return append();
    }
    case 'grow': {
      const last = editableTexts(count - 1).at(-1);

      if (!last) return append();

      const suffix = random.pick([' 1', 'x', ' 23', 'y']);

      return at(
        `grow [${count - 1}] by ${JSON.stringify(suffix)}`,
        replaceAt(
          count - 1,
          updateText(
            children[count - 1],
            last,
            (text) => text + suffix
          ) as Element
        )
      );
    }
    case 'replace': {
      const index = random.int(count - 1);
      const node = children[index];
      const next =
        ElementApi.isElement(node) && random.chance(0.6)
          ? changeBlock(random, node)
          : block(random, roots, captions);

      return at(`replace [${index}] with ${next.type}`, replaceAt(index, next));
    }
    case 'insert': {
      const index = random.int(count);
      const node = block(random, roots, captions);

      return at(`insert ${node.type} before [${index}]`, [
        ...children.slice(0, index),
        node,
        ...children.slice(index),
      ]);
    }
    case 'delete': {
      const index = random.int(count);

      return at(
        `delete [${index}]`,
        children.filter((_, current) => current !== index)
      );
    }
    case 'nested': {
      const index = random.int(count);
      const paths = editableTexts(index);

      if (paths.length === 0) return append();

      const path = random.pick(paths);

      return at(
        `set text [${[index, ...path].join(',')}]`,
        replaceAt(
          index,
          updateText(children[index], path, () => word(random)) as Element
        )
      );
    }
    case 'same': {
      return { document, label: 'same document' };
    }
    case 'rewrap': {
      return { document: { ...document }, label: 'same children array' };
    }
    case 'respread': {
      return at('same blocks, new array', [...children]);
    }
    case 'clone': {
      return { document: structuredClone(document), label: 'deep copy' };
    }
    default: {
      const figures = children.flatMap((node, index) =>
        captionKey(node) ? [index] : []
      );

      if (figures.length === 0) return append();

      const index = random.pick(figures);
      const key = captionKey(children[index])!;
      const caption = roots[key];
      const target = random.int(caption.length);

      // The figure keeps its identity; only its content root changes.
      roots[key] = random.weighted<() => readonly Element[]>([
        [
          2,
          () =>
            caption.map((node, current) =>
              current === target ? changeBlock(random, node) : node
            ),
        ],
        [
          1,
          () =>
            caption.length < 3
              ? [...caption, captionBlock(random)]
              : caption.slice(1),
        ],
      ])();

      return at(`change the caption of [${index}]`, children);
    }
  }
};

// Oracle.

type Mismatch = Readonly<{ blockTypes: readonly string[]; report: string }>;

type OracleRun = Readonly<{
  freshRenders: number;
  mismatch: Mismatch | null;
  reusedRenders: number;
  seed: number;
}>;

const renderFresh = (editor: Editor, value?: EditorDocumentValue) => {
  const view = render(<EditorStatic document={value} editor={editor} />, {
    container: document.createElement('div'),
  });
  const html = view.container.innerHTML;

  view.unmount();

  return html;
};

const renderedBlocks = (html: string) => {
  const host = document.createElement('div');

  host.innerHTML = html;

  return [...(host.firstElementChild?.children ?? [])].map(
    (node) => node.outerHTML
  );
};

const firstDifference = (expected: string, actual: string) => {
  let index = 0;

  while (index < expected.length && expected[index] === actual[index]) {
    index += 1;
  }

  const excerpt = (html: string) =>
    JSON.stringify(html.slice(Math.max(0, index - 80), index + 80));

  return [
    `first difference at character ${index}:`,
    `  fresh:  ${excerpt(expected)}`,
    `  reused: ${excerpt(actual)}`,
  ];
};

const describeBlock = (node: Descendant) =>
  ElementApi.isElement(node)
    ? `${node.type} ${JSON.stringify(NodeApi.string(node))}`
    : JSON.stringify(node);

const diffDocuments = (
  previous: EditorDocumentValue,
  next: EditorDocumentValue
) => {
  const previousIndexes = new Map(
    previous.children.map((node, index) => [node, index])
  );
  const kept = new Set(next.children);
  const previousRoots: Roots = { ...previous.roots };
  const nextRoots: Roots = { ...next.roots };

  return [
    ...next.children.map((node, index) => {
      const from = previousIndexes.get(node);

      if (from === undefined) return `  + [${index}] ${JSON.stringify(node)}`;

      return from === index
        ? `  = [${index}] ${describeBlock(node)}`
        : `  > [${index}] ${describeBlock(node)} (was [${from}])`;
    }),
    ...previous.children.flatMap((node, index) =>
      kept.has(node) ? [] : [`  - [${index}] ${describeBlock(node)}`]
    ),
    ...Object.entries(nextRoots).map(([key, nodes]) =>
      previousRoots[key] === nodes
        ? `  = ${key}`
        : `  + ${key} ${JSON.stringify(nodes)}`
    ),
    ...Object.keys(previousRoots).flatMap((key) =>
      nextRoots[key] ? [] : [`  - ${key}`]
    ),
  ].join('\n');
};

// The live editor's document, with the captions its figures own.
const readDocument = (editor: Editor) => {
  const roots: Roots = {};

  for (const node of editor.read.children()) {
    const key = captionKey(node);

    if (key) roots[key] = editor.read.root(key) as readonly Element[];
  }

  return withRoots(editor.read.children(), roots);
};

const runOracle = ({
  mode,
  profile = 'blocks',
  seed,
  tocReadsDocument = true,
}: {
  mode: Mode;
  profile?: Profile;
  seed: number;
  tocReadsDocument?: boolean;
}): OracleRun => {
  const random = createRandom(seed);
  const captions = profile === 'captions';
  const editor = createOracleEditor(tocReadsDocument);
  // The expected render has no history: a second editor renders a deep copy as
  // a new document view, sharing no view, memo, state or node-keyed cache with
  // `editor`. An editor whose value is replaced keeps unchanged nodes, and with
  // them any cache keyed by those nodes.
  const baseline = createOracleEditor(tocReadsDocument);
  const expectedView = render(null, {
    container: document.createElement('div'),
  });
  const labels: string[] = [];
  let freshRenders = 0;
  let reusedRenders = 0;

  const renderExpected = (value: EditorDocumentValue) => {
    const before = elementRenders;

    // A new key mounts a new tree, so nothing rendered before is reused.
    expectedView.rerender(
      <EditorStatic
        key={labels.length}
        document={structuredClone(value)}
        editor={baseline}
      />
    );
    freshRenders += elementRenders - before;

    return expectedView.container.innerHTML;
  };
  const renderUi = (value: EditorDocumentValue) =>
    mode === 'document' ? (
      <EditorStatic document={value} editor={editor} />
    ) : (
      <EditorStatic editor={editor} />
    );
  const describeMismatch = (
    previous: EditorDocumentValue,
    next: EditorDocumentValue,
    expected: string,
    actual: string
  ): Mismatch => {
    const expectedBlocks = renderedBlocks(expected);
    const actualBlocks = renderedBlocks(actual);
    const indexes =
      expectedBlocks.length === actualBlocks.length
        ? expectedBlocks.flatMap((html, index) =>
            html === actualBlocks[index] ? [] : [index]
          )
        : next.children.map((_, index) => index);
    // Classifies the cause: a new tree over the same view or editor state.
    const sameState =
      mode === 'document' ? renderFresh(editor, next) : renderFresh(editor);
    const source =
      mode === 'document'
        ? 'the same document object'
        : 'the same editor state';

    return {
      blockTypes: indexes.map((index) => {
        const node = next.children[index];

        return ElementApi.isElement(node) ? node.type : 'text';
      }),
      report: [
        `Static reuse oracle: a ${mode} re-render differs from a fresh render.`,
        `seed ${seed}, step ${labels.length}: ${labels.at(-1) ?? 'initial render'}`,
        `replay: PLATE_STATIC_ORACLE_SEEDS=${seed} bun test ${SPEC_PATH} -t "${mode} of ${profile}"`,
        `steps: ${labels.join(' | ')}`,
        'document diff (= same object, > moved, + new object, - removed):',
        diffDocuments(previous, next),
        'rendered blocks that differ:',
        ...indexes.flatMap((index) => [
          `  [${index}] fresh:  ${expectedBlocks[index] ?? '(none)'}`,
          `  [${index}] reused: ${actualBlocks[index] ?? '(none)'}`,
        ]),
        ...firstDifference(expected, actual),
        sameState === expected
          ? `A new tree over ${source} renders correctly: memoized element reuse kept stale output.`
          : sameState === actual
            ? `A new tree over ${source} repeats the stale output: state cached by editor, document or node identity is stale.`
            : `A new tree over ${source} differs from both.`,
      ].join('\n'),
    };
  };

  let current = initialDocument(random, captions);

  if (mode === 'editor') {
    editor.update.value.replace(current);
    current = readDocument(editor);
  }

  const view = render(renderUi(current));
  const finish = (mismatch: Mismatch | null): OracleRun => {
    view.unmount();
    expectedView.unmount();

    return { freshRenders, mismatch, reusedRenders, seed };
  };
  const initial = renderExpected(current);

  if (view.container.innerHTML !== initial) {
    return finish(
      describeMismatch(
        { children: [] },
        current,
        initial,
        view.container.innerHTML
      )
    );
  }

  for (let step = 1; step <= STEPS; step += 1) {
    const { document: proposed, label } = nextStep(random, current, captions);
    let next = proposed;

    labels.push(`${step} ${label}`);
    if (mode === 'editor' && proposed !== current) {
      editor.update.value.replace(proposed);
      next = readDocument(editor);
    }

    const before = elementRenders;

    view.rerender(renderUi(next));

    const rendered = elementRenders - before;
    const actual = view.container.innerHTML;
    const expected = renderExpected(next);

    reusedRenders += rendered;
    if (actual !== expected) {
      return finish(describeMismatch(current, next, expected, actual));
    }
    if (next === current && rendered > 0) {
      return finish({
        blockTypes: [],
        report: `Static reuse oracle: seed ${seed}, step ${step} rendered ${rendered} elements again for the same ${mode}.`,
      });
    }
    current = next;
  }

  return finish(null);
};

describe('EditorStatic reuse oracle', () => {
  it.each([
    ['document', 'blocks'],
    ['editor', 'blocks'],
    ['document', 'captions'],
    ['editor', 'captions'],
  ] as const)(
    'renders every %s of %s sequences like a fresh render while reusing work',
    (mode, profile) => {
      const runs = (chosenSeeds ?? SEEDS[profile][mode]).map((seed) =>
        runOracle({ mode, profile, seed })
      );
      const [first, ...rest] = runs.filter((run) => run.mismatch);

      if (first) {
        throw new Error(
          `Seeds that differ: ${[first, ...rest].map(({ seed }) => seed).join(', ')} of ${runs.length}.\n${first.mismatch?.report}`
        );
      }

      expect(
        runs.reduce((total, run) => total + run.reusedRenders, 0)
      ).toBeLessThan(runs.reduce((total, run) => total + run.freshRenders, 0));
    }
  );

  it.each(['document', 'editor'] as const)(
    'detects a %s table of contents reused without readsDocument',
    (mode) => {
      const detected = SEEDS.blocks[mode].some((seed) =>
        runOracle({
          mode,
          seed,
          tocReadsDocument: false,
        }).mismatch?.blockTypes.includes('toc')
      );

      expect(detected).toBe(true);
    }
  );
});
