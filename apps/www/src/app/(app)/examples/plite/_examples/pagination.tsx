import {
  parseAsBoolean,
  parseAsStringLiteral,
  type SetValues,
  useQueryStates,
  type Values,
} from 'nuqs';
import {
  type ChangeEvent,
  type ComponentProps,
  type CSSProperties,
  createContext,
  Fragment,
  type KeyboardEvent,
  type RefObject,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  defineStateField,
  type Node,
  NodeApi,
  type Value,
} from '@platejs/plite';
import { isHotkey } from '@platejs/plite-dom';
import {
  createPlitePage,
  getPlitePageLayoutDecorations,
  getPlitePageLayoutGeometry,
  getPlitePageLayoutPathKey,
  getPlitePageLayoutProjection,
  pretextPageLayoutEngine,
  type PliteNodeLayoutProvider,
  type PlitePageLayoutDecorationRects,
  type PlitePageLayoutTextChangeRefresh,
  type PlitePageLayoutTypography,
  type PlitePageRect,
  type PlitePageSettings,
} from '@platejs/plite-layout';
import {
  PagedEditable,
  type PliteLayoutRenderedFragment,
  usePliteLayout,
  usePliteLayoutFragmentsAtPath,
  usePliteLayoutSnapshot,
} from '@platejs/plite-layout/react';
import {
  type EditableDecorate,
  type EditableDOMStrategyEffectiveType,
  type EditableProps,
  type RenderElementProps,
  type RenderLeafProps,
  Plite,
  useDOMStrategyVirtualOffset,
  useEditor,
  useEditorState,
  useElementPath,
  useSetStateField,
  usePliteEditor,
} from '@platejs/plite-react';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  NativeSelect,
  NativeSelectOption,
} from '@/components/ui/native-select';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/utils/cn';
import type {
  CustomEditor,
  CustomElementType,
  CustomText,
  CustomTextKey,
  ImageElement,
} from './custom-types.d';
import { toggleMark } from './mark-utils';
import {
  clampNumber,
  parseAsBoundedInteger,
  replaceQueryOptions,
} from './query-controls';

const pageSettings = defineStateField<PlitePageSettings>({
  key: 'layout.page',
  collab: 'shared',
  history: 'push',
  initial: () => ({ margins: 96, preset: 'a4' }),
  persist: true,
});

type DOMStrategyMode = 'full' | 'staged' | 'virtualized';

const pagePresetOptions = ['a4', 'letter'] as const;
const domStrategyModeOptions = ['full', 'staged', 'virtualized'] as const;
const mediaSplitOptions = ['avoid', 'page'] as const;
const pageLayoutModeOptions = ['spread', 'single'] as const;

const PAGE_GAP = 24;
const PAGE_CONTENT_INLINE_INSET = 2;
const PAGE_STACK_SAFE_INLINE = 72;
const PAGE_TEXT_FONT = '"Helvetica Neue", Helvetica, Arial, sans-serif';
const PAGE_CODE_FONT = 'SFMono-Regular, Menlo, monospace';
const DEFAULT_MEDIA_HEIGHT = 240;
const DEFAULT_TABLE_ROW_HEIGHT = 36;
const DEFAULT_TABLE_ROWS = 240;
const DEFAULT_PAGE_OVERSCAN = 1;
const DEFAULT_VIRTUALIZED_STRESS_PAGES = 990;
const MAX_MEDIA_HEIGHT = 1200;
const MAX_PAGE_OVERSCAN = 20;
const MAX_TABLE_ROW_HEIGHT = 960;
const MAX_TABLE_ROWS = 1000;
const MAX_VIRTUALIZED_STRESS_PAGES = 2000;

const paginationControlParsers = {
  debugFrames: parseAsBoolean.withDefault(false),
  domStrategyMode: parseAsStringLiteral(domStrategyModeOptions).withDefault(
    'staged'
  ),
  margins: parseAsBoundedInteger(48, 240).withDefault(96),
  mediaHeight: parseAsBoundedInteger(120, MAX_MEDIA_HEIGHT).withDefault(
    DEFAULT_MEDIA_HEIGHT
  ),
  mediaSplit: parseAsStringLiteral(mediaSplitOptions).withDefault('avoid'),
  pageLayoutMode: parseAsStringLiteral(pageLayoutModeOptions).withDefault(
    'spread'
  ),
  pageOverscan: parseAsBoundedInteger(0, MAX_PAGE_OVERSCAN).withDefault(
    DEFAULT_PAGE_OVERSCAN
  ),
  preset: parseAsStringLiteral(pagePresetOptions).withDefault('a4'),
  tableRowHeight: parseAsBoundedInteger(28, MAX_TABLE_ROW_HEIGHT).withDefault(
    DEFAULT_TABLE_ROW_HEIGHT
  ),
  tableRows: parseAsBoundedInteger(8, MAX_TABLE_ROWS).withDefault(
    DEFAULT_TABLE_ROWS
  ),
  virtualizedStressPages: parseAsBoundedInteger(
    0,
    MAX_VIRTUALIZED_STRESS_PAGES
  ).withDefault(DEFAULT_VIRTUALIZED_STRESS_PAGES),
};

const paginationControlUrlKeys = {
  debugFrames: 'debug',
  domStrategyMode: 'strategy',
  mediaHeight: 'media_height',
  mediaSplit: 'media_split',
  pageLayoutMode: 'page_layout',
  pageOverscan: 'page_overscan',
  tableRowHeight: 'row_height',
  tableRows: 'rows',
  virtualizedStressPages: 'stress_pages',
};

type PaginationControls = Values<typeof paginationControlParsers>;
type SetPaginationControls = SetValues<typeof paginationControlParsers>;
type PaginationBlockFormat = Extract<
  CustomElementType,
  'heading-one' | 'heading-three' | 'heading-two' | 'paragraph'
>;

const paginationMarkHotkeys: [string, CustomTextKey][] = [
  ['mod+b', 'bold'],
  ['mod+i', 'italic'],
  ['mod+u', 'underline'],
];

const paginationBlockHotkeys: [string, PaginationBlockFormat][] = [
  ['mod+alt+1', 'heading-one'],
  ['mod+alt+2', 'heading-two'],
  ['mod+alt+3', 'heading-three'],
];

const paginationTextBlockTypes = new Set<PaginationBlockFormat>([
  'heading-one',
  'heading-two',
  'heading-three',
  'paragraph',
]);

const paginationTextBlockTags = {
  'heading-one': 'h1',
  'heading-two': 'h2',
  'heading-three': 'h3',
  paragraph: 'p',
} satisfies Record<PaginationBlockFormat, 'h1' | 'h2' | 'h3' | 'p'>;

const paginationTextBlockStyles = {
  'heading-one': {
    blockSpacing: 18,
    fontSize: 28,
    fontWeight: 700,
    lineHeight: 34,
  },
  'heading-two': {
    blockSpacing: 16,
    fontSize: 22,
    fontWeight: 700,
    lineHeight: 30,
  },
  'heading-three': {
    blockSpacing: 14,
    fontSize: 18,
    fontWeight: 700,
    lineHeight: 26,
  },
  paragraph: {
    blockSpacing: 12,
    fontSize: 16,
    fontWeight: 400,
    lineHeight: 24,
  },
} satisfies Record<
  PaginationBlockFormat,
  {
    blockSpacing: number;
    fontSize: number;
    fontWeight: 400 | 700;
    lineHeight: number;
  }
>;

const isPaginationBlockFormat = (
  type: CustomElementType
): type is PaginationBlockFormat =>
  paginationTextBlockTypes.has(type as PaginationBlockFormat);

const isPaginationTextBlock = (
  node: Node
): node is Node & { type: PaginationBlockFormat } =>
  NodeApi.isElement(node) &&
  isPaginationBlockFormat(node.type as CustomElementType);

const getPaginationTextBlockStyle = (type: CustomElementType) =>
  isPaginationBlockFormat(type)
    ? paginationTextBlockStyles[type]
    : paginationTextBlockStyles.paragraph;

const getPaginationTextBlockElementStyle = (
  type: CustomElementType
): CSSProperties | undefined => {
  if (!isPaginationBlockFormat(type)) {
    return;
  }

  const textStyle = paginationTextBlockStyles[type];

  return {
    fontSize: textStyle.fontSize,
    fontWeight: textStyle.fontWeight,
    lineHeight: `${textStyle.lineHeight}px`,
  };
};

const getPaginationTextFont = (
  elementType: CustomElementType,
  leaf: CustomText
) => {
  const blockStyle = getPaginationTextBlockStyle(elementType);
  const fontFamily = leaf.code ? PAGE_CODE_FONT : PAGE_TEXT_FONT;
  const fontStyle = leaf.italic ? 'italic' : 'normal';
  const fontWeight = leaf.bold ? 700 : blockStyle.fontWeight;

  return `${fontStyle} ${fontWeight} ${blockStyle.fontSize}px ${fontFamily}`;
};

const getPaginationTextDecorationLine = (marks: Partial<CustomText>) => {
  const lines = [
    marks.underline ? 'underline' : null,
    marks.strikethrough ? 'line-through' : null,
  ].filter(Boolean);

  return lines.length > 0 ? lines.join(' ') : undefined;
};

const getPaginationLeafStyle = (marks: Partial<CustomText>): CSSProperties => ({
  fontFamily: marks.code ? PAGE_CODE_FONT : undefined,
  fontStyle: marks.italic ? 'italic' : undefined,
  fontWeight: marks.bold ? 700 : undefined,
  textDecorationLine: getPaginationTextDecorationLine(marks),
});

const isPaginationBlockActive = (
  editor: CustomEditor,
  format: PaginationBlockFormat
) => {
  const selection = editor.read((state) => state.selection.get());

  if (!selection) {
    return false;
  }

  return editor.read((state) =>
    state.nodes.some({
      at: state.ranges.unhang(selection),
      match: (node) => isPaginationTextBlock(node) && node.type === format,
    })
  );
};

const togglePaginationBlock = (
  editor: CustomEditor,
  format: PaginationBlockFormat
) => {
  const isActive = isPaginationBlockActive(editor, format);

  editor.update((tx) => {
    tx.nodes.set(
      { type: isActive ? 'paragraph' : format },
      { match: isPaginationTextBlock }
    );
  });
};

const handlePaginationKeyDown = (
  editor: CustomEditor,
  event: KeyboardEvent<HTMLDivElement>
) => {
  for (const [hotkey, format] of paginationBlockHotkeys) {
    if (isHotkey(hotkey, event)) {
      event.preventDefault();
      togglePaginationBlock(editor, format);
      return true;
    }
  }

  for (const [hotkey, mark] of paginationMarkHotkeys) {
    if (isHotkey(hotkey, event)) {
      event.preventDefault();
      toggleMark(editor, mark);
      return true;
    }
  }
};

const PaginationControlsToolbar = ({
  applyTableRows,
  controls,
  setControls,
}: {
  applyTableRows: (rows: number) => void;
  controls: PaginationControls;
  setControls: SetPaginationControls;
}) => {
  const {
    debugFrames,
    domStrategyMode,
    margins,
    mediaHeight,
    mediaSplit,
    pageLayoutMode,
    pageOverscan,
    preset,
    tableRowHeight,
    tableRows,
    virtualizedStressPages,
  } = controls;

  const updatePreset = (event: ChangeEvent<HTMLSelectElement>) => {
    const preset = event.currentTarget.value as PaginationControls['preset'];
    void setControls({ preset });
  };

  const updateMargins = (event: ChangeEvent<HTMLInputElement>) => {
    const value = Number.parseInt(event.currentTarget.value, 10);
    if (Number.isFinite(value)) {
      void setControls({ margins: clampNumber(value, 48, 240) });
    }
  };

  const updateDOMStrategy = (event: ChangeEvent<HTMLSelectElement>) => {
    void setControls({
      domStrategyMode: event.currentTarget.value as DOMStrategyMode,
    });
  };

  const updateTableRows = (event: ChangeEvent<HTMLInputElement>) => {
    const value = Number.parseInt(event.currentTarget.value, 10);

    if (Number.isFinite(value)) {
      const nextTableRows = clampNumber(value, 8, MAX_TABLE_ROWS);

      applyTableRows(nextTableRows);
      void setControls({ tableRows: nextTableRows });
    }
  };

  const updateTableRowHeight = (event: ChangeEvent<HTMLInputElement>) => {
    const value = Number.parseInt(event.currentTarget.value, 10);

    if (Number.isFinite(value)) {
      void setControls({
        tableRowHeight: clampNumber(value, 28, MAX_TABLE_ROW_HEIGHT),
      });
    }
  };

  const updateMediaHeight = (event: ChangeEvent<HTMLInputElement>) => {
    const value = Number.parseInt(event.currentTarget.value, 10);

    if (Number.isFinite(value)) {
      void setControls({
        mediaHeight: clampNumber(value, 120, MAX_MEDIA_HEIGHT),
      });
    }
  };

  const updateMediaSplit = (event: ChangeEvent<HTMLSelectElement>) => {
    void setControls({
      mediaSplit: event.currentTarget.value as PaginationControls['mediaSplit'],
    });
  };

  const updatePageOverscan = (event: ChangeEvent<HTMLInputElement>) => {
    const value = Number.parseInt(event.currentTarget.value, 10);

    if (Number.isFinite(value)) {
      void setControls({
        pageOverscan: clampNumber(value, 0, MAX_PAGE_OVERSCAN),
      });
    }
  };

  const updateVirtualizedStressPages = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const value = Number.parseInt(event.currentTarget.value, 10);

    if (Number.isFinite(value)) {
      void setControls({
        virtualizedStressPages: clampNumber(
          value,
          0,
          MAX_VIRTUALIZED_STRESS_PAGES
        ),
      });
    }
  };

  const togglePageLayoutMode = () => {
    void setControls((state) => ({
      pageLayoutMode: state.pageLayoutMode === 'spread' ? 'single' : 'spread',
    }));
  };

  return (
    <div className="plite-pagination-toolbar">
      <div className="plite-pagination-toolbar-group">
        <span className="plite-pagination-label">
          <Label htmlFor="pagination-preset">Preset</Label>
          <NativeSelect
            className="w-24"
            id="pagination-preset"
            onChange={updatePreset}
            value={preset}
          >
            <NativeSelectOption value="a4">A4</NativeSelectOption>
            <NativeSelectOption value="letter">Letter</NativeSelectOption>
          </NativeSelect>
        </span>
        <span className="plite-pagination-label">
          <Label htmlFor="pagination-margins">Margins</Label>
          <Input
            className="w-20"
            id="pagination-margins"
            min={48}
            onChange={updateMargins}
            step={12}
            type="number"
            value={margins}
          />
        </span>
        <span className="plite-pagination-label">
          <Label htmlFor="pagination-dom-strategy">DOM strategy</Label>
          <NativeSelect
            className="w-32"
            id="pagination-dom-strategy"
            onChange={updateDOMStrategy}
            value={domStrategyMode}
          >
            <NativeSelectOption value="staged">Staged</NativeSelectOption>
            <NativeSelectOption value="full">Full</NativeSelectOption>
            <NativeSelectOption value="virtualized">
              Virtualized
            </NativeSelectOption>
          </NativeSelect>
        </span>
        <span className="plite-pagination-label">
          <Label htmlFor="pagination-rows">Rows</Label>
          <Input
            className="w-24"
            id="pagination-rows"
            max={MAX_TABLE_ROWS}
            min={8}
            onChange={updateTableRows}
            type="number"
            value={tableRows}
          />
        </span>
        <span className="plite-pagination-label">
          <Label htmlFor="pagination-row-height">Row px</Label>
          <Input
            className="w-20"
            id="pagination-row-height"
            max={MAX_TABLE_ROW_HEIGHT}
            min={28}
            onChange={updateTableRowHeight}
            step={4}
            type="number"
            value={tableRowHeight}
          />
        </span>
        <span className="plite-pagination-label">
          <Label htmlFor="pagination-media-height">Media px</Label>
          <Input
            className="w-24"
            id="pagination-media-height"
            max={MAX_MEDIA_HEIGHT}
            min={120}
            onChange={updateMediaHeight}
            step={40}
            type="number"
            value={mediaHeight}
          />
        </span>
        <span className="plite-pagination-label">
          <Label htmlFor="pagination-media-split">Media split</Label>
          <NativeSelect
            className="w-24"
            id="pagination-media-split"
            onChange={updateMediaSplit}
            value={mediaSplit}
          >
            <NativeSelectOption value="avoid">Avoid</NativeSelectOption>
            <NativeSelectOption value="page">Page</NativeSelectOption>
          </NativeSelect>
        </span>
        {domStrategyMode === 'virtualized' && (
          <>
            <span className="plite-pagination-label">
              <Label htmlFor="pagination-page-overscan">Page overscan</Label>
              <Input
                className="w-20"
                id="pagination-page-overscan"
                max={MAX_PAGE_OVERSCAN}
                min={0}
                onChange={updatePageOverscan}
                type="number"
                value={pageOverscan}
              />
            </span>
            <span className="plite-pagination-label">
              <Label htmlFor="pagination-rich-stress">Stress pages</Label>
              <Input
                className="w-24"
                id="pagination-rich-stress"
                max={MAX_VIRTUALIZED_STRESS_PAGES}
                min={0}
                onChange={updateVirtualizedStressPages}
                step={10}
                type="number"
                value={virtualizedStressPages}
              />
            </span>
          </>
        )}
      </div>
      <div className="plite-pagination-toolbar-group">
        <Separator className="h-6" orientation="vertical" />
        <span className="plite-pagination-switch-group">
          Facing
          <Switch
            aria-label="Facing"
            checked={pageLayoutMode === 'spread'}
            onCheckedChange={() => togglePageLayoutMode()}
          />
        </span>
        <Separator className="h-6" orientation="vertical" />
        <span className="plite-pagination-switch-group">
          Debug
          <Switch
            aria-label="Debug"
            checked={debugFrames}
            onCheckedChange={(checked) => {
              void setControls({ debugFrames: Boolean(checked) });
            }}
          />
        </span>
      </div>
    </div>
  );
};

const richImageSvg =
  'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 640 240%22%3E%3Crect width=%22640%22 height=%22240%22 fill=%22%23f8fafc%22/%3E%3Cpath d=%22M0 190 150 94l90 62 116-86 284 120v50H0z%22 fill=%22%23bfdbfe%22/%3E%3Ccircle cx=%22518%22 cy=%2262%22 r=%2238%22 fill=%22%23f59e0b%22/%3E%3Ctext x=%2232%22 y=%2250%22 font-family=%22Arial%22 font-size=%2228%22 fill=%22%23111827%22%3EMarkdown asset%3C/text%3E%3C/svg%3E';

const fixtureParagraphs = [
  'Premirror Milestone 1 test document. This paragraph is intentionally long so we can validate word wrapping inside the composed frame. The quick brown fox jumps over the lazy dog while pagination logic tracks run boundaries and maps document ranges to absolute fragment positions.',
  'Second paragraph for wrapping and flow. We expect lines to break naturally at word boundaries and continue on subsequent lines before moving to the next page frame. This should mimic a word-processor style reading flow rather than a single scroll box.',
  'Third paragraph adds more content pressure. Layout metrics should increase pages when required, and each line fragment should remain fully inside the page content rect with no orphan leading character rendered outside its decorated run.',
  'Fourth paragraph repeats structured prose to force pagination. Typography and measured widths from pretext should drive deterministic line breaks. Selection and caret mapping should still align with these visual fragments.',
  'Fifth paragraph: the architecture keeps Plite as source of truth while decorations project fragments into absolute page coordinates. This gives us editable rich text with page-aware rendering behavior.',
  'Sixth paragraph closes the synthetic test fixture. If everything works, we should see multiple pages and no inner frame scrolling. Wrapping should remain stable across refreshes.',
];

const premirrorValue: Value = Array.from({ length: 7 }, (_, index) =>
  fixtureParagraphs.map((text) => ({
    type: 'paragraph',
    children: [{ text: `${text} Section ${index + 1}.` }],
  }))
).flat();

const createPaginationTableRows = (count: number) =>
  Array.from({ length: count }, (_, index) => ({
    type: 'table-row',
    children: [
      {
        type: 'table-cell',
        children: [{ text: index === 0 ? 'Markdown' : `Row ${index + 1}` }],
      },
      {
        type: 'table-cell',
        children: [
          { text: index === 0 ? 'Plite node' : `Path-aware cell ${index + 1}` },
        ],
      },
      {
        type: 'table-cell',
        children: [
          {
            text: index === 0 ? 'Paged' : `Fragment ${index + 1}`,
          },
        ],
      },
    ],
  }));

const richMarkdownStressFixture = 'rich-markdown-stress';
const richMarkdownStressSectionBlockCount = 3;

const richMarkdownStressTitles = [
  'Release readiness memo',
  'Research appendix',
  'Customer rollout note',
  'Implementation journal',
  'Quality review brief',
] as const;

const richMarkdownStressParagraphs = [
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer posuere erat a ante venenatis dapibus posuere velit aliquet. Donec ullamcorper nulla non metus auctor fringilla. Cras justo odio, dapibus ac facilisis in, egestas eget quam. Etiam porta sem malesuada magna mollis euismod.',
  'Curabitur blandit tempus porttitor. Vestibulum id ligula porta felis euismod semper. Maecenas faucibus mollis interdum, and the pagination frame should keep this prose readable while the viewport moves quickly through a long document.',
  'Aenean lacinia bibendum nulla sed consectetur. Etiam porta sem malesuada magna mollis euismod. The sample mixes short and long sentences to exercise line wrapping, block spacing, retained selection paths, and page-level virtualization.',
  'Nullam id dolor id nibh ultricies vehicula ut id elit. Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Sed posuere consectetur est at lobortis. Integer posuere erat a ante venenatis dapibus posuere velit aliquet.',
  'Morbi leo risus, porta ac consectetur ac, vestibulum at eros. Cras mattis consectetur purus sit amet fermentum. The page intentionally looks like a real document instead of a synthetic counter pretending to be content.',
] as const;

const richMarkdownStressTasks = [
  'Measure visible rows before trusting scroll performance.',
  'Keep page chrome cheaper than editable content.',
  'Retain selected paths outside the ordinary viewport.',
  'Avoid treating blank fixture pages as passing evidence.',
  'Prefer deterministic text over placeholder counters.',
] as const;

const richMarkdownStressQuotes = [
  'Pagination should fail loudly when content is not mounted.',
  'A stress document needs believable content, not just counters.',
  'The viewport is the source of truth for expensive rendering.',
  'Fast scrolling is a product interaction, not a synthetic jump.',
  'Good fixtures make the broken state obvious at a glance.',
] as const;

const getRichMarkdownStressText = (
  index: number,
  offset: number,
  repeats = 2
) =>
  Array.from({ length: repeats }, (_, repeatIndex) => {
    const base =
      richMarkdownStressParagraphs[
        (index + offset + repeatIndex) % richMarkdownStressParagraphs.length
      ]!;
    const next =
      richMarkdownStressParagraphs[
        (index + offset + repeatIndex + 2) % richMarkdownStressParagraphs.length
      ]!;

    return `${base} ${next}`;
  }).join(' ');

const createRichMarkdownStressSection = (index: number): Value => {
  const lead =
    index % 17 === 0
      ? {
          language: 'ts',
          paginationFixture: richMarkdownStressFixture,
          type: 'code-block',
          children: [
            {
              text: Array.from(
                { length: 40 },
                (_, lineIndex) =>
                  `const section${index + 1}_${lineIndex + 1} = layout.pages[${index + lineIndex}]`
              ).join('\n'),
            },
          ],
        }
      : index % 11 === 0
        ? {
            paginationFixture: richMarkdownStressFixture,
            type: 'block-quote',
            children: [
              {
                text: `${richMarkdownStressQuotes[index % richMarkdownStressQuotes.length]!} ${getRichMarkdownStressText(index, 1)}`,
              },
            ],
          }
        : index % 7 === 0
          ? {
              checked: index % 2 === 0,
              paginationFixture: richMarkdownStressFixture,
              type: 'check-list-item',
              children: [
                {
                  text: `${richMarkdownStressTasks[index % richMarkdownStressTasks.length]!} ${getRichMarkdownStressText(index, 2)}`,
                },
              ],
            }
          : {
              paginationFixture: richMarkdownStressFixture,
              type: 'paragraph',
              children: [
                {
                  text: `${richMarkdownStressTitles[index % richMarkdownStressTitles.length]!} ${index + 1}. ${getRichMarkdownStressText(index, 0)} `,
                },
                { text: 'Layout proof', bold: true },
                {
                  text: ' keeps rich text editable while DOM work stays bounded.',
                },
              ],
            };

  return [
    lead,
    {
      paginationFixture: richMarkdownStressFixture,
      type: 'paragraph',
      children: [
        {
          text: `${richMarkdownStressTitles[(index + 1) % richMarkdownStressTitles.length]!} continuation ${index + 1}. ${getRichMarkdownStressText(index, 3)}`,
        },
      ],
    },
    {
      paginationFixture: richMarkdownStressFixture,
      type: 'paragraph',
      children: [
        {
          text: `${richMarkdownStressTitles[(index + 2) % richMarkdownStressTitles.length]!} notes ${index + 1}. ${getRichMarkdownStressText(index, 5)}`,
        },
      ],
    },
  ];
};

const createRichMarkdownValue = ({
  stressPages,
  tableRows,
}: {
  stressPages: number;
  tableRows: number;
}): Value => [
  {
    type: 'heading-one',
    children: [{ text: 'Rich Markdown pagination proof' }],
  },
  {
    type: 'paragraph',
    children: [
      { text: 'This mixed block carries ' },
      { text: 'strong', bold: true },
      { text: ', ' },
      { text: 'emphasis', italic: true },
      { text: ', inline ' },
      { text: 'code', code: true },
      { text: ', and strikethrough text for run-aware layout.' },
    ],
  },
  {
    type: 'block-quote',
    children: [
      {
        text: 'Blockquotes should stay inside the page frame while keeping editable text selection native.',
      },
    ],
  },
  {
    type: 'check-list-item',
    checked: true,
    children: [{ text: 'Task list item rendered as rich text.' }],
  },
  {
    type: 'code-block',
    language: 'ts',
    children: [
      {
        text: 'const page = layout.pages[0]\nexpect(page.content.width).toBeGreaterThan(0)',
      },
    ],
  },
  {
    type: 'table',
    children: createPaginationTableRows(tableRows),
  },
  {
    type: 'image',
    url: richImageSvg,
    children: [{ text: '' }],
  },
  {
    type: 'thematic-break',
    children: [{ text: '' }],
  },
  {
    type: 'paragraph',
    children: [
      {
        text: 'Final paragraph after the mixed Markdown fixture keeps following content anchored after structured blocks.',
      },
    ],
  },
  ...Array.from({ length: stressPages }, (_, index) =>
    createRichMarkdownStressSection(index)
  ).flat(),
];

const isRichMarkdownStressBlock = (node: Value[number]) =>
  NodeApi.isElement(node) &&
  node.paginationFixture === richMarkdownStressFixture;

const createInitialValue = ({
  stressPages,
  tableRows,
}: {
  stressPages: number;
  tableRows: number;
}): Value => [
  ...premirrorValue,
  ...createRichMarkdownValue({ stressPages, tableRows }),
];

type PaginationLineDecoration = PlitePageLayoutDecorationRects & {
  breakAfter?: boolean;
  nativeFlow?: boolean;
};

type PaginationLineDecorationData = {
  paginationLine?: PaginationLineDecoration;
};

const flowProjectedTypes = new Set(['image', 'table', 'thematic-break']);

const isImageElement = (element: Node): element is ImageElement =>
  NodeApi.isElement(element) &&
  element.type === 'image' &&
  typeof element.url === 'string';

const isFlowProjectedType = (type: unknown) =>
  typeof type === 'string' && flowProjectedTypes.has(type);

type PaginationTableLayout = {
  left: number;
  top: number;
};

const PaginationTableLayoutContext =
  createContext<PaginationTableLayout | null>(null);

const getNativeFlowEditablePathKeys = (
  fragments: readonly {
    pageIndex: number;
    path: number[];
    units?: readonly unknown[];
  }[]
) => {
  const fragmentsByPath = new Map<
    string,
    { count: number; pageIndexes: Set<number> }
  >();

  for (const fragment of fragments) {
    if (fragment.units && fragment.units.length > 0) {
      continue;
    }

    const key = getPlitePageLayoutPathKey(fragment.path);
    const entry = fragmentsByPath.get(key) ?? {
      count: 0,
      pageIndexes: new Set<number>(),
    };

    entry.count += 1;
    entry.pageIndexes.add(fragment.pageIndex);
    fragmentsByPath.set(key, entry);
  }

  return new Set(
    [...fragmentsByPath]
      .filter(([, entry]) => entry.count === 1 && entry.pageIndexes.size === 1)
      .map(([key]) => key)
  );
};

const getFragmentBounds = (
  fragments: readonly PliteLayoutRenderedFragment[]
): PlitePageRect | null => {
  const rects = fragments.map((fragment) => fragment.rect);

  if (rects.length === 0) {
    return null;
  }

  const left = Math.min(...rects.map((rect) => rect.left));
  const top = Math.min(...rects.map((rect) => rect.top));
  const right = Math.max(...rects.map((rect) => rect.left + rect.width));
  const bottom = Math.max(...rects.map((rect) => rect.top + rect.height));

  return {
    height: bottom - top,
    left,
    top,
    width: right - left,
  };
};

const getVisibleTableRowRanges = (
  tablePathLength: number,
  fragments: readonly PliteLayoutRenderedFragment[]
) => {
  const rowIndexes = [
    ...new Set(
      fragments.flatMap(
        (fragment) =>
          fragment.units
            ?.map((unit) => unit.path[tablePathLength])
            .filter((index): index is number => typeof index === 'number') ?? []
      )
    ),
  ].sort((left, right) => left - right);
  const ranges: { end: number; start: number }[] = [];

  for (const rowIndex of rowIndexes) {
    const previous = ranges.at(-1);

    if (previous && rowIndex === previous.end + 1) {
      previous.end = rowIndex;
      continue;
    }

    ranges.push({ end: rowIndex, start: rowIndex });
  }

  return ranges;
};

const renderTableChildrenWindow = ({
  ranges,
  rowCount,
  slots,
}: Pick<RenderElementProps, 'slots'> & {
  ranges: readonly { end: number; start: number }[];
  rowCount: number;
}) => {
  const renderedChildren = [];
  let nextIndex = 0;

  for (const range of ranges) {
    if (nextIndex < range.start) {
      renderedChildren.push(
        <Fragment key={`hidden-${nextIndex}-${range.start - 1}`}>
          {slots.contentBoundary({
            boundaryId: `pagination-table-hidden:${nextIndex}-${range.start - 1}`,
            copyPolicy: 'model',
            findPolicy: 'native',
            mounted: false,
            reason: 'viewport-virtualization',
            renderPlaceholder: () => null,
            scope: {
              from: nextIndex,
              to: range.start - 1,
              type: 'children',
            },
            selectionPolicy: 'materialize',
          })}
        </Fragment>
      );
    }

    renderedChildren.push(
      slots.children({
        from: range.start,
        to: Math.min(range.end, rowCount - 1),
      })
    );
    nextIndex = range.end + 1;
  }

  if (nextIndex < rowCount) {
    renderedChildren.push(
      <Fragment key={`hidden-${nextIndex}-${rowCount - 1}`}>
        {slots.contentBoundary({
          boundaryId: `pagination-table-hidden:${nextIndex}-${rowCount - 1}`,
          copyPolicy: 'model',
          findPolicy: 'native',
          mounted: false,
          reason: 'viewport-virtualization',
          renderPlaceholder: () => null,
          scope: {
            from: nextIndex,
            to: rowCount - 1,
            type: 'children',
          },
          selectionPolicy: 'materialize',
        })}
      </Fragment>
    );
  }

  return renderedChildren;
};

type PaginationElementProps = RenderElementProps & {
  debugFrames: boolean;
  flowBlockPaths: ReadonlySet<string>;
  usesVirtualizedLayout: boolean;
};

const getProjectedStyle = ({
  box,
  debugFrames,
  flowElement,
  usesVirtualizedLayout,
  virtualOffsetTop,
}: {
  box: PlitePageRect;
  debugFrames: boolean;
  flowElement: boolean;
  usesVirtualizedLayout: boolean;
  virtualOffsetTop: number;
}): CSSProperties => ({
  boxSizing: 'border-box',
  caretColor: '#111827',
  color: flowElement ? '#111827' : 'transparent',
  height: Math.max(1, box.height),
  left: box.left,
  margin: 0,
  outline: debugFrames ? '1px dotted rgba(239, 68, 68, 0.55)' : undefined,
  overflow: 'visible',
  position: 'absolute',
  top: usesVirtualizedLayout ? box.top - virtualOffsetTop : box.top,
  width: Math.max(1, box.width),
});

const PaginationElement = (props: PaginationElementProps) => {
  const {
    attributes,
    debugFrames,
    element,
    flowBlockPaths,
    slots,
    usesVirtualizedLayout,
  } = props;
  const path = useElementPath();
  const virtualOffsetTop = useDOMStrategyVirtualOffset();
  const fragments = usePliteLayoutFragmentsAtPath(path);
  const tableLayout = useContext(PaginationTableLayoutContext);
  const elementType = element.type;
  const box = getFragmentBounds(fragments);

  if (elementType === 'table-row') {
    const rowUnit = fragments[0]?.units?.[0];
    const rowIndex = path?.at(-1);

    if (!rowUnit || !tableLayout) {
      return (
        <div
          {...attributes}
          data-pagination-row-index={rowIndex}
          style={{ display: 'none' }}
        />
      );
    }

    return (
      <div
        {...attributes}
        data-pagination-row-index={rowIndex}
        data-testid="pagination-rich-table-row"
        style={{
          display: 'flex',
          height: rowUnit.rect.height,
          left: rowUnit.rect.left - tableLayout.left,
          position: 'absolute',
          top: rowUnit.rect.top - tableLayout.top,
          width: rowUnit.rect.width,
        }}
      >
        {props.children}
      </div>
    );
  }

  if (elementType === 'table-cell') {
    return (
      <div
        {...attributes}
        data-pagination-column-index={path?.at(-1)}
        data-pagination-row-index={path?.at(-2)}
        data-testid="pagination-rich-table-cell"
        style={{
          border: '1px solid #cbd5e1',
          display: 'flex',
          flex: '1 1 0',
          flexDirection: 'column',
          fontSize: 13,
          justifyContent: 'center',
          lineHeight: '18px',
          minWidth: 0,
          overflow: 'hidden',
          padding: '5px 8px',
        }}
      >
        {props.children}
      </div>
    );
  }

  if (!box) {
    if (isPaginationBlockFormat(elementType as CustomElementType)) {
      const TextBlock =
        paginationTextBlockTags[elementType as PaginationBlockFormat];

      return (
        <TextBlock
          {...attributes}
          style={getPaginationTextBlockElementStyle(
            elementType as CustomElementType
          )}
        >
          {props.children}
        </TextBlock>
      );
    }

    return <div {...attributes}>{props.children}</div>;
  }

  const flowElement =
    isFlowProjectedType(elementType) ||
    Boolean(path && flowBlockPaths.has(getPlitePageLayoutPathKey(path)));
  const projectedStyle = getProjectedStyle({
    box,
    debugFrames,
    flowElement,
    usesVirtualizedLayout,
    virtualOffsetTop,
  });

  if (elementType === 'table') {
    const tablePathLength = path?.length ?? 0;
    const visibleRowRanges = getVisibleTableRowRanges(
      tablePathLength,
      fragments
    );
    const tableChildren =
      visibleRowRanges.length === 0
        ? slots.contentBoundary({
            boundaryId: 'pagination-table-hidden:all',
            copyPolicy: 'model',
            findPolicy: 'native',
            mounted: false,
            reason: 'viewport-virtualization',
            renderPlaceholder: () => null,
            scope: {
              from: 0,
              to: element.children.length - 1,
              type: 'children',
            },
            selectionPolicy: 'materialize',
          })
        : renderTableChildrenWindow({
            ranges: visibleRowRanges,
            rowCount: element.children.length,
            slots,
          });

    return (
      <PaginationTableLayoutContext.Provider
        value={{ left: box.left, top: box.top }}
      >
        <div
          {...attributes}
          data-testid="pagination-rich-table"
          style={{
            ...projectedStyle,
            display: 'block',
          }}
        >
          {tableChildren}
        </div>
      </PaginationTableLayoutContext.Provider>
    );
  }

  if (isImageElement(element)) {
    return (
      <div
        {...attributes}
        data-testid="pagination-rich-image"
        style={projectedStyle}
      >
        <img
          alt=""
          src={element.url}
          style={{
            border: '1px solid #cbd5e1',
            display: 'block',
            height: '100%',
            objectFit: 'cover',
            width: '100%',
          }}
        />
        {props.children}
      </div>
    );
  }

  if (elementType === 'thematic-break') {
    return (
      <div
        {...attributes}
        data-testid="pagination-rich-thematic-break"
        style={projectedStyle}
      >
        <hr
          style={{
            border: 0,
            borderTop: '2px solid #cbd5e1',
            margin: '11px 0 0',
          }}
        />
        {props.children}
      </div>
    );
  }

  if (isPaginationBlockFormat(elementType as CustomElementType)) {
    const TextBlock =
      paginationTextBlockTags[elementType as PaginationBlockFormat];

    return (
      <TextBlock
        {...attributes}
        data-testid={debugFrames ? 'pagination-projected-block' : undefined}
        style={{
          ...projectedStyle,
          ...getPaginationTextBlockElementStyle(
            elementType as CustomElementType
          ),
          ...(flowElement && usesVirtualizedLayout
            ? {
                paddingLeft: PAGE_CONTENT_INLINE_INSET,
                width:
                  typeof projectedStyle.width === 'number'
                    ? projectedStyle.width + PAGE_CONTENT_INLINE_INSET
                    : projectedStyle.width,
              }
            : undefined),
        }}
      >
        {props.children}
      </TextBlock>
    );
  }

  return (
    <div
      {...attributes}
      data-testid={
        elementType === 'code-block'
          ? 'pagination-rich-code-block'
          : debugFrames
            ? 'pagination-projected-block'
            : undefined
      }
      style={{
        ...projectedStyle,
        background:
          elementType === 'code-block'
            ? 'rgba(15, 23, 42, 0.04)'
            : elementType === 'block-quote'
              ? 'rgba(37, 99, 235, 0.04)'
              : undefined,
        borderLeft:
          elementType === 'block-quote'
            ? '3px solid rgba(37, 99, 235, 0.35)'
            : undefined,
        paddingLeft: elementType === 'block-quote' ? 12 : undefined,
      }}
    >
      {props.children}
    </div>
  );
};

const renderPaginationLeaf = ({
  attributes,
  children,
  segment,
}: RenderLeafProps) => {
  const line = (
    segment.slices.find(
      (slice) =>
        (slice.data as PaginationLineDecorationData | undefined)?.paginationLine
    )?.data as PaginationLineDecorationData | undefined
  )?.paginationLine;

  if (!line) {
    return (
      <span {...attributes} style={getPaginationLeafStyle(segment.marks)}>
        {children}
      </span>
    );
  }

  if (line.nativeFlow) {
    return (
      <span
        {...attributes}
        style={{
          ...getPaginationLeafStyle(segment.marks),
          whiteSpace: 'pre',
        }}
      >
        {children}
        {line.breakAfter ? <br data-pagination-native-flow-break /> : null}
      </span>
    );
  }

  return (
    <span
      {...attributes}
      style={{
        color: '#111827',
        display: 'inline-block',
        fontFamily: segment.marks.code ? PAGE_CODE_FONT : undefined,
        fontStyle: segment.marks.italic ? 'italic' : undefined,
        fontWeight: segment.marks.bold ? 700 : undefined,
        height: line.hitRect.height,
        left: line.textRect.left,
        lineHeight: `${line.textRect.height}px`,
        minWidth: line.textRect.width === 0 ? 1 : undefined,
        position: 'absolute',
        textDecorationLine: getPaginationTextDecorationLine(segment.marks),
        top: line.textRect.top,
        whiteSpace: 'pre',
        width: line.hitRect.width,
      }}
    >
      {children}
    </span>
  );
};

type PagedEditableProps = ComponentProps<typeof PagedEditable>;

type PaginationPageViewProps = {
  debugFrames: boolean;
  decorate: PagedEditableProps['decorate'];
  domStrategy: PagedEditableProps['domStrategy'];
  layout: PagedEditableProps['layout'];
  onDOMStrategyMetrics: PagedEditableProps['onDOMStrategyMetrics'];
  onKeyDown: PagedEditableProps['onKeyDown'];
  pageGeometry: {
    height: number;
    width: number;
  };
  pageLayoutMode: 'single' | 'spread';
  pageScale: number;
  renderElement: PagedEditableProps['renderElement'];
  renderLeaf: PagedEditableProps['renderLeaf'];
  viewportRef: RefObject<HTMLDivElement | null>;
};

const PaginationPageView = ({
  debugFrames,
  decorate,
  domStrategy,
  layout,
  onDOMStrategyMetrics,
  onKeyDown,
  pageGeometry,
  pageLayoutMode,
  pageScale,
  renderElement,
  renderLeaf,
  viewportRef,
}: PaginationPageViewProps) => (
  <div
    className="plite-pagination-viewport"
    data-testid="pagination-viewport"
    ref={viewportRef}
  >
    <div className="plite-pagination-viewport-inner">
      <div
        style={{
          height: pageGeometry.height * pageScale,
          width: pageGeometry.width * pageScale,
        }}
      >
        <div
          className="plite-pagination-scaled-surface"
          style={{
            transform: `scale(${pageScale})`,
            width: pageGeometry.width,
          }}
        >
          <PagedEditable
            className="plite-pagination-editor"
            decorate={decorate}
            decorateDirtiness="external"
            domStrategy={domStrategy}
            layout={layout}
            onDOMStrategyMetrics={onDOMStrategyMetrics}
            onKeyDown={onKeyDown}
            pageView={{ gap: PAGE_GAP, mode: pageLayoutMode }}
            renderElement={renderElement}
            renderLeaf={renderLeaf}
            renderPage={({ attributes, page }) => (
              <div
                {...attributes}
                className={cn(
                  'plite-pagination-page',
                  debugFrames && 'plite-pagination-page-debug'
                )}
                style={{
                  height: page.height,
                  overflow: 'hidden',
                  width: page.width,
                }}
              >
                {debugFrames ? (
                  <>
                    <div
                      className="plite-pagination-content-frame"
                      data-testid="pagination-content-frame"
                      style={{
                        height: page.content.height,
                        left: page.content.left,
                        top: page.content.top,
                        width: page.content.width,
                      }}
                    />
                    <div className="plite-pagination-page-label">
                      page {page.index} | {page.width}x{page.height}px
                    </div>
                  </>
                ) : null}
              </div>
            )}
            spellCheck
          />
        </div>
      </div>
    </div>
  </div>
);

type ElementSize = {
  height: number;
  width: number;
};

const useElementSize = <T extends HTMLElement>(): [
  RefObject<T | null>,
  ElementSize,
] => {
  const ref = useRef<T | null>(null);
  const [size, setSize] = useState<ElementSize>({ height: 0, width: 0 });

  useEffect(() => {
    const element = ref.current;

    if (!element) {
      return;
    }

    const update = () => {
      const rect = element.getBoundingClientRect();
      setSize({ height: rect.height, width: rect.width });
    };

    update();

    const observer = new ResizeObserver(update);
    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  return [ref, size];
};

const PaginationSurface = ({
  controls,
  setControls,
}: {
  controls: PaginationControls;
  setControls: SetPaginationControls;
}) => {
  const editor = useEditor<CustomEditor>();
  const setSettings = useSetStateField(pageSettings);
  const [effectiveDOMStrategy, setEffectiveDOMStrategy] =
    useState<EditableDOMStrategyEffectiveType | null>(null);
  const [viewportRef, viewportSize] = useElementSize<HTMLDivElement>();
  const tableRowsEffectMountedRef = useRef(false);
  const stressPagesEffectMountedRef = useRef(false);
  const {
    debugFrames,
    domStrategyMode,
    margins,
    mediaHeight,
    mediaSplit,
    pageLayoutMode,
    pageOverscan,
    preset,
    tableRowHeight,
    tableRows,
    virtualizedStressPages,
  } = controls;
  const effectiveStressPageCount =
    domStrategyMode === 'virtualized' ? virtualizedStressPages : 0;
  const activeFlowBlockKey = useEditorState(
    (state) => {
      if (domStrategyMode !== 'virtualized') {
        return null;
      }

      const selection = state.selection.get();
      const anchorIndex = selection?.anchor.path[0];
      const focusIndex = selection?.focus.path[0];
      const indexes = [anchorIndex, focusIndex]
        .filter((index): index is number => typeof index === 'number')
        .sort((left, right) => left - right);

      return indexes.length === 0
        ? null
        : [...new Set(indexes)]
            .map((index) => getPlitePageLayoutPathKey([index]))
            .join('|');
    },
    {
      deps: [domStrategyMode],
      shouldUpdate: (change) => {
        if (domStrategyMode !== 'virtualized') {
          return false;
        }
        if (!change) {
          return true;
        }
        if (
          change.fullDocumentChanged ||
          change.rootRuntimeIdsChanged ||
          change.structureChanged ||
          change.topLevelOrderChanged
        ) {
          return true;
        }
        if (!change.selectionChanged) {
          return false;
        }

        const beforeAnchor = change.selectionBefore?.anchor.path[0];
        const beforeFocus = change.selectionBefore?.focus.path[0];
        const afterAnchor = change.selectionAfter?.anchor.path[0];
        const afterFocus = change.selectionAfter?.focus.path[0];

        return beforeAnchor !== afterAnchor || beforeFocus !== afterFocus;
      },
    }
  );
  const typography = useMemo(
    () =>
      ({
        block: ({ element }) => ({
          blockSpacing: isPaginationBlockFormat(
            element.type as CustomElementType
          )
            ? getPaginationTextBlockStyle(element.type as CustomElementType)
                .blockSpacing
            : element.type === 'table'
              ? 18
              : 12,
          lineHeight: isPaginationBlockFormat(element.type as CustomElementType)
            ? getPaginationTextBlockStyle(element.type as CustomElementType)
                .lineHeight
            : element.type === 'table'
              ? 72
              : element.type === 'image'
                ? 120
                : 24,
        }),
        text: ({ element, leaf }) => ({
          font: getPaginationTextFont(
            element.type as CustomElementType,
            leaf as CustomText
          ),
          letterSpacing: 0,
        }),
      }) satisfies PlitePageLayoutTypography,
    []
  );
  const layoutEngine = useMemo(
    () =>
      pretextPageLayoutEngine({
        estimateBlock:
          domStrategyMode === 'virtualized'
            ? ({ block }) =>
                block.element.paginationFixture === richMarkdownStressFixture
            : undefined,
      }),
    [domStrategyMode]
  );
  const textChangeRefresh = useMemo<PlitePageLayoutTextChangeRefresh>(
    () =>
      domStrategyMode === 'virtualized'
        ? { delayMs: 120, maxDelayMs: 360, mode: 'deferred' }
        : 'deferred',
    [domStrategyMode]
  );
  const applyTableRows = useCallback(
    (nextTableRows: number) => {
      editor.update((tx) => {
        const root = tx.value.root();
        const tableIndex = root.findIndex(
          (node: Value[number]) =>
            NodeApi.isElement(node) && node.type === 'table'
        );

        if (tableIndex === -1) {
          return;
        }

        const table = root[tableIndex];

        if (!NodeApi.isElement(table)) {
          return;
        }

        if (table.children.length === nextTableRows) {
          return;
        }

        tx.selection.clear();

        if (table.children.length > nextTableRows) {
          for (
            let index = table.children.length - 1;
            index >= nextTableRows;
            index--
          ) {
            tx.nodes.remove({ at: [tableIndex, index] });
          }
        } else {
          tx.nodes.insert(
            createPaginationTableRows(nextTableRows).slice(
              table.children.length
            ),
            { at: [tableIndex, table.children.length] }
          );
        }
      });
    },
    [editor]
  );
  const applyStressPages = useCallback(
    (nextStressPages: number) => {
      editor.update((tx) => {
        const root = tx.value.root() as Value;
        const stressIndexes: number[] = [];

        root.forEach((node, index) => {
          if (isRichMarkdownStressBlock(node)) {
            stressIndexes.push(index);
          }
        });
        const nonStressCount = root.length - stressIndexes.length;
        const stressPagesAlreadyAtEnd = stressIndexes.every(
          (index, offset) => index === nonStressCount + offset
        );

        if (
          stressPagesAlreadyAtEnd &&
          stressIndexes.length ===
            nextStressPages * richMarkdownStressSectionBlockCount
        ) {
          return;
        }

        for (let index = stressIndexes.length - 1; index >= 0; index--) {
          tx.nodes.remove({ at: [stressIndexes[index]!] });
        }

        const nextStressBlocks = Array.from(
          { length: nextStressPages },
          (_, index) => createRichMarkdownStressSection(index)
        ).flat();

        if (nextStressBlocks.length > 0) {
          tx.nodes.insert(nextStressBlocks, { at: [nonStressCount] });
        }
      });
    },
    [editor]
  );

  useEffect(() => {
    setSettings((previous) => {
      if (previous.margins === margins && previous.preset === preset) {
        return previous;
      }

      return { ...previous, margins, preset };
    });
  }, [margins, preset, setSettings]);

  useEffect(() => {
    if (!tableRowsEffectMountedRef.current) {
      tableRowsEffectMountedRef.current = true;
      return;
    }

    applyTableRows(tableRows);
  }, [applyTableRows, tableRows]);

  useEffect(() => {
    if (!stressPagesEffectMountedRef.current) {
      stressPagesEffectMountedRef.current = true;
      return;
    }

    applyStressPages(effectiveStressPageCount);
  }, [applyStressPages, effectiveStressPageCount]);

  const nodeLayout = useCallback<PliteNodeLayoutProvider>(
    ({ defaults, element, pageSettings, path }) => {
      const page = createPlitePage(pageSettings);

      if (element.type === 'table') {
        const rowCount = Math.min(tableRows, element.children.length);

        return {
          boxes: [
            {
              kind: 'table',
              path: [...path],
              rect: {
                height: rowCount * tableRowHeight,
                left: 0,
                top: 0,
                width: page.content.width,
              },
              split: 'row',
            },
          ],
          type: 'units',
          units: Array.from({ length: rowCount }, (_, rowIndex) => ({
            key: `row-${rowIndex}`,
            kind: 'table-row',
            path: [...path, rowIndex],
            rect: {
              height: tableRowHeight,
              left: 0,
              top: rowIndex * tableRowHeight,
              width: page.content.width,
            },
            split: 'avoid',
          })),
        };
      }

      if (element.type === 'image') {
        return {
          box: {
            kind: 'image',
            path: [...path],
            rect: {
              height: mediaHeight,
              left: 0,
              top: 0,
              width: page.content.width,
            },
            split: mediaSplit,
          },
          type: 'box',
        };
      }

      return { boxes: defaults.boxes, type: 'text' };
    },
    [mediaHeight, mediaSplit, tableRowHeight, tableRows]
  );
  const layout = usePliteLayout(editor, {
    engine: layoutEngine,
    nodeLayout,
    page: pageSettings,
    textChangeRefresh,
    typography,
  });
  const snapshot = usePliteLayoutSnapshot(layout);
  const metrics = layout.getMetrics();
  const pageGeometry = useMemo(
    () =>
      getPlitePageLayoutGeometry(snapshot.pages, {
        pageGap: PAGE_GAP,
        pageLayoutMode,
      }),
    [pageLayoutMode, snapshot.pages]
  );
  const tablePageCount = useMemo(() => {
    const tablePages = new Set<number>();

    snapshot.fragments.forEach((fragment) => {
      if (fragment.units?.some((unit) => unit.kind === 'table-row')) {
        tablePages.add(fragment.pageIndex);
      }
    });

    return tablePages.size;
  }, [snapshot.fragments]);
  const nativeFlowEditablePathKeys = useMemo(
    () => getNativeFlowEditablePathKeys(snapshot.fragments),
    [snapshot.fragments]
  );
  const activeFlowBlockPaths = useMemo(
    () =>
      new Set(
        (activeFlowBlockKey?.split('|') ?? []).filter((pathKey) =>
          nativeFlowEditablePathKeys.has(pathKey)
        )
      ),
    [activeFlowBlockKey, nativeFlowEditablePathKeys]
  );
  const paginationDecorationCache = useMemo(
    () => ({
      layout,
      pageGeometry,
      snapshot,
      values: new Map<
        string,
        ReturnType<EditableDecorate<PaginationLineDecorationData>>
      >(),
    }),
    [layout, pageGeometry, snapshot]
  );
  const availableWidth = Math.max(
    0,
    viewportSize.width - PAGE_STACK_SAFE_INLINE * 2
  );
  const pageScale =
    pageGeometry.width > 0 && availableWidth > 0
      ? Math.min(1, availableWidth / pageGeometry.width)
      : 1;
  const domStrategy = useMemo<EditableProps['domStrategy']>(
    () =>
      domStrategyMode === 'virtualized'
        ? {
            estimatedBlockSize: 48,
            overscan: pageOverscan,
            textSync: {
              projections: 'range-transform',
              renderLeaf: 'text-invariant',
            },
            threshold: 1,
            type: 'virtualized',
          }
        : domStrategyMode === 'staged'
          ? {
              textSync: {
                projections: 'range-transform',
                renderLeaf: 'text-invariant',
              },
              type: 'staged',
            }
          : domStrategyMode,
    [domStrategyMode, pageOverscan]
  );
  const usesVirtualizedLayout = effectiveDOMStrategy === 'virtualized';
  const handleDOMStrategyMetrics = useCallback(
    ({
      effectiveStrategy,
    }: {
      effectiveStrategy: EditableDOMStrategyEffectiveType;
    }) => {
      setEffectiveDOMStrategy((current) =>
        current === effectiveStrategy ? current : effectiveStrategy
      );
    },
    []
  );
  const pageStride = (pageGeometry.height + PAGE_GAP) * pageScale;
  const visiblePageRows =
    pageStride > 0
      ? Math.max(1, Math.ceil(viewportSize.height / pageStride))
      : 1;
  const visiblePageCount = Math.min(
    snapshot.pages.length,
    visiblePageRows * (pageLayoutMode === 'spread' ? 2 : 1)
  );
  const decorate = useCallback<EditableDecorate<PaginationLineDecorationData>>(
    ([node, path]) => {
      if (!NodeApi.isText(node)) {
        return [];
      }

      const pathKey = getPlitePageLayoutPathKey(path);
      const blockPath = path.slice(0, -1);
      const activeFlow = activeFlowBlockPaths.has(
        getPlitePageLayoutPathKey(blockPath)
      );
      const cacheKey = activeFlow
        ? `${pathKey}:native`
        : `${pathKey}:projected`;
      const cached = paginationDecorationCache.values.get(cacheKey);

      if (cached) {
        return cached;
      }

      const blockFragments = layout.getFragments(blockPath);

      if (blockFragments.length === 0) {
        paginationDecorationCache.values.set(cacheKey, []);
        return [];
      }

      const pathProjection = getPlitePageLayoutProjection(
        { ...snapshot, fragments: blockFragments },
        {
          geometry: pageGeometry,
          hitTesting: { inlineInset: PAGE_CONTENT_INLINE_INSET },
        }
      );
      const decorations =
        getPlitePageLayoutDecorations<PaginationLineDecorationData>(
          pathProjection,
          {
            data: ({ block, line, rects, run }) => {
              const nativeFlow =
                block &&
                activeFlowBlockPaths.has(getPlitePageLayoutPathKey(block.path));
              const blockTextLength =
                snapshot.blocks[line.blockIndex]?.text.length ?? line.end;

              return {
                paginationLine: {
                  ...rects,
                  breakAfter:
                    nativeFlow &&
                    run.range.end >= line.end &&
                    line.end < blockTextLength,
                  nativeFlow,
                },
              };
            },
            filter: ({ block, line }) =>
              !isFlowProjectedType(
                snapshot.blocks[line.blockIndex]?.element.type
              ),
            rects: 'block',
          }
        ).get(pathKey) ?? [];

      paginationDecorationCache.values.set(cacheKey, decorations);

      return decorations;
    },
    [
      activeFlowBlockPaths,
      layout,
      pageGeometry,
      paginationDecorationCache,
      snapshot,
    ]
  );
  const renderElement = useCallback(
    (props: RenderElementProps) => (
      <PaginationElement
        {...props}
        debugFrames={debugFrames}
        flowBlockPaths={activeFlowBlockPaths}
        usesVirtualizedLayout={usesVirtualizedLayout}
      />
    ),
    [activeFlowBlockPaths, debugFrames, usesVirtualizedLayout]
  );
  const renderLeaf = renderPaginationLeaf;
  const onKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) =>
      handlePaginationKeyDown(editor, event),
    [editor]
  );

  return (
    <div className="plite-pagination-shell">
      <PaginationControlsToolbar
        applyTableRows={applyTableRows}
        controls={controls}
        setControls={setControls}
      />
      <div className="plite-pagination-title-row">
        <div className="plite-pagination-title">Untitled document</div>
        <div
          className="plite-pagination-meta"
          data-layout-compose-count={metrics.composeCount}
          data-layout-compose-ms={metrics.lastDurationMs.toFixed(1)}
        >
          pages {snapshot.pages.length} | rows {tableRows} x {tableRowHeight}px
          | table pages {tablePageCount} | stress pages{' '}
          {effectiveStressPageCount} | page overscan {pageOverscan} | visible
          pages {visiblePageCount} | media {mediaHeight}px | blocks{' '}
          {metrics.blockCount} | compose {metrics.lastDurationMs.toFixed(1)}ms
        </div>
      </div>
      <PaginationPageView
        debugFrames={debugFrames}
        decorate={decorate}
        domStrategy={domStrategy}
        layout={layout}
        onDOMStrategyMetrics={handleDOMStrategyMetrics}
        onKeyDown={onKeyDown}
        pageGeometry={pageGeometry}
        pageLayoutMode={pageLayoutMode}
        pageScale={pageScale}
        renderElement={renderElement}
        renderLeaf={renderLeaf}
        viewportRef={viewportRef}
      />
    </div>
  );
};

const PaginationEditor = ({
  controls,
  setControls,
}: {
  controls: PaginationControls;
  setControls: SetPaginationControls;
}) => {
  const initialStressPages =
    controls.domStrategyMode === 'virtualized'
      ? controls.virtualizedStressPages
      : 0;
  const editor = usePliteEditor({
    extensions: [pageSettings],
    initialValue: {
      children: createInitialValue({
        stressPages: initialStressPages,
        tableRows: controls.tableRows,
      }),
      state: {
        [pageSettings.key]: {
          margins: controls.margins,
          preset: controls.preset,
        },
      },
    },
  });

  return (
    <Plite editor={editor}>
      <PaginationSurface controls={controls} setControls={setControls} />
    </Plite>
  );
};

const PaginationExample = () => {
  const [controls, setControls] = useQueryStates(paginationControlParsers, {
    ...replaceQueryOptions,
    urlKeys: paginationControlUrlKeys,
  });
  const editorKey =
    controls.domStrategyMode === 'virtualized' ? 'virtualized' : 'standard';

  return (
    <PaginationEditor
      controls={controls}
      key={editorKey}
      setControls={setControls}
    />
  );
};

export default PaginationExample;
