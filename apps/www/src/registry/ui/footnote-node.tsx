'use client';

import * as React from 'react';

import type { TFootnoteElement } from '@platejs/footnote';
import { PathApi, type Path } from 'platejs';
import { FootnoteReferencePlugin } from '@platejs/footnote/react';
import type { PlateEditor, PlateElementProps } from 'platejs/react';

import {
  PlateElement,
  useEditorSelector,
  useFocused,
  useNavigationHighlight,
  usePath,
  useSelected,
} from 'platejs/react';

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
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  InlineCombobox,
  InlineComboboxContent,
  InlineComboboxEmpty,
  InlineComboboxGroup,
  InlineComboboxInput,
  InlineComboboxItem,
} from '@/registry/ui/inline-combobox';

const NUMERIC_FOOTNOTE_QUERY = /^\d+$/;

const getNavigationAttributes = (
  attributes: PlateElementProps<TFootnoteElement>['attributes'],
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
  const parentEntry = editor.api.parent(path);
  const fallback = `Reference ${index + 1}`;

  if (!parentEntry) return fallback;

  const text = editor.api.string(parentEntry[1]);
  const normalized = text.replace(/\s+/g, ' ').trim();

  if (!normalized) return fallback;

  return normalized.length > 56
    ? `${normalized.slice(0, 53).trimEnd()}...`
    : normalized;
};

export function FootnoteReferenceElement(
  props: PlateElementProps<TFootnoteElement>
) {
  const { editor, element } = props;
  const identifier = element.identifier ?? '';
  const footnoteApi = editor.getApi(FootnoteReferencePlugin).footnote;
  const footnoteTransforms = editor.getTransforms(
    FootnoteReferencePlugin
  ).footnote;
  const [hoverOpen, setHoverOpen] = React.useState(false);
  const focused = useFocused();
  const path = usePath();
  const navigationHighlight = useNavigationHighlight(path);
  const fallbackResolved =
    identifier && footnoteApi ? footnoteApi.isResolved({ identifier }) : false;
  const fallbackPreviewText =
    identifier && footnoteApi
      ? footnoteApi.definitionText({ identifier })
      : undefined;
  const livePreview = useEditorSelector(() => {
    if (!hoverOpen || !identifier) return null;

    return {
      isResolved: footnoteApi.isResolved({ identifier }),
      previewText: footnoteApi.definitionText({ identifier }),
    };
  }, [hoverOpen, identifier]);
  const isResolved = livePreview?.isResolved ?? fallbackResolved;
  const previewText = livePreview?.previewText ?? fallbackPreviewText;
  const selected = useSelected();
  const isSelectionInsideAtom = useEditorSelector(
    (currentEditor) => {
      const selection = currentEditor.selection;

      if (!path || !selection) return false;

      return (
        PathApi.equals(selection.anchor.path, path.concat([0])) &&
        PathApi.equals(selection.focus.path, path.concat([0])) &&
        selection.anchor.offset === selection.focus.offset
      );
    },
    [path]
  );

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
                  footnoteTransforms.focusDefinition({ identifier });

                  return;
                }

                footnoteTransforms.createDefinition({ identifier });
              }
            }}
          >
            [{identifier}]
          </button>
        </HoverCardTrigger>
        {previewText ? (
          <HoverCardContent className="w-80">
            <div className="space-y-1">
              <div className="text-muted-foreground text-sm leading-relaxed">
                {previewText}
              </div>
            </div>
          </HoverCardContent>
        ) : identifier ? (
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
                    footnoteTransforms.createDefinition({ identifier });
                    setHoverOpen(false);
                  }}
                >
                  Create definition for [^{identifier}]
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
  props: PlateElementProps<TFootnoteElement>
) {
  const { editor, element } = props;
  const identifier = element.identifier ?? '';
  const footnoteApi = editor.getApi(FootnoteReferencePlugin).footnote;
  const footnoteTransforms = editor.getTransforms(
    FootnoteReferencePlugin
  ).footnote;
  const path = usePath();
  const definitionState = useEditorSelector(() => {
    const isDuplicateDefinition =
      !!path && !!footnoteApi.isDuplicateDefinition?.({ path });
    const referenceItems =
      !isDuplicateDefinition && identifier
        ? footnoteApi
            .references({ identifier })
            .map((entry: any, index: number) => ({
              index,
              label: getReferenceContextLabel(editor, entry[1], index),
            }))
        : [];

    return {
      duplicateReplacementIdentifier: isDuplicateDefinition
        ? footnoteApi.nextId?.()
        : undefined,
      isDuplicateDefinition,
      path,
      referenceItems,
    };
  }, [identifier, path]);
  const navigationHighlight = useNavigationHighlight(definitionState?.path);
  const isDuplicateDefinition = !!definitionState?.isDuplicateDefinition;
  const duplicateReplacementIdentifier =
    definitionState?.duplicateReplacementIdentifier;
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
          <div className="min-w-3 text-amber-700 text-xs tabular-nums">
            {identifier}
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
                aria-label={`Back to reference ${identifier}`}
                className="min-w-3 cursor-pointer rounded-xs text-muted-foreground text-xs tabular-nums underline-offset-2 hover:text-foreground focus:ring-2 focus:ring-ring focus:ring-offset-1"
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

                  footnoteTransforms.focusReference({ identifier });
                }}
              >
                {identifier}
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
                            key={`${identifier}-${item.index}`}
                            className="cursor-pointer gap-2"
                            onMouseDown={(event) => event.preventDefault()}
                            onSelect={() => {
                              setReferencePickerOpen(false);
                              footnoteTransforms.focusReference({
                                identifier,
                                index: item.index,
                              });
                            }}
                          >
                            <span className="font-mono text-muted-foreground text-xs">
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
            {duplicateReplacementIdentifier && path ? (
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
                  footnoteTransforms.normalizeDuplicateDefinition({
                    identifier: duplicateReplacementIdentifier,
                    path,
                  });
                }}
              >
                Renumber to [^{duplicateReplacementIdentifier}]
              </Button>
            ) : null}
          </div>
        ) : null}
        {props.children}
      </div>
    </PlateElement>
  );
}

export function FootnoteInputElement(props: PlateElementProps) {
  const { editor, element } = props;
  const [search, setSearch] = React.useState('');
  const footnoteApi = editor.getApi(FootnoteReferencePlugin).footnote;
  const insertTransforms = editor.getTransforms(FootnoteReferencePlugin).insert;

  const identifiers = footnoteApi.identifiers?.() ?? [];
  const nextIdentifier = footnoteApi.nextId?.() ?? '1';
  const query = search.trim();
  const numericQuery = NUMERIC_FOOTNOTE_QUERY.test(query) ? query : '';
  const proposedIdentifier = numericQuery || nextIdentifier;
  const showCreateOption = !identifiers.includes(proposedIdentifier);

  const filteredIdentifiers = identifiers.filter((identifier: string) => {
    if (!query) return true;

    const preview = footnoteApi.definitionText?.({ identifier }) ?? '';

    return (
      identifier.includes(query) ||
      preview.toLowerCase().includes(query.toLowerCase())
    );
  });

  const insertSelectedFootnote = React.useCallback(
    (identifier: string) => {
      const before = editor.selection && editor.api.before(editor.selection);

      if (before) {
        const range = editor.api.range(before, editor.selection);

        if (range && editor.api.string(range) === '[') {
          editor.tf.deleteBackward('character');
        }
      }

      insertTransforms.footnote({
        focusDefinition: false,
        identifier,
      });
    },
    [editor, insertTransforms]
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
          {showCreateOption || filteredIdentifiers.length > 0 ? null : (
            <InlineComboboxEmpty>No footnotes</InlineComboboxEmpty>
          )}

          <InlineComboboxGroup>
            {showCreateOption && (!query || numericQuery) ? (
              <InlineComboboxItem
                value={`new-${proposedIdentifier}`}
                onClick={() => insertSelectedFootnote(proposedIdentifier)}
              >
                <span className="flex min-w-0 items-center gap-1.5 whitespace-nowrap">
                  <span className="font-mono text-muted-foreground">
                    [^{proposedIdentifier}]
                  </span>
                  <span className="truncate">: New footnote...</span>
                </span>
              </InlineComboboxItem>
            ) : null}

            {filteredIdentifiers.map((identifier: string) => (
              <InlineComboboxItem
                key={identifier}
                value={`footnote-${identifier}`}
                onClick={() => insertSelectedFootnote(identifier)}
              >
                <span className="flex min-w-0 items-center gap-1.5 whitespace-nowrap">
                  <span className="font-mono text-muted-foreground">
                    [^{identifier}]
                  </span>
                  <span className="truncate">
                    :{' '}
                    {getFootnotePreviewLabel(
                      footnoteApi.definitionText?.({ identifier })
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
