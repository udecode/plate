import {
  parseAsBoolean,
  parseAsStringLiteral,
  type SetValues,
  useQueryStates,
  type Values,
} from 'nuqs';
import {
  definePlugin,
  defineStateField,
  type ElementOf,
  type Node,
  NodeApi,
  type Value,
} from 'plitejs';
import { isHotkey } from 'plitejs/dom';
import { history } from 'plitejs/history';
import {
  createPretextPageLayoutEngine,
  type NodeFragmentationProvider,
  type PageLayoutTypography,
  pageSettingsCodec,
  type PageSettings,
} from 'plitejs/pagination';
import {
  PagedEditable,
  usePageLayout,
  usePageLayoutFragments,
} from 'plitejs/pagination/react';
import {
  EditorRoot,
  type RenderElementProps,
  type RenderLeafProps,
  useEditor,
  useEditorContext,
  useEditorState,
  useSetStateField,
} from 'plitejs/react';
import {
  type ChangeEvent,
  type CSSProperties,
  type KeyboardEvent,
  type RefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

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

const pageSettings = defineStateField<PageSettings>({
  collab: 'shared',
  history: 'push',
  initial: () => ({ margins: 96, preset: 'a4' }),
  key: 'layout.page',
  persist: pageSettingsCodec,
});

const pageSettingsPlugin = definePlugin('pageSettings', {
  stateFields: [pageSettings],
});

type RenderingMode = 'complete' | 'virtualized';
type PaginationBlockFormat = Extract<
  CustomElementType,
  'heading-one' | 'heading-three' | 'heading-two' | 'paragraph'
>;

const pagePresetOptions = ['a4', 'letter'] as const;
const renderingModeOptions = ['complete', 'virtualized'] as const;
const pageLayoutModeOptions = ['spread', 'single'] as const;

const PAGE_GAP = 24;
const PAGE_STACK_SAFE_INLINE = 72;
const PAGE_TEXT_FONT = '"Helvetica Neue", Helvetica, Arial, sans-serif';
const PAGE_CODE_FONT = 'SFMono-Regular, Menlo, monospace';
const DEFAULT_MEDIA_HEIGHT = 240;
const DEFAULT_TABLE_ROW_HEIGHT = 36;
const DEFAULT_TABLE_ROWS = 240;
const DEFAULT_VIRTUALIZED_STRESS_PAGES = 990;
const MAX_MEDIA_HEIGHT = 1200;
const MAX_TABLE_ROW_HEIGHT = 960;
const MAX_TABLE_ROWS = 1000;
const MAX_VIRTUALIZED_STRESS_PAGES = 2000;

const paginationControlParsers = {
  debugFrames: parseAsBoolean.withDefault(false),
  margins: parseAsBoundedInteger(48, 240).withDefault(96),
  mediaHeight: parseAsBoundedInteger(120, MAX_MEDIA_HEIGHT).withDefault(
    DEFAULT_MEDIA_HEIGHT
  ),
  pageLayoutMode: parseAsStringLiteral(pageLayoutModeOptions).withDefault(
    'spread'
  ),
  preset: parseAsStringLiteral(pagePresetOptions).withDefault('a4'),
  renderingMode:
    parseAsStringLiteral(renderingModeOptions).withDefault('virtualized'),
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
  mediaHeight: 'media_height',
  pageLayoutMode: 'page_layout',
  renderingMode: 'rendering',
  tableRowHeight: 'row_height',
  tableRows: 'rows',
  virtualizedStressPages: 'stress_pages',
};

type PaginationControls = Values<typeof paginationControlParsers>;
type SetPaginationControls = SetValues<typeof paginationControlParsers>;

const paginationMarkHotkeys: Array<[string, CustomTextKey]> = [
  ['mod+b', 'bold'],
  ['mod+i', 'italic'],
  ['mod+u', 'underline'],
];
const paginationBlockHotkeys: Array<[string, PaginationBlockFormat]> = [
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
  'heading-three': 'h3',
  'heading-two': 'h2',
  paragraph: 'p',
} satisfies Record<PaginationBlockFormat, 'h1' | 'h2' | 'h3' | 'p'>;
const paginationTextBlockStyles = {
  'heading-one': {
    blockSpacing: 18,
    fontSize: 28,
    fontWeight: 700,
    lineHeight: 34,
  },
  'heading-three': {
    blockSpacing: 14,
    fontSize: 18,
    fontWeight: 700,
    lineHeight: 26,
  },
  'heading-two': {
    blockSpacing: 16,
    fontSize: 22,
    fontWeight: 700,
    lineHeight: 30,
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

const getPaginationLeafStyle = (marks: Partial<CustomText>): CSSProperties => ({
  fontFamily: marks.code ? PAGE_CODE_FONT : undefined,
  fontStyle: marks.italic ? 'italic' : undefined,
  fontWeight: marks.bold ? 700 : undefined,
  textDecorationLine: [
    marks.underline ? 'underline' : null,
    marks.strikethrough ? 'line-through' : null,
  ]
    .filter(Boolean)
    .join(' '),
});

const handlePaginationKeyDown = (
  editor: CustomEditor,
  event: KeyboardEvent<HTMLDivElement>
) => {
  for (const [hotkey, format] of paginationBlockHotkeys) {
    if (!isHotkey(hotkey, event)) continue;
    event.preventDefault();
    const active = editor.read((state) =>
      state.nodes.some({
        match: (node) => isPaginationTextBlock(node) && node.type === format,
      })
    );
    editor.update.nodes.set(
      { type: active ? 'paragraph' : format },
      { match: isPaginationTextBlock }
    );
    return true;
  }
  for (const [hotkey, mark] of paginationMarkHotkeys) {
    if (!isHotkey(hotkey, event)) continue;
    event.preventDefault();
    toggleMark(editor, mark);
    return true;
  }

  return undefined;
};

const PaginationControlsToolbar = ({
  controls,
  setControls,
}: {
  controls: PaginationControls;
  setControls: SetPaginationControls;
}) => (
  <div className="editor-pagination-toolbar">
    <div className="editor-pagination-toolbar-group">
      <span className="editor-pagination-label">
        <Label htmlFor="pagination-preset">Preset</Label>
        <NativeSelect
          className="w-24"
          id="pagination-preset"
          onChange={(event) =>
            void setControls({
              preset: event.currentTarget.value as PaginationControls['preset'],
            })
          }
          value={controls.preset}
        >
          <NativeSelectOption value="a4">A4</NativeSelectOption>
          <NativeSelectOption value="letter">Letter</NativeSelectOption>
        </NativeSelect>
      </span>
      <span className="editor-pagination-label">
        <Label htmlFor="pagination-margins">Margins</Label>
        <Input
          className="w-20"
          id="pagination-margins"
          min={48}
          onChange={(event: ChangeEvent<HTMLInputElement>) => {
            const value = Number.parseInt(event.currentTarget.value, 10);
            if (Number.isFinite(value)) {
              void setControls({ margins: clampNumber(value, 48, 240) });
            }
          }}
          step={12}
          type="number"
          value={controls.margins}
        />
      </span>
      <span className="editor-pagination-label">
        <Label htmlFor="pagination-rendering">Rendering</Label>
        <NativeSelect
          className="w-32"
          id="pagination-rendering"
          onChange={(event) =>
            void setControls({
              renderingMode: event.currentTarget.value as RenderingMode,
            })
          }
          value={controls.renderingMode}
        >
          <NativeSelectOption value="complete">Complete DOM</NativeSelectOption>
          <NativeSelectOption value="virtualized">
            Virtualized
          </NativeSelectOption>
        </NativeSelect>
      </span>
      <span className="editor-pagination-label">
        <Label htmlFor="pagination-rows">Rows</Label>
        <Input
          className="w-24"
          id="pagination-rows"
          max={MAX_TABLE_ROWS}
          min={8}
          onChange={(event: ChangeEvent<HTMLInputElement>) => {
            const value = Number.parseInt(event.currentTarget.value, 10);
            if (Number.isFinite(value)) {
              void setControls({
                tableRows: clampNumber(value, 8, MAX_TABLE_ROWS),
              });
            }
          }}
          type="number"
          value={controls.tableRows}
        />
      </span>
      <span className="editor-pagination-label">
        <Label htmlFor="pagination-row-height">Row px</Label>
        <Input
          className="w-20"
          id="pagination-row-height"
          max={MAX_TABLE_ROW_HEIGHT}
          min={28}
          onChange={(event: ChangeEvent<HTMLInputElement>) => {
            const value = Number.parseInt(event.currentTarget.value, 10);
            if (Number.isFinite(value)) {
              void setControls({
                tableRowHeight: clampNumber(value, 28, MAX_TABLE_ROW_HEIGHT),
              });
            }
          }}
          step={4}
          type="number"
          value={controls.tableRowHeight}
        />
      </span>
      <span className="editor-pagination-label">
        <Label htmlFor="pagination-media-height">Media px</Label>
        <Input
          className="w-24"
          id="pagination-media-height"
          max={MAX_MEDIA_HEIGHT}
          min={120}
          onChange={(event: ChangeEvent<HTMLInputElement>) => {
            const value = Number.parseInt(event.currentTarget.value, 10);
            if (Number.isFinite(value)) {
              void setControls({
                mediaHeight: clampNumber(value, 120, MAX_MEDIA_HEIGHT),
              });
            }
          }}
          step={40}
          type="number"
          value={controls.mediaHeight}
        />
      </span>
      {controls.renderingMode === 'virtualized' && (
        <span className="editor-pagination-label">
          <Label htmlFor="pagination-rich-stress">Stress pages</Label>
          <Input
            className="w-24"
            id="pagination-rich-stress"
            max={MAX_VIRTUALIZED_STRESS_PAGES}
            min={0}
            onChange={(event: ChangeEvent<HTMLInputElement>) => {
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
            }}
            step={10}
            type="number"
            value={controls.virtualizedStressPages}
          />
        </span>
      )}
    </div>
    <div className="editor-pagination-toolbar-group">
      <Separator className="h-6" orientation="vertical" />
      <span className="editor-pagination-switch-group">
        Facing
        <Switch
          aria-label="Facing"
          checked={controls.pageLayoutMode === 'spread'}
          onCheckedChange={() =>
            void setControls((state) => ({
              pageLayoutMode:
                state.pageLayoutMode === 'spread' ? 'single' : 'spread',
            }))
          }
        />
      </span>
      <Separator className="h-6" orientation="vertical" />
      <span className="editor-pagination-switch-group">
        Debug
        <Switch
          aria-label="Debug"
          checked={controls.debugFrames}
          onCheckedChange={(checked) =>
            void setControls({ debugFrames: Boolean(checked) })
          }
        />
      </span>
    </div>
  </div>
);

const richImageSvg =
  'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 640 240%22%3E%3Crect width=%22640%22 height=%22240%22 fill=%22%23f8fafc%22/%3E%3Cpath d=%22M0 190 150 94l90 62 116-86 284 120v50H0z%22 fill=%22%23bfdbfe%22/%3E%3Ccircle cx=%22518%22 cy=%2262%22 r=%2238%22 fill=%22%23f59e0b%22/%3E%3Ctext x=%2232%22 y=%2250%22 font-family=%22Arial%22 font-size=%2228%22 fill=%22%23111827%22%3EMarkdown asset%3C/text%3E%3C/svg%3E';

const fixtureParagraphs = [
  'Premirror Milestone 1 test document. This paragraph is intentionally long so word wrapping and range ownership remain visible inside page frames.',
  'Second paragraph for wrapping and flow. Lines continue across pages while the editor keeps one canonical document and one editable DOM owner.',
  'Third paragraph adds content pressure. Every visible line remains selectable, editable, and tied to its source range.',
];

const createPaginationTableRows = (count: number) =>
  Array.from({ length: count }, (_, index) => ({
    children: [
      {
        children: [{ text: index === 0 ? 'Markdown' : `Row ${index + 1}` }],
        type: 'table-cell',
      },
      {
        children: [{ text: index === 0 ? 'Plite node' : `Cell ${index + 1}` }],
        type: 'table-cell',
      },
      {
        children: [{ text: index === 0 ? 'Paged' : `Fragment ${index + 1}` }],
        type: 'table-cell',
      },
    ],
    type: 'table-row',
  }));

const stressFixture = 'pagination-stress';
const createStressSection = (index: number): Value =>
  Array.from({ length: 3 }, (_, paragraphIndex) => ({
    children: [
      {
        text: `Virtualized document section ${index + 1}.${paragraphIndex + 1}. ${
          fixtureParagraphs[(index + paragraphIndex) % fixtureParagraphs.length]
        } ${fixtureParagraphs[(index + paragraphIndex + 1) % fixtureParagraphs.length]}`,
      },
    ],
    paginationFixture: stressFixture,
    type: 'paragraph',
  }));

const createInitialValue = ({
  stressPages,
  tableRows,
}: {
  stressPages: number;
  tableRows: number;
}): Value => [
  ...Array.from({ length: 7 }, (_, section) =>
    fixtureParagraphs.map((text) => ({
      children: [{ text: `${text} Section ${section + 1}.` }],
      type: 'paragraph',
    }))
  ).flat(),
  {
    children: [{ text: 'Rich Markdown pagination proof' }],
    type: 'heading-one',
  },
  {
    children: [
      { text: 'This mixed block carries ' },
      { bold: true, text: 'strong' },
      { text: ', ' },
      { italic: true, text: 'emphasis' },
      { text: ', inline ' },
      { code: true, text: 'code' },
      { text: ', and strikethrough text.' },
    ],
    type: 'paragraph',
  },
  {
    children: [{ text: 'A blockquote remains native editable content.' }],
    type: 'block-quote',
  },
  {
    checked: true,
    children: [{ text: 'Task list item rendered as rich text.' }],
    type: 'check-list-item',
  },
  {
    children: [
      {
        text: 'const page = layout.pages[0]\nexpect(page.content.width).toBeGreaterThan(0)',
      },
    ],
    language: 'ts',
    type: 'code-block',
  },
  { children: createPaginationTableRows(tableRows), type: 'table' },
  { children: [{ text: '' }], type: 'image', url: richImageSvg },
  { children: [{ text: '' }], type: 'thematic-break' },
  {
    children: [{ text: 'Final paragraph after structured content.' }],
    type: 'paragraph',
  },
  ...Array.from({ length: stressPages }, (_, index) =>
    createStressSection(index)
  ).flat(),
];

const isImageElement = (element: Node): element is ImageElement =>
  NodeApi.isElement(element) &&
  element.type === 'image' &&
  typeof element.url === 'string';

const PaginationElement = ({
  debugFrames,
  usesVirtualizedLayout,
  ...props
}: RenderElementProps & {
  debugFrames: boolean;
  usesVirtualizedLayout: boolean;
}) => {
  const { attributes, children, element, slots } = props;
  const fragments = usePageLayoutFragments();
  const elementType = element.type as CustomElementType;
  const path = attributes['data-editor-path'];
  const outline = debugFrames
    ? '1px dotted rgba(239, 68, 68, 0.55)'
    : undefined;

  if (
    elementType === 'table-row' &&
    usesVirtualizedLayout &&
    fragments.length === 0
  ) {
    return slots.contentBoundary({
      boundaryId: `pagination-row:${path}`,
      copyPolicy: 'model',
      mounted: false,
      reason: 'viewport-virtualization',
      renderPlaceholder: () => null,
      scope: { type: 'self' },
      selectionPolicy: 'skip',
    });
  }
  if (elementType === 'table-row') {
    return (
      <div
        {...attributes}
        data-pagination-row-index={path.split(',').at(-1)}
        data-testid="pagination-rich-table-row"
        style={{ display: 'flex', outline }}
      >
        {children}
      </div>
    );
  }
  if (elementType === 'table-cell') {
    return (
      <div
        {...attributes}
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
        {children}
      </div>
    );
  }
  if (elementType === 'table') {
    return (
      <div
        {...attributes}
        data-fragment-pages={fragments
          .map((fragment) => fragment.pageIndex)
          .join(',')}
        data-testid="pagination-rich-table"
        style={{ display: 'block', outline }}
      >
        {children}
      </div>
    );
  }
  if (isImageElement(element)) {
    return (
      <div
        {...attributes}
        data-testid="pagination-rich-image"
        style={{ outline, overflow: 'hidden' }}
      >
        {/* oxlint-disable-next-line nextjs/no-img-element -- The document node owns exact pagination dimensions. */}
        <img
          alt=""
          src={element.url}
          style={{
            display: 'block',
            height: '100%',
            objectFit: 'cover',
            width: '100%',
          }}
        />
        {children}
      </div>
    );
  }
  if (elementType === 'thematic-break') {
    return (
      <div
        {...attributes}
        data-testid="pagination-rich-thematic-break"
        style={{ outline }}
      >
        <hr
          style={{
            border: 0,
            borderTop: '2px solid #cbd5e1',
            margin: '11px 0 0',
          }}
        />
        {children}
      </div>
    );
  }
  if (isPaginationBlockFormat(elementType)) {
    const TextBlock = paginationTextBlockTags[elementType];
    const textStyle = paginationTextBlockStyles[elementType];

    return (
      <TextBlock
        {...attributes}
        style={{
          fontSize: textStyle.fontSize,
          fontWeight: textStyle.fontWeight,
          lineHeight: `${textStyle.lineHeight}px`,
          margin: 0,
          outline,
        }}
      >
        {children}
      </TextBlock>
    );
  }

  return (
    <div
      {...attributes}
      data-testid={
        elementType === 'code-block' ? 'pagination-rich-code-block' : undefined
      }
      style={{
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
        margin: 0,
        outline,
        paddingLeft: elementType === 'block-quote' ? 12 : undefined,
      }}
    >
      {children}
    </div>
  );
};

const renderPaginationLeaf = ({
  attributes,
  children,
  leaf,
}: RenderLeafProps) => (
  <span {...attributes} style={getPaginationLeafStyle(leaf)}>
    {children}
  </span>
);

type ElementSize = { height: number; width: number };

const useElementSize = <T extends HTMLElement>(): [
  RefObject<T | null>,
  ElementSize,
] => {
  const ref = useRef<T | null>(null);
  const [size, setSize] = useState<ElementSize>({ height: 0, width: 0 });

  useEffect(() => {
    const element = ref.current;
    if (!element) return undefined;
    const update = () => {
      const rect = element.getBoundingClientRect();
      setSize({ height: rect.height, width: rect.width });
    };
    const observer = new ResizeObserver(update);

    update();
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
  const editor = useEditorContext();
  const setSettings = useSetStateField(pageSettings);
  const [viewportRef, viewportSize] = useElementSize<HTMLDivElement>();
  const [editableRef, editableSize] = useElementSize<HTMLDivElement>();
  const layout = usePageLayout(editableRef);
  const blockCount = useEditorState((state) => state.children().length);
  const tableRowsEffectMounted = useRef(false);
  const stressPagesEffectMounted = useRef(false);
  const usesVirtualizedLayout = controls.renderingMode === 'virtualized';
  const effectiveStressPageCount = usesVirtualizedLayout
    ? controls.virtualizedStressPages
    : 0;
  const stressStartIndex = editor.read((state) =>
    state
      .children()
      .findIndex(
        (node) =>
          NodeApi.isElement(node) && node.paginationFixture === stressFixture
      )
  );
  const layoutEngine = useMemo(
    () =>
      createPretextPageLayoutEngine({
        estimateBlock:
          usesVirtualizedLayout && stressStartIndex >= 0
            ? ({ block }) => (block.path[0] ?? 0) >= stressStartIndex
            : undefined,
      }),
    [stressStartIndex, usesVirtualizedLayout]
  );
  const typography = useMemo(
    () =>
      ({
        block: ({ element }) => {
          const type = element.type as CustomElementType;
          const style = getPaginationTextBlockStyle(type);

          return {
            blockSpacing: type === 'table' ? 18 : style.blockSpacing,
            lineHeight: style.lineHeight,
          };
        },
        text: ({ element, leaf }) => ({
          font: getPaginationTextFont(element.type as CustomElementType, leaf),
          letterSpacing: 0,
        }),
      }) satisfies PageLayoutTypography<ElementOf<CustomEditor>>,
    []
  );
  const fragmentation = useMemo(
    () =>
      (({ content, element }) => {
        if (element.type === 'table') {
          return {
            sizes: element.children.map(() => ({
              height: controls.tableRowHeight,
              width: content.width,
            })),
            type: 'direct-children',
          };
        }
        if (element.type === 'image') {
          return {
            size: { height: controls.mediaHeight, width: content.width },
            type: 'atomic',
          };
        }
        if (element.type === 'thematic-break') {
          return {
            size: { height: 24, width: content.width },
            type: 'atomic',
          };
        }
        return element.type === 'code-block'
          ? { keepTogether: true, type: 'text' }
          : undefined;
      }) satisfies NodeFragmentationProvider<ElementOf<CustomEditor>>,
    [controls.mediaHeight, controls.tableRowHeight]
  );

  useEffect(() => {
    setSettings((previous) =>
      previous.margins === controls.margins &&
      previous.preset === controls.preset
        ? previous
        : { margins: controls.margins, preset: controls.preset }
    );
  }, [controls.margins, controls.preset, setSettings]);

  useEffect(() => {
    if (!tableRowsEffectMounted.current) {
      tableRowsEffectMounted.current = true;
      return;
    }
    editor.update((tx) => {
      const tableIndex = tx
        .children()
        .findIndex((node) => NodeApi.isElement(node) && node.type === 'table');
      const table = tx.children()[tableIndex];

      if (tableIndex === -1 || !NodeApi.isElement(table)) return;
      tx.selection.set(null);
      for (
        let index = table.children.length - 1;
        index >= controls.tableRows;
        index--
      ) {
        tx.nodes.remove({ at: [tableIndex, index] });
      }
      if (table.children.length < controls.tableRows) {
        tx.nodes.insert(
          createPaginationTableRows(controls.tableRows).slice(
            table.children.length
          ),
          { at: [tableIndex, table.children.length] }
        );
      }
    });
  }, [controls.tableRows, editor]);

  useEffect(() => {
    if (!stressPagesEffectMounted.current) {
      stressPagesEffectMounted.current = true;
      return;
    }
    editor.update((tx) => {
      const children = tx.children();
      const stressIndexes = children.flatMap((node, index) =>
        NodeApi.isElement(node) && node.paginationFixture === stressFixture
          ? [index]
          : []
      );
      const insertAt = children.length - stressIndexes.length;

      for (let index = stressIndexes.length - 1; index >= 0; index--) {
        tx.nodes.remove({ at: [stressIndexes[index]] });
      }
      const blocks = Array.from(
        { length: effectiveStressPageCount },
        (_, index) => createStressSection(index)
      ).flat();
      if (blocks.length > 0) tx.nodes.insert(blocks, { at: [insertAt] });
    });
  }, [editor, effectiveStressPageCount]);

  const renderElement = useCallback(
    (props: RenderElementProps) => (
      <PaginationElement
        {...props}
        debugFrames={controls.debugFrames}
        usesVirtualizedLayout={usesVirtualizedLayout}
      />
    ),
    [controls.debugFrames, usesVirtualizedLayout]
  );
  const onKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) =>
      handlePaginationKeyDown(editor, event),
    [editor]
  );
  const tablePageCount = new Set(
    layout?.fragments
      .filter((fragment) => fragment.type === 'direct-children')
      .map((fragment) => fragment.pageIndex)
  ).size;
  const canvasWidth = editableSize.width || layout?.pages[0]?.width || 0;
  const canvasHeight =
    editableSize.height ||
    (layout?.pages.reduce((height, page) => height + page.height, 0) ?? 0);
  const availableWidth = Math.max(
    0,
    viewportSize.width - PAGE_STACK_SAFE_INLINE * 2
  );
  const pageScale =
    canvasWidth > 0 && availableWidth > 0
      ? Math.min(1, availableWidth / canvasWidth)
      : 1;

  return (
    <div className="editor-pagination-shell">
      <PaginationControlsToolbar
        controls={controls}
        setControls={setControls}
      />
      <div className="editor-pagination-title-row">
        <div className="editor-pagination-title">Untitled document</div>
        <div className="editor-pagination-meta">
          pages {layout?.pages.length ?? 0} | rows {controls.tableRows} x{' '}
          {controls.tableRowHeight}px | table pages {tablePageCount} | stress
          pages {effectiveStressPageCount} | blocks {blockCount}
        </div>
      </div>
      <div
        className="editor-pagination-viewport"
        data-testid="pagination-viewport"
        ref={viewportRef}
      >
        <div className="editor-pagination-viewport-inner">
          <div
            style={{
              height: canvasHeight * pageScale,
              width: canvasWidth * pageScale,
            }}
          >
            <div
              className="editor-pagination-scaled-surface"
              style={{ transform: `scale(${pageScale})`, width: canvasWidth }}
            >
              <PagedEditable
                className="editor-pagination-editor"
                engine={layoutEngine}
                fragmentation={fragmentation}
                onKeyDown={onKeyDown}
                page={pageSettings}
                pageView={{ gap: PAGE_GAP, mode: controls.pageLayoutMode }}
                ref={editableRef}
                renderElement={renderElement}
                renderLeaf={renderPaginationLeaf}
                renderPage={({ attributes, page: currentPage }) => (
                  <div
                    {...attributes}
                    className={cn(
                      'editor-pagination-page',
                      controls.debugFrames && 'editor-pagination-page-debug'
                    )}
                    style={{ ...attributes.style }}
                  >
                    {controls.debugFrames && (
                      <>
                        <div
                          className="editor-pagination-content-frame"
                          data-testid="pagination-content-frame"
                          style={{
                            height: currentPage.content.height,
                            left: currentPage.content.left,
                            top: currentPage.content.top,
                            width: currentPage.content.width,
                          }}
                        />
                        <div className="editor-pagination-page-label">
                          page {currentPage.index + 1} | {currentPage.width}x
                          {currentPage.height}px
                        </div>
                      </>
                    )}
                  </div>
                )}
                spellCheck
                typography={typography}
                virtualize={usesVirtualizedLayout}
              />
            </div>
          </div>
        </div>
      </div>
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
    controls.renderingMode === 'virtualized'
      ? controls.virtualizedStressPages
      : 0;
  const editor = useEditor({
    initialValue: {
      children: createInitialValue({
        stressPages: initialStressPages,
        tableRows: controls.tableRows,
      }),
      meta: {
        [pageSettings.key]: pageSettings.serialize({
          margins: controls.margins,
          preset: controls.preset,
        }),
      },
    },
    plugins: [history(), pageSettingsPlugin],
  });

  return (
    <EditorRoot editor={editor}>
      <PaginationSurface controls={controls} setControls={setControls} />
    </EditorRoot>
  );
};

const PaginationExample = () => {
  const [controls, setControls] = useQueryStates(paginationControlParsers, {
    ...replaceQueryOptions,
    urlKeys: paginationControlUrlKeys,
  });

  return <PaginationEditor controls={controls} setControls={setControls} />;
};

export default PaginationExample;
