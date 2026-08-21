'use client';

import {
  FootnotePlugin,
  FootnoteDefinitionPlugin,
  FootnoteInputPlugin,
} from '@platejs/footnote/react';
import { PathApi, type Path } from 'platejs';
import {
  type PlateEditor,
  type PlateElementProps,
  PlateElement,
  useEditor,
  useEditorFocused,
  useEditorPlugin,
  useEditorSelector,
  useElementSelected,
  useNavigationHighlight,
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
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import {
  InlineCombobox,
  InlineComboboxContent,
  InlineComboboxEmpty,
  InlineComboboxGroup,
  InlineComboboxInput,
  InlineComboboxItem,
} from '@/registry/components/editor/inline-combobox';

const NUMERIC_FOOTNOTE_QUERY = /^\d+$/;

const getNavigationAttributes = (
  attributes: PlateElementProps<typeof FootnotePlugin>['attributes'],
  navigationHighlight: ReturnType<typeof useNavigationHighlight>
) => ({
  ...attributes,
  'data-nav-cycle': navigationHighlight
    ? String(navigationHighlight.cycle)
    : undefined,
  'data-nav-highlight': navigationHighlight?.variant,
  'data-nav-pulse': navigationHighlight
    ? String(navigationHighlight.pulse)
    : undefined,
  'data-nav-target': navigationHighlight ? 'true' : undefined,
  style: {
    ...(attributes.style as React.CSSProperties | undefined),
    ['--plate-nav-feedback-duration' as const]: navigationHighlight
      ? `${navigationHighlight.duration}ms`
      : undefined,
  } as React.CSSProperties,
});

const getFootnotePreviewLabel = (text?: string) => {
  const normalized = text?.replace(/\s+/g, ' ').trim();

  if (!normalized) return 'Empty footnote';

  return normalized.length > 48
    ? `${normalized.slice(0, 45).trimEnd()}...`
    : normalized;
};

const getReferenceContextLabel = (
  editor: PlateEditor,
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
  props: PlateElementProps<typeof FootnotePlugin>
) {
  const { element, path } = props;
  const { read: footnoteApi, update: footnoteUpdate } =
    useEditorPlugin(FootnotePlugin);
  const ref = element.ref ?? '';
  const [hoverOpen, setHoverOpen] = React.useState(false);
  const focused = useEditorFocused();
  const navigationHighlight = useNavigationHighlight(path);
  const fallbackResolved =
    ref && footnoteApi ? footnoteApi.isResolved({ ref }) : false;
  const fallbackPreviewText =
    ref && footnoteApi ? footnoteApi.definitionText({ ref }) : undefined;
  const livePreview = useEditorSelector(() => {
    if (!hoverOpen || !ref) return null;

    return {
      isResolved: footnoteApi.isResolved({ ref }),
      previewText: footnoteApi.definitionText({ ref }),
    };
  });
  const isResolved = livePreview?.isResolved ?? fallbackResolved;
  const previewText = livePreview?.previewText ?? fallbackPreviewText;
  const selected = useElementSelected();
  const isSelectionInsideAtom = useEditorSelector((currentEditor) => {
    const selection = currentEditor.read.selection();

    if (!path || !selection) return false;

    return (
      PathApi.equals(selection.anchor.path, path.concat([0])) &&
      PathApi.equals(selection.focus.path, path.concat([0])) &&
      selection.anchor.offset === selection.focus.offset
    );
  });

  return (
    <PlateElement
      {...props}
      as="sup"
      className="group/footnote-ref mx-0.5 align-super"
      attributes={{
        ...getNavigationAttributes(props.attributes, navigationHighlight),
        contentEditable: false,
        draggable: true,
      }}
    >
      {props.children}
      <HoverCard open={hoverOpen} onOpenChange={setHoverOpen} openDelay={150}>
        <HoverCardTrigger asChild>
          <button
            type="button"
            className={cn(
              'cursor-pointer rounded-xs font-medium text-primary text-xs focus:ring-2 focus:ring-ring focus:ring-offset-1 group-data-[nav-target=true]/footnote-ref:bg-(--color-highlight)',
              (selected && focused) || isSelectionInsideAtom
                ? 'ring-2 ring-ring ring-offset-1'
                : null
            )}
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
            }}
            onMouseDown={(event) => {
              if (event.metaKey || event.ctrlKey) {
                event.preventDefault();
                event.stopPropagation();
                if (isResolved) {
                  footnoteUpdate.focusDefinition({ ref });

                  return;
                }

                footnoteUpdate.createDefinition({ ref });
              }
            }}
          >
            [{ref}]
          </button>
        </HoverCardTrigger>
        {previewText ? (
          <HoverCardContent className="w-80">
            <div className="space-y-1">
              <div className="text-sm leading-relaxed text-muted-foreground">
                {previewText}
              </div>
            </div>
          </HoverCardContent>
        ) : ref ? (
          <HoverCardContent className="w-80">
            <div className="space-y-2">
              {isResolved ? (
                <div className="text-sm leading-relaxed">
                  No preview available.
                </div>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-6 rounded-xs px-2 text-[11px]"
                  onMouseDown={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    footnoteUpdate.createDefinition({ ref });
                    setHoverOpen(false);
                  }}
                >
                  Create definition for [^{ref}]
                </Button>
              )}
            </div>
          </HoverCardContent>
        ) : null}
      </HoverCard>
    </PlateElement>
  );
}

export function FootnoteDefinitionElement(
  props: PlateElementProps<typeof FootnoteDefinitionPlugin>
) {
  const { element, path } = props;
  const editor = useEditor();
  const { read: footnoteApi, update: footnoteUpdate } =
    useEditorPlugin(FootnotePlugin);
  const ref = element.ref ?? '';
  const definitionState = useEditorSelector(() => {
    const isDuplicateDefinition =
      !!path && !!footnoteApi.isDuplicateDefinition?.({ path });
    const referenceItems =
      !isDuplicateDefinition && ref
        ? footnoteApi.references({ ref }).map((entry, index) => ({
            index,
            label: getReferenceContextLabel(editor, entry[1], index),
          }))
        : [];

    return {
      duplicateReplacementRef: isDuplicateDefinition
        ? footnoteApi.nextRef?.()
        : undefined,
      isDuplicateDefinition,
      path,
      referenceItems,
    };
  });
  const navigationHighlight = useNavigationHighlight(definitionState?.path);
  const isDuplicateDefinition = !!definitionState?.isDuplicateDefinition;
  const duplicateReplacementRef = definitionState?.duplicateReplacementRef;
  const [referencePickerOpen, setReferencePickerOpen] = React.useState(false);
  const referenceItems = definitionState?.referenceItems ?? [];
  const hasMultipleReferences = referenceItems.length > 1;

  return (
    <PlateElement
      {...props}
      className={cn(
        'mt-1.5 flex items-start gap-1.5 data-[nav-target=true]:rounded-md data-[nav-target=true]:bg-(--color-highlight)',
        isDuplicateDefinition &&
          'rounded-md border border-amber-500/30 bg-amber-500/5 px-2 py-2'
      )}
      attributes={getNavigationAttributes(
        props.attributes,
        navigationHighlight
      )}
    >
      <div contentEditable={false}>
        {isDuplicateDefinition ? (
          <div className="min-w-3 text-xs text-amber-700 tabular-nums">
            {ref}
          </div>
        ) : (
          <Popover
            open={referencePickerOpen}
            onOpenChange={setReferencePickerOpen}
          >
            <PopoverAnchor asChild>
              <button
                type="button"
                aria-expanded={
                  hasMultipleReferences ? referencePickerOpen : undefined
                }
                aria-haspopup={hasMultipleReferences ? 'dialog' : undefined}
                aria-label={`Back to reference ${ref}`}
                className="min-w-3 cursor-pointer rounded-xs text-xs text-muted-foreground tabular-nums underline-offset-2 hover:text-foreground focus:ring-2 focus:ring-ring focus:ring-offset-1"
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                }}
                onMouseDown={(event) => {
                  event.preventDefault();
                  event.stopPropagation();

                  if (hasMultipleReferences) {
                    setReferencePickerOpen((open) => !open);

                    return;
                  }

                  footnoteUpdate.focusReference({ ref });
                }}
              >
                {ref}
              </button>
            </PopoverAnchor>

            {hasMultipleReferences && referencePickerOpen ? (
              <PopoverContent
                className="w-72 p-0"
                align="start"
                sideOffset={8}
                onCloseAutoFocus={(event) => event.preventDefault()}
                onOpenAutoFocus={(event) => event.preventDefault()}
              >
                <Command>
                  <CommandList>
                    <CommandGroup>
                      {referenceItems.map(
                        (item: { index: number; label: string }) => (
                          <CommandItem
                            key={`${ref}-${item.index}`}
                            className="cursor-pointer gap-2"
                            onMouseDown={(event) => event.preventDefault()}
                            onSelect={() => {
                              setReferencePickerOpen(false);
                              footnoteUpdate.focusReference({
                                ref,
                                index: item.index,
                              });
                            }}
                          >
                            <span className="font-mono text-xs text-muted-foreground">
                              {item.index + 1}
                            </span>
                            <span className="truncate">{item.label}</span>
                          </CommandItem>
                        )
                      )}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            ) : null}
          </Popover>
        )}
      </div>
      <div className="min-w-0 flex-1">
        {isDuplicateDefinition ? (
          <div
            contentEditable={false}
            className="mb-2 flex flex-wrap items-center gap-2"
          >
            {duplicateReplacementRef && path ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-6 rounded-xs border-amber-500/40 px-2 text-[11px] text-amber-700 hover:bg-amber-500/10 hover:text-amber-800"
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                }}
                onMouseDown={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  footnoteUpdate.normalizeDuplicateDefinition({
                    ref: duplicateReplacementRef,
                    path,
                  });
                }}
              >
                Renumber to [^{duplicateReplacementRef}]
              </Button>
            ) : null}
          </div>
        ) : null}
        {props.children}
      </div>
    </PlateElement>
  );
}

export function FootnoteInputElement(
  props: PlateElementProps<typeof FootnoteInputPlugin>
) {
  const { element } = props;
  const { read: footnoteApi, update: footnoteUpdate } =
    useEditorPlugin(FootnotePlugin);
  const [search, setSearch] = React.useState('');

  const refs = footnoteApi.refs?.() ?? [];
  const nextRef = footnoteApi.nextRef?.() ?? '1';
  const query = search.trim();
  const numericQuery = NUMERIC_FOOTNOTE_QUERY.test(query) ? query : '';
  const proposedRef = numericQuery || nextRef;
  const showCreateOption = !refs.includes(proposedRef);

  const filteredRefs = refs.filter((ref: string) => {
    if (!query) return true;

    const preview = footnoteApi.definitionText?.({ ref }) ?? '';

    return (
      ref.includes(query) || preview.toLowerCase().includes(query.toLowerCase())
    );
  });

  const insertSelectedFootnote = React.useCallback(
    (ref: string) => {
      footnoteUpdate.insert({
        focusDefinition: false,
        ref,
        trigger: '[',
      });
    },
    [footnoteUpdate]
  );

  return (
    <PlateElement {...props} as="span">
      <InlineCombobox
        value={search}
        element={element}
        filter={false}
        setValue={setSearch}
        trigger="^"
      >
        <InlineComboboxInput className="min-w-[1ch]" />

        <InlineComboboxContent className="my-1.5 w-72">
          {showCreateOption || filteredRefs.length > 0 ? null : (
            <InlineComboboxEmpty>No footnotes</InlineComboboxEmpty>
          )}

          <InlineComboboxGroup>
            {showCreateOption && (!query || numericQuery) ? (
              <InlineComboboxItem
                value={`new-${proposedRef}`}
                onClick={() => insertSelectedFootnote(proposedRef)}
              >
                <span className="flex min-w-0 items-center gap-1.5 whitespace-nowrap">
                  <span className="font-mono text-muted-foreground">
                    [^{proposedRef}]
                  </span>
                  <span className="truncate">: New footnote...</span>
                </span>
              </InlineComboboxItem>
            ) : null}

            {filteredRefs.map((ref: string) => (
              <InlineComboboxItem
                key={ref}
                value={`footnote-${ref}`}
                onClick={() => insertSelectedFootnote(ref)}
              >
                <span className="flex min-w-0 items-center gap-1.5 whitespace-nowrap">
                  <span className="font-mono text-muted-foreground">
                    [^{ref}]
                  </span>
                  <span className="truncate">
                    :{' '}
                    {getFootnotePreviewLabel(
                      footnoteApi.definitionText?.({ ref })
                    )}
                  </span>
                </span>
              </InlineComboboxItem>
            ))}
          </InlineComboboxGroup>
        </InlineComboboxContent>
      </InlineCombobox>

      {props.children}
    </PlateElement>
  );
}

export const FootnoteKit = [
  FootnoteInputPlugin.configure({ component: FootnoteInputElement }),
  FootnotePlugin.configure({ component: FootnoteReferenceElement }),
  FootnoteDefinitionPlugin.configure({ component: FootnoteDefinitionElement }),
];
