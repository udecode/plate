'use client';

import { cn } from 'cn';
import { NodeApi, PathApi, type Element, type Path } from 'platejs';
import {
  FootnotePlugin,
  FootnoteDefinitionPlugin,
} from 'platejs/footnote/react';
import { BaseLockPlugin } from 'platejs/lock';
import {
  type EditableSiblingProps,
  type Editor,
  type EditorElementProps,
  EditorElement,
  useEditor,
  useEditorFocused,
  useEditorReadOnly,
  useEditorSelector,
  useElementSelected,
  usePath,
} from 'platejs/react';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  FloatingPopover,
  FloatingPopoverAnchor,
  FloatingPopoverContent,
} from '@/registry/components/editor/floating-popover';
import {
  InlineCombobox,
  InlineComboboxContent,
  InlineComboboxEmpty,
  InlineComboboxGroup,
  InlineComboboxItem,
  useInlineComboboxQuery,
} from '@/registry/components/editor/inline-combobox';

// Markdown keeps these labels byte for byte up to CommonMark's 999-char limit;
// `&`, `;`, spaces, or longer labels turn into entities or plain text on parse.
const CREATABLE_FOOTNOTE_REF = /^[A-Za-z0-9_-]{1,999}$/;
// Footnote reads depend on the document and on which suggestions the view
// shows, never on the selection.
const FOOTNOTE_DEPENDENCIES = ['document', 'authored'] as const;
const HOVER_OPEN_DELAY = 150;
const HOVER_CLOSE_DELAY = 200;

type FootnoteOptions = Readonly<{
  footnotes: ReadonlyArray<Readonly<{ ref: string; text?: string }>>;
  nextRef: string;
}>;

type FootnoteDefinitionState = Readonly<{
  duplicateReplacementRef?: string;
  isDuplicateDefinition: boolean;
  referenceCount: number;
}>;

type ReferenceItem = Readonly<{ index: number; label: string }>;

const CLOSED_REFERENCE_ITEMS: readonly ReferenceItem[] = [];

const sameDefinitionState = (
  left: FootnoteDefinitionState | null,
  right: FootnoteDefinitionState
) =>
  left?.duplicateReplacementRef === right.duplicateReplacementRef &&
  left.isDuplicateDefinition === right.isDuplicateDefinition &&
  left.referenceCount === right.referenceCount;

const sameReferenceItems = (
  left: readonly ReferenceItem[] | null,
  right: readonly ReferenceItem[]
) =>
  left !== null &&
  left.length === right.length &&
  left.every(
    (item, index) =>
      item.index === right[index].index && item.label === right[index].label
  );

const sameOptions = (left: FootnoteOptions | null, right: FootnoteOptions) =>
  left?.nextRef === right.nextRef &&
  left.footnotes.length === right.footnotes.length &&
  left.footnotes.every(
    (footnote, index) =>
      footnote.ref === right.footnotes[index].ref &&
      footnote.text === right.footnotes[index].text
  );

const focusFootnoteControl = (editor: Editor, path?: Path) => {
  const key = path && editor.key(path);

  if (key) {
    editor.api.dom
      .resolveDOMNode(key)
      ?.querySelector<HTMLButtonElement>('button')
      ?.focus({ preventScroll: true });
  }
};

const isPathLocked = (editor: Editor, path?: Path) => {
  const lock = editor.plugin(BaseLockPlugin);

  return Boolean(path && lock.installed && lock.read.isLocked(path));
};

const getDefinitionPreviewText = (entry?: readonly [Element, Path]) =>
  entry
    ? entry[0].children
        .map((child) => NodeApi.string(child))
        .filter((line) => line.length > 0)
        .join(' ')
    : undefined;

const getFootnotePreviewLabel = (text?: string) => {
  const normalized = text?.replace(/\s+/g, ' ').trim();

  if (!normalized) return 'Empty footnote';

  return normalized.length > 48
    ? `${normalized.slice(0, 45).trimEnd()}...`
    : normalized;
};

const getReferenceContextLabel = (
  editor: Editor,
  path: Path,
  index: number
) => {
  const parentEntry = editor.read.nodes.parent(path);
  const fallback = `Reference ${index + 1}`;

  if (!parentEntry) return fallback;

  const text = editor.read.text.string(parentEntry[1]);
  const normalized = text.replace(/\s+/g, ' ').trim();

  if (!normalized) return fallback;

  return normalized.length > 56
    ? `${normalized.slice(0, 53).trimEnd()}...`
    : normalized;
};

export function FootnoteReferenceElement(
  props: EditorElementProps<typeof FootnotePlugin>
) {
  const { element } = props;
  const path = usePath();
  const editor = useEditor();
  const readOnly = useEditorReadOnly();
  const focused = useEditorFocused();
  const selected = useElementSelected({ mode: 'text' });
  const footnote = editor.plugin(FootnotePlugin);
  const ref = element.ref ?? '';
  const [anchor, setAnchor] = React.useState<HTMLButtonElement | null>(null);
  // `hover` closes when the pointer leaves; `pointer` and `keyboard` stay open
  // until dismissed, and `keyboard` moves focus into the card.
  const [openedBy, setOpenedBy] = React.useState<
    'hover' | 'keyboard' | 'pointer' | null
  >(null);
  const hoverTimer = React.useRef<ReturnType<typeof setTimeout>>(undefined);
  const returnFocus = React.useRef(false);
  const cardActionRef = React.useRef<HTMLButtonElement | null>(null);
  const open = openedBy !== null;
  const isResolved = useEditorSelector(
    () => Boolean(ref && footnote.read.definition({ ref })),
    { dependsOn: FOOTNOTE_DEPENDENCIES }
  );
  const previewText = useEditorSelector(
    () =>
      open && ref
        ? getDefinitionPreviewText(footnote.read.definition({ ref }))
        : undefined,
    { dependsOn: FOOTNOTE_DEPENDENCIES }
  );
  const locked = useEditorSelector(
    (current) => open && !readOnly && isPathLocked(current, path),
    { dependsOn: ['document', 'state'] }
  );
  const isSelectionInsideAtom = useEditorSelector(
    (current) => {
      const selection = current.read.selection();

      if (!path || !selection) return false;

      return (
        PathApi.equals(selection.anchor.path, path.concat([0])) &&
        PathApi.equals(selection.focus.path, path.concat([0])) &&
        selection.anchor.offset === selection.focus.offset
      );
    },
    { dependsOn: 'selection' }
  );

  React.useEffect(() => () => clearTimeout(hoverTimer.current), []);

  React.useEffect(() => {
    if (openedBy === 'keyboard') {
      cardActionRef.current?.focus({ preventScroll: true });
    }
  }, [openedBy]);

  const scheduleHover = (next: 'hover' | null) => {
    clearTimeout(hoverTimer.current);
    hoverTimer.current = setTimeout(
      () =>
        setOpenedBy((current) =>
          next ? (current ?? next) : current === 'hover' ? null : current
        ),
      next ? HOVER_OPEN_DELAY : HOVER_CLOSE_DELAY
    );
  };
  const onHoverStart = (event: React.PointerEvent) => {
    if (event.pointerType === 'mouse') scheduleHover('hover');
  };
  const onHoverEnd = (event: React.PointerEvent) => {
    if (event.pointerType === 'mouse') scheduleHover(null);
  };
  const close = () => {
    clearTimeout(hoverTimer.current);
    setOpenedBy(null);
  };
  const jumpToDefinition = () => {
    close();

    if (!footnote.read.definition({ ref })) {
      if (readOnly || isPathLocked(editor, path)) return false;

      footnote.update.createDefinition({ focus: false, ref });
    }

    return footnote.api.focusDefinition({ ref });
  };

  return (
    <EditorElement
      {...props}
      as="sup"
      className="group/footnote-ref mx-0.5 align-super"
      attributes={{
        ...props.attributes,
        contentEditable: false,
        draggable: true,
      }}
    >
      {props.children}
      <FloatingPopover
        insideElement={anchor}
        open={open}
        onOpenChange={(next) => {
          if (!next) close();
        }}
      >
        <FloatingPopoverAnchor
          element={
            <button
              ref={setAnchor}
              type="button"
              aria-expanded={readOnly ? undefined : open}
              aria-haspopup={readOnly ? undefined : 'dialog'}
              data-slot="footnote-reference"
              data-state={isResolved ? 'resolved' : 'unresolved'}
              className={cn(
                'cursor-pointer rounded-xs px-0.5 font-medium text-primary text-xs focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 group-data-[nav-target=true]/footnote-ref:bg-highlight/30',
                'data-[state=unresolved]:border data-[state=unresolved]:border-amber-500/60 data-[state=unresolved]:border-dashed data-[state=unresolved]:bg-amber-500/10 data-[state=unresolved]:text-amber-700 dark:data-[state=unresolved]:text-amber-300',
                ((selected && focused) || isSelectionInsideAtom) &&
                  'ring-2 ring-ring ring-offset-1'
              )}
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();

                // Mod+click already jumped on mousedown.
                if (!readOnly && (event.metaKey || event.ctrlKey)) return;
                if (readOnly) {
                  if (footnote.read.definition({ ref }) && jumpToDefinition()) {
                    focusFootnoteControl(
                      editor,
                      footnote.read.definition({ ref })?.[1]
                    );
                  }

                  return;
                }

                clearTimeout(hoverTimer.current);
                // A keyboard press reports no clicks in `detail`.
                const source = event.detail === 0 ? 'keyboard' : 'pointer';

                setOpenedBy((current) =>
                  current && current !== 'hover' ? null : source
                );
              }}
              onKeyDown={(event) => {
                // The button handles its own activation keys; the editor
                // must not split or type around the reference.
                if (event.key === 'Enter' || event.key === ' ') {
                  event.stopPropagation();
                }
              }}
              onMouseDown={(event) => {
                if (readOnly || !(event.metaKey || event.ctrlKey)) return;

                event.preventDefault();
                event.stopPropagation();
                jumpToDefinition();
              }}
              onPointerEnter={onHoverStart}
              onPointerLeave={onHoverEnd}
            >
              [{ref}]
            </button>
          }
        />

        {open && ref ? (
          <FloatingPopoverContent
            aria-label={`Footnote [^${ref}]`}
            className="w-80 p-3"
            align="start"
            data-slot="footnote-preview"
            data-state={isResolved ? 'resolved' : 'unresolved'}
            sideOffset={6}
            onEscapeKeyDown={() => {
              const shouldReturn = openedBy === 'keyboard';
              returnFocus.current = shouldReturn;
              if (shouldReturn) {
                requestAnimationFrame(() =>
                  anchor?.focus({ preventScroll: true })
                );
              }
            }}
            onFinalFocus={(event) => {
              // Only Escape hands focus back to the chip; a jump has already
              // moved it to the definition.
              if (!returnFocus.current) event.preventDefault();
              returnFocus.current = false;
            }}
            onInitialFocus={(event) => {
              if (openedBy !== 'keyboard') event.preventDefault();
            }}
            onPointerEnter={onHoverStart}
            onPointerLeave={onHoverEnd}
          >
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="rounded-xs bg-muted px-1.5 py-0.5 font-mono text-xs text-muted-foreground">
                  [^{ref}]
                </span>
                {isResolved ? null : (
                  <span className="text-xs font-medium text-amber-700 dark:text-amber-300">
                    No definition
                  </span>
                )}
              </div>
              <p className="line-clamp-6 text-sm leading-relaxed text-muted-foreground">
                {isResolved
                  ? previewText || 'This footnote is empty.'
                  : 'Nothing defines this reference yet.'}
              </p>
              {readOnly ? null : (
                <div className="flex items-center justify-between gap-3">
                  <Button
                    ref={cardActionRef}
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-7 px-2 text-xs"
                    disabled={!isResolved && locked}
                    onClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      jumpToDefinition();
                    }}
                    onMouseDown={(event) => {
                      event.preventDefault();
                    }}
                  >
                    {isResolved ? 'Go to footnote' : 'Create definition'}
                  </Button>
                  <span className="text-xs text-muted-foreground">
                    <kbd className="font-sans">⌘/Ctrl</kbd>+click
                  </span>
                </div>
              )}
            </div>
          </FloatingPopoverContent>
        ) : null}
      </FloatingPopover>
    </EditorElement>
  );
}

export function FootnoteDefinitionElement(
  props: EditorElementProps<typeof FootnoteDefinitionPlugin>
) {
  const { element } = props;
  const path = usePath();
  const editor = useEditor();
  const readOnly = useEditorReadOnly();
  const footnote = editor.plugin(FootnotePlugin);
  const ref = element.ref ?? '';
  const [referencePickerOpen, setReferencePickerOpen] = React.useState(false);
  // Pointer opens keep the caret in the editor; keyboard opens and Escape
  // move focus so arrow keys reach the picker.
  const pickerFocus = React.useRef({ initial: false, final: false });
  const backlinkRef = React.useRef<HTMLButtonElement | null>(null);
  const { duplicateReplacementRef, isDuplicateDefinition, referenceCount } =
    useEditorSelector<FootnoteDefinitionState>(
      () => {
        const isDuplicate =
          !!path && footnote.read.isDuplicateDefinition({ path });

        return {
          duplicateReplacementRef: isDuplicate
            ? footnote.read.nextRef()
            : undefined,
          isDuplicateDefinition: isDuplicate,
          referenceCount:
            !isDuplicate && ref ? footnote.read.references({ ref }).length : 0,
        };
      },
      { dependsOn: FOOTNOTE_DEPENDENCIES, equalityFn: sameDefinitionState }
    );
  const hasMultipleReferences = referenceCount > 1;
  const renumberLocked = useEditorSelector(
    (current) =>
      isDuplicateDefinition && !readOnly && isPathLocked(current, path),
    { dependsOn: ['document', 'state'] }
  );
  const referenceItems = useEditorSelector<readonly ReferenceItem[]>(
    (current) =>
      referencePickerOpen && !isDuplicateDefinition && ref
        ? footnote.read.references({ ref }).map((entry, index) => ({
            index,
            label: getReferenceContextLabel(current, entry[1], index),
          }))
        : CLOSED_REFERENCE_ITEMS,
    { dependsOn: FOOTNOTE_DEPENDENCIES, equalityFn: sameReferenceItems }
  );
  const focusReference = (index = 0) => {
    if (footnote.api.focusReference({ ref, index }) && readOnly) {
      focusFootnoteControl(
        editor,
        footnote.read.references({ ref })[index]?.[1]
      );
    }
  };

  return (
    <EditorElement
      {...props}
      className={cn(
        'mt-1.5 flex items-start gap-1.5 data-[nav-target=true]:rounded-md data-[nav-target=true]:bg-highlight/30',
        isDuplicateDefinition &&
          'rounded-md border border-amber-500/30 bg-amber-500/5 px-2 py-2'
      )}
    >
      <div contentEditable={false}>
        {isDuplicateDefinition ? (
          <span className="min-w-3 text-xs text-amber-700 tabular-nums dark:text-amber-300">
            {ref}
          </span>
        ) : referenceCount === 0 ? (
          <span
            data-slot="footnote-definition-label"
            data-state="uncited"
            className="min-w-3 text-xs text-muted-foreground/70 tabular-nums"
            title="No reference cites this footnote"
          >
            {ref}
          </span>
        ) : (
          <FloatingPopover
            open={referencePickerOpen}
            onOpenChange={setReferencePickerOpen}
          >
            <FloatingPopoverAnchor
              element={
                <button
                  ref={backlinkRef}
                  type="button"
                  aria-expanded={
                    hasMultipleReferences ? referencePickerOpen : undefined
                  }
                  aria-haspopup={hasMultipleReferences ? 'dialog' : undefined}
                  aria-label={`Back to reference ${ref}`}
                  data-slot="footnote-backlink"
                  className="min-w-3 cursor-pointer rounded-xs text-xs text-muted-foreground tabular-nums underline-offset-2 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();

                    if (hasMultipleReferences) {
                      pickerFocus.current.initial =
                        readOnly || event.detail === 0;
                      setReferencePickerOpen((open) => !open);

                      return;
                    }

                    focusReference();
                  }}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.stopPropagation();
                    }
                  }}
                  onMouseDown={(event) => {
                    if (!readOnly) event.preventDefault();
                  }}
                >
                  {ref}
                </button>
              }
            />

            {hasMultipleReferences && referencePickerOpen ? (
              <FloatingPopoverContent
                aria-label={`References to footnote ${ref}`}
                className="w-72 p-0"
                align="start"
                sideOffset={8}
                onEscapeKeyDown={() => {
                  pickerFocus.current.final = true;
                  requestAnimationFrame(() =>
                    backlinkRef.current?.focus({ preventScroll: true })
                  );
                }}
                onFinalFocus={(event) => {
                  if (!pickerFocus.current.final) event.preventDefault();
                  pickerFocus.current.final = false;
                }}
                onInitialFocus={(event) => {
                  if (!pickerFocus.current.initial) event.preventDefault();
                }}
              >
                <Command tabIndex={0}>
                  <CommandList>
                    <CommandGroup>
                      {referenceItems.map((item) => (
                        <CommandItem
                          key={`${ref}-${item.index}`}
                          className="cursor-pointer gap-2"
                          onMouseDown={(event) => {
                            event.preventDefault();
                          }}
                          onSelect={() => {
                            setReferencePickerOpen(false);
                            focusReference(item.index);
                          }}
                        >
                          <span className="font-mono text-xs text-muted-foreground">
                            {item.index + 1}
                          </span>
                          <span className="truncate">{item.label}</span>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </FloatingPopoverContent>
            ) : null}
          </FloatingPopover>
        )}
      </div>
      <div className="min-w-0 flex-1">
        {isDuplicateDefinition ? (
          <div
            contentEditable={false}
            className="mb-2 flex flex-wrap items-center gap-2"
          >
            <span
              data-slot="footnote-duplicate-badge"
              className="rounded-xs border border-amber-500/40 bg-amber-500/10 px-1 text-[10px] leading-4 font-medium tracking-wide text-amber-700 uppercase dark:text-amber-300"
            >
              Duplicate
            </span>
            {!readOnly && duplicateReplacementRef && path ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-6 rounded-xs border-amber-500/40 px-2 text-[11px] text-amber-700 hover:bg-amber-500/10 hover:text-amber-800 dark:text-amber-300 dark:hover:text-amber-200"
                disabled={renumberLocked}
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  footnote.update.normalizeDuplicateDefinition({
                    ref: duplicateReplacementRef,
                    path,
                  });
                }}
                onMouseDown={(event) => {
                  event.preventDefault();
                }}
              >
                Renumber to [^{duplicateReplacementRef}]
              </Button>
            ) : null}
          </div>
        ) : null}
        {props.children}
      </div>
    </EditorElement>
  );
}

export function FootnoteCombobox({ editableRef }: EditableSiblingProps) {
  return (
    <InlineCombobox
      editableRef={editableRef}
      trigger="[^"
      triggerPreviousCharPattern={null}
    >
      <FootnoteComboboxContent />
    </InlineCombobox>
  );
}

function FootnoteComboboxContent() {
  const { read: footnoteApi } = useEditor().plugin(FootnotePlugin);
  const query = useInlineComboboxQuery().trim();
  const { footnotes, nextRef } = useEditorSelector<FootnoteOptions>(
    () => ({
      footnotes: footnoteApi.refs().map((ref) => ({
        ref,
        text: getDefinitionPreviewText(footnoteApi.definition({ ref })),
      })),
      nextRef: footnoteApi.nextRef(),
    }),
    { dependsOn: FOOTNOTE_DEPENDENCIES, equalityFn: sameOptions }
  );
  const createdRef = CREATABLE_FOOTNOTE_REF.test(query) ? query : '';
  const proposedRef = createdRef || nextRef;
  const lowerQuery = query.toLowerCase();
  // Markdown matches labels case-insensitively, so `alpha` and `Alpha` are one
  // footnote.
  const showCreateOption =
    (!query || Boolean(createdRef)) &&
    !footnotes.some(
      ({ ref }) => ref.toLowerCase() === proposedRef.toLowerCase()
    );
  const filteredFootnotes = footnotes.filter(
    ({ ref, text = '' }) =>
      !query ||
      ref.toLowerCase().includes(lowerQuery) ||
      text.toLowerCase().includes(lowerQuery)
  );

  return (
    <InlineComboboxContent className="my-1.5 w-72">
      <InlineComboboxEmpty>No footnotes</InlineComboboxEmpty>

      <InlineComboboxGroup>
        {showCreateOption ? (
          <InlineComboboxItem
            onSelect={(tx) => {
              if (
                createdRef &&
                tx
                  .plugin(FootnotePlugin)
                  .refs()
                  .some((existing) => existing.toLowerCase() === lowerQuery)
              ) {
                return false;
              }

              tx.plugin(FootnotePlugin).insert({
                focusDefinition: false,
                ...(createdRef ? { ref: createdRef } : {}),
              });
              return undefined;
            }}
          >
            <span className="flex min-w-0 items-center gap-1.5 whitespace-nowrap">
              <span className="font-mono text-muted-foreground">
                [^{proposedRef}]
              </span>
              <span className="truncate">: New footnote...</span>
            </span>
          </InlineComboboxItem>
        ) : null}

        {filteredFootnotes.map(({ ref, text }) => (
          <InlineComboboxItem
            key={ref}
            onSelect={(tx) => {
              tx.plugin(FootnotePlugin).insert({ focusDefinition: false, ref });
            }}
          >
            <span className="flex min-w-0 items-center gap-1.5 whitespace-nowrap">
              <span className="font-mono text-muted-foreground">[^{ref}]</span>
              <span className="truncate">
                : {getFootnotePreviewLabel(text)}
              </span>
            </span>
          </InlineComboboxItem>
        ))}
      </InlineComboboxGroup>
    </InlineComboboxContent>
  );
}

export const FootnoteKit = [
  FootnotePlugin.configure({
    component: FootnoteReferenceElement,
    slots: { afterEditable: FootnoteCombobox },
  }),
  FootnoteDefinitionPlugin.configure({ component: FootnoteDefinitionElement }),
];
