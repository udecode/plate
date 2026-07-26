import {
  ContentSlice,
  ElementApi,
  type Descendant,
  TextApi,
  property,
  schema,
} from '@platejs/plite';
import { writeHostFragmentData } from '@platejs/plite-dom';

import { createBaseEditor } from '../../lib/editor';
import { createBasePlugin } from '../../lib/plugin';

const MARK_COUNT = 8;
const UNRELATED_MATCHER_COUNT = 128;
const WALL_TIME_BUDGET_MS = {
  compile: 10_000,
  parse: 10_000,
  serialize: 10_000,
} as const;
const MIXED_DOCUMENT_COHORTS = [
  { groups: 4, name: 'normal' },
  { groups: 32, name: 'large' },
  { groups: 64, name: 'stress' },
] as const;

type BenchmarkCounters = {
  codecFactories: number;
  elementDecode: number;
  elementEncode: number;
  markDecode: number;
  markEncode: number;
  unrelatedDecode: number;
};

const resetRuntimeCounters = (counters: BenchmarkCounters) => {
  counters.elementDecode = 0;
  counters.elementEncode = 0;
  counters.markDecode = 0;
  counters.markEncode = 0;
  counters.unrelatedDecode = 0;
};

const measure = <T>(run: () => T) => {
  const startedAt = performance.now();
  const value = run();

  return { duration: performance.now() - startedAt, value };
};

const createBenchmarkPlugins = (counters: BenchmarkCounters) => {
  const ParagraphPlugin = createBasePlugin({
    key: 'p',
    options: { variant: 'initial' },
    schema: {
      element: {
        content: schema.content.any(
          [schema.content.text(), schema.content.group('inline')],
          { default: 'text', min: 1 }
        ),
      },
    },
    type: 'benchmark-paragraph',
  }).extend(({ defineCodecs, getOptions }) => {
    counters.codecFactories++;

    return {
      codecs: defineCodecs({
        'text/html': {
          decode: () => {
            counters.elementDecode++;

            return {};
          },
          encode: ({ content }) => {
            counters.elementEncode++;

            return {
              attributes: { 'data-variant': getOptions().variant },
              children: content,
              tag: 'p',
            };
          },
          match: [{ tag: 'p' }],
        },
      }),
    };
  });
  const LinkPlugin = createBasePlugin({
    key: 'benchmarkLink',
    schema: {
      element: {
        content: schema.content.text({ default: 'text', min: 1 }),
        inline: true,
        properties: { url: property.string() },
        topLevel: false,
      },
    },
    type: 'benchmark-link',
  }).extend(({ defineCodecs }) => {
    counters.codecFactories++;

    return {
      codecs: defineCodecs({
        'text/html': {
          decode: ({ element }) => {
            counters.elementDecode++;

            return { url: element.getAttribute('href') || undefined };
          },
          encode: ({ content, node }) => {
            counters.elementEncode++;

            return {
              attributes: { href: node.url },
              children: content,
              tag: 'a',
            };
          },
          match: [{ tag: 'a' }],
        },
      }),
    };
  });
  const ListItemPlugin = createBasePlugin({
    key: 'benchmarkListItem',
    schema: {
      element: {
        content: schema.content.type('benchmark-paragraph', {
          default: { type: 'benchmark-paragraph' },
          min: 1,
        }),
        topLevel: false,
      },
    },
    type: 'benchmark-list-item',
  }).extend(({ defineCodecs }) => {
    counters.codecFactories++;

    return {
      codecs: defineCodecs({
        'text/html': {
          decode: () => {
            counters.elementDecode++;

            return {};
          },
          encode: ({ content }) => {
            counters.elementEncode++;

            return { children: content, tag: 'li' };
          },
          match: [{ tag: 'li' }],
        },
      }),
    };
  });
  const ListPlugin = createBasePlugin({
    key: 'benchmarkList',
    schema: {
      element: {
        content: schema.content.type('benchmark-list-item', {
          default: { type: 'benchmark-list-item' },
          min: 1,
        }),
      },
    },
    type: 'benchmark-list',
  }).extend(({ defineCodecs }) => {
    counters.codecFactories++;

    return {
      codecs: defineCodecs({
        'text/html': {
          decode: () => {
            counters.elementDecode++;

            return {};
          },
          encode: ({ content }) => {
            counters.elementEncode++;

            return { children: content, tag: 'ul' };
          },
          match: [{ tag: 'ul' }],
        },
      }),
    };
  });
  const TableCellPlugin = createBasePlugin({
    key: 'benchmarkTableCell',
    schema: {
      element: {
        content: schema.content.type('benchmark-paragraph', {
          default: { type: 'benchmark-paragraph' },
          min: 1,
        }),
        properties: { width: property.number() },
        topLevel: false,
      },
    },
    type: 'benchmark-table-cell',
  }).extend(({ defineCodecs }) => {
    counters.codecFactories++;

    return {
      codecs: defineCodecs({
        'text/html': {
          decode: ({ element }) => {
            counters.elementDecode++;

            const width = Number.parseFloat(element.style.width);

            return Number.isFinite(width) ? { width } : {};
          },
          encode: ({ content, node }) => {
            counters.elementEncode++;

            return {
              children: content,
              style: {
                width: node.width === undefined ? undefined : `${node.width}px`,
              },
              tag: 'td',
            };
          },
          match: [{ tag: 'td' }],
        },
      }),
    };
  });
  const TableRowPlugin = createBasePlugin({
    key: 'benchmarkTableRow',
    schema: {
      element: {
        content: schema.content.type('benchmark-table-cell', {
          default: { type: 'benchmark-table-cell' },
          min: 1,
        }),
        topLevel: false,
      },
    },
    type: 'benchmark-table-row',
  }).extend(({ defineCodecs }) => {
    counters.codecFactories++;

    return {
      codecs: defineCodecs({
        'text/html': {
          decode: () => {
            counters.elementDecode++;

            return {};
          },
          encode: ({ content }) => {
            counters.elementEncode++;

            return { children: content, tag: 'tr' };
          },
          match: [{ tag: 'tr' }],
        },
      }),
    };
  });
  const TablePlugin = createBasePlugin({
    key: 'benchmarkTable',
    schema: {
      element: {
        content: schema.content.type('benchmark-table-row', {
          default: { type: 'benchmark-table-row' },
          min: 1,
        }),
      },
    },
    type: 'benchmark-table',
  }).extend(({ defineCodecs }) => {
    counters.codecFactories++;

    return {
      codecs: defineCodecs({
        'text/html': {
          decode: () => {
            counters.elementDecode++;

            return {};
          },
          encode: ({ content }) => {
            counters.elementEncode++;

            return {
              children: [{ children: content, tag: 'tbody' }],
              tag: 'table',
            };
          },
          match: [{ tag: 'table' }],
        },
      }),
    };
  });
  const MediaPlugin = createBasePlugin({
    key: 'benchmarkMedia',
    schema: {
      element: {
        content: schema.content.any(
          [schema.content.text(), schema.content.group('inline')],
          { default: 'text', min: 1 }
        ),
        properties: { url: property.string(), width: property.number() },
      },
    },
    type: 'benchmark-media',
  }).extend(({ defineCodecs }) => {
    counters.codecFactories++;

    return {
      codecs: defineCodecs({
        'text/html': {
          decode: ({ element }) => {
            counters.elementDecode++;

            const image = element.querySelector<HTMLElement>(':scope > img');
            const width = Number.parseFloat(image?.style.width ?? '');

            return {
              url: image?.getAttribute('src') || undefined,
              ...(Number.isFinite(width) ? { width } : {}),
            };
          },
          encode: ({ content, node }) => {
            counters.elementEncode++;

            return {
              attributes: { class: 'benchmark-media' },
              children: [
                {
                  attributes: { src: node.url },
                  style: {
                    width:
                      node.width === undefined ? undefined : `${node.width}px`,
                  },
                  tag: 'img',
                },
                { children: content, tag: 'figcaption' },
              ],
              tag: 'figure',
            };
          },
          match: [{ className: 'benchmark-media', tag: 'figure' }],
        },
      }),
    };
  });
  const markPlugins = Array.from({ length: MARK_COUNT }, (_, index) =>
    createBasePlugin({
      key: `benchmarkMark${index}`,
      schema: {
        mark: property.boolean({ default: false, omitDefault: true }),
      },
    }).extend(({ defineCodecs }) => {
      counters.codecFactories++;

      return {
        codecs: defineCodecs({
          'text/html': {
            decode: () => {
              counters.markDecode++;

              return true;
            },
            encode: ({ value }) => {
              counters.markEncode++;

              return value
                ? {
                    attributes: { class: `benchmark-mark-${index}` },
                    tag: 'span',
                  }
                : null;
            },
            match: [
              {
                className: `benchmark-mark-${index}`,
                tag: 'span',
              },
            ],
          },
        }),
      };
    })
  );
  const unrelatedPlugins = Array.from(
    { length: UNRELATED_MATCHER_COUNT },
    (_, index) =>
      createBasePlugin({
        key: `benchmarkUnrelated${index}`,
        schema: {
          element: {
            content: schema.content.text({ default: 'text', min: 1 }),
          },
        },
        type: `benchmark-unrelated-${index}`,
      }).extend(({ defineCodecs }) => {
        counters.codecFactories++;

        return {
          codecs: defineCodecs({
            'text/html': {
              decode: () => {
                counters.unrelatedDecode++;

                return {};
              },
              decodeOnly: true,
              match: [{ tag: `x-benchmark-${index}` }],
            },
          }),
        };
      })
  );
  const plugins = [
    ParagraphPlugin,
    LinkPlugin,
    ListItemPlugin,
    ListPlugin,
    TableCellPlugin,
    TableRowPlugin,
    TablePlugin,
    MediaPlugin,
    ...markPlugins,
    ...unrelatedPlugins,
  ];

  return {
    plugins,
    reconfiguredPlugins: [
      ParagraphPlugin.configure({
        options: { variant: 'reconfigured' },
      }),
      ...plugins.slice(1),
    ],
  };
};

const createMarkedText = (text: string) =>
  Object.fromEntries([
    ['text', text],
    ...Array.from({ length: MARK_COUNT }, (_, index) => [
      `benchmarkMark${index}`,
      true,
    ]),
  ]);

const createParagraph = (text: string) => ({
  children: [createMarkedText(text)],
  type: 'benchmark-paragraph',
});

const createMixedDocument = (groups: number): Descendant[] =>
  Array.from({ length: groups }, (_, group) => [
    {
      children: [
        createMarkedText(`paragraph-${group}:`),
        {
          children: [createMarkedText(`link-${group}`)],
          type: 'benchmark-link',
          url: `https://example.com/${group}`,
        },
      ],
      type: 'benchmark-paragraph',
    },
    {
      children: Array.from({ length: 3 }, (_, item) => ({
        children: [createParagraph(`list-${group}-${item}`)],
        type: 'benchmark-list-item',
      })),
      type: 'benchmark-list',
    },
    {
      children: Array.from({ length: 3 }, (_, row) => ({
        children: Array.from({ length: 3 }, (_, column) => ({
          children: [createParagraph(`cell-${group}-${row}-${column}`)],
          type: 'benchmark-table-cell',
          width: 120 + column,
        })),
        type: 'benchmark-table-row',
      })),
      type: 'benchmark-table',
    },
    {
      children: [createMarkedText(`caption-${group}`)],
      type: 'benchmark-media',
      url: `https://example.com/image-${group}.png`,
      width: 320,
    },
  ]).flat() as Descendant[];

const countDocumentShape = (document: readonly Descendant[]) => {
  let elements = 0;
  let texts = 0;
  const visit = (node: Descendant) => {
    if (TextApi.isText(node)) {
      texts++;

      return;
    }
    if (!ElementApi.isElement(node)) return;

    elements++;
    node.children.forEach(visit);
  };

  document.forEach(visit);

  return { elements, texts };
};

describe('compiled HTML codec performance', () => {
  it('compiles and recompiles configured indexed codecs within explicit budgets', {
    timeout: 30_000,
  }, () => {
    const counters: BenchmarkCounters = {
      codecFactories: 0,
      elementDecode: 0,
      elementEncode: 0,
      markDecode: 0,
      markEncode: 0,
      unrelatedDecode: 0,
    };
    const { plugins, reconfiguredPlugins } = createBenchmarkPlugins(counters);
    const initial = measure(() => createBaseEditor({ plugins }));
    const initialFactoryCalls = counters.codecFactories;
    const reconfigured = measure(() =>
      createBaseEditor({ plugins: reconfiguredPlugins })
    );

    expect(initial.duration).toBeLessThan(WALL_TIME_BUDGET_MS.compile);
    expect(reconfigured.duration).toBeLessThan(WALL_TIME_BUDGET_MS.compile);
    expect(initialFactoryCalls).toBe(plugins.length);
    expect(counters.codecFactories - initialFactoryCalls).toBe(
      reconfiguredPlugins.length
    );

    const document = createMixedDocument(1);
    const initialOutput = new DataTransfer();
    const reconfiguredOutput = new DataTransfer();

    writeHostFragmentData(
      initial.value,
      initialOutput,
      ContentSlice.closed(document)
    );
    writeHostFragmentData(
      reconfigured.value,
      reconfiguredOutput,
      ContentSlice.closed(document)
    );

    expect(initialOutput.getData('text/html')).toContain(
      'data-variant="initial"'
    );
    expect(reconfiguredOutput.getData('text/html')).toContain(
      'data-variant="reconfigured"'
    );
  });

  for (const cohort of MIXED_DOCUMENT_COHORTS) {
    it(`keeps ${cohort.name} mixed HTML parse and serialize callbacks indexed`, {
      timeout: 30_000,
    }, () => {
      const counters: BenchmarkCounters = {
        codecFactories: 0,
        elementDecode: 0,
        elementEncode: 0,
        markDecode: 0,
        markEncode: 0,
        unrelatedDecode: 0,
      };
      const { plugins } = createBenchmarkPlugins(counters);
      const editor = createBaseEditor({ plugins });
      const document = createMixedDocument(cohort.groups);
      const shape = countDocumentShape(document);
      const output = new DataTransfer();

      resetRuntimeCounters(counters);

      const serialized = measure(() =>
        writeHostFragmentData(editor, output, ContentSlice.closed(document))
      );

      expect(serialized.value).toContain('text/html');
      expect(serialized.duration).toBeLessThan(WALL_TIME_BUDGET_MS.serialize);
      expect(counters.elementEncode).toBe(shape.elements);
      expect(counters.markEncode).toBe(shape.texts * MARK_COUNT);

      counters.elementDecode = 0;
      counters.markDecode = 0;
      const parsed = measure(() =>
        editor.api.html.deserialize({
          element: `<div>${output.getData('text/html')}</div>`,
        })
      );

      expect(parsed.duration).toBeLessThan(WALL_TIME_BUDGET_MS.parse);
      expect(parsed.value).toHaveLength(cohort.groups * 4);
      expect(counters.elementDecode).toBe(shape.elements);
      expect(counters.markDecode).toBe(shape.texts * MARK_COUNT);
      expect(counters.unrelatedDecode).toBe(0);
    });
  }
});
