import React, { useState, useEffect, useMemo, forwardRef } from 'react';
import {
  Popover,
  PopoverProps,
  PopoverAnchor,
  PopoverAnchorProps,
  PopoverPortal,
  PopoverPortalProps,
  PopoverContent,
  PopoverContentProps,
  PopoverClose,
  PopoverCloseProps,
} from '@radix-ui/react-popover';
import { cva } from 'class-variance-authority';
import {
  createSuggestionPlugin,
  MARK_SUGGESTION,
  Plate,
  PlateProvider,
  Value,
  StyledLeafProps,
  TSuggestionText,
  useSuggestionSelectors,
  getSuggestionId,
  getBlockAbove,
  findNodePath,
  focusEditor,
  usePlateEditorState,
  getSuggestionNodeEntries,
  getSuggestionDescription,
  toDOMNode,
} from '@udecode/plate';
import { basicNodesPlugins } from './basic-nodes/basicNodesPlugins';
import { editableProps } from './common/editableProps';
import { plateUI } from './common/plateUI';
import { suggestionValue } from './suggestion/constants';
import { MySuggestionProvider } from './suggestion/MySuggestionsProvider';
import { PlateSuggestionToolbarDropdown } from './suggestion/PlateSuggestionToolbarDropdown';
import { Toolbar } from './toolbar/Toolbar';
import { createMyPlugins, MyValue } from './typescript/plateTypes';

const suggestionLeafVariants = cva(
  'text-[--suggestion-primary-color] border-b-2 border-[--suggestion-primary-color] transition-colors',
  {
    variants: {
      isActive: {
        false: 'bg-[--suggestion-accent-color]',
        true: '',
      },
      isDeletion: {
        false: '',
        true: 'line-through decoration-[--suggestion-primary-color] decoration-2',
      },
    },
  }
);

const PlateSuggestionLeaf = <V extends Value = Value>(
  {
    attributes,
    children,
    text,
    editor,
    nodeProps,
  }: StyledLeafProps<V, TSuggestionText>
) => {
  const activeSuggestionId = useSuggestionSelectors().activeSuggestionId();
  const isActive = activeSuggestionId === getSuggestionId(text);
  const isDeletion = Boolean(text.suggestionDeletion);

  const blockAbove = getBlockAbove(editor, {
    at: findNodePath(editor, text),
    match: (n) => n[MARK_SUGGESTION],
  });
  if (blockAbove) return <>{children}</>;

  const [hue] = useState(() => Math.floor(Math.random() * 360));

  const Element = isDeletion ? 'del' : 'span';

  return (
    <Element
      {...attributes}
      {...nodeProps}
      className={suggestionLeafVariants({
        isActive,
        isDeletion: text.suggestionDeletion,
      })}
      style={{
        ['--suggestion-primary-color' as any]: `hsl(${hue}, 60%, 25%)`, // TW 800
        ['--suggestion-accent-color' as any]: `hsl(${hue}, 89%, 93%)`, // TW 100
      }}
    >
      {children}
    </Element>
  );
};

interface PlateFloatingSuggestionsContentProps {
  popoverProps?: {
    contentProps?: Partial<PopoverContentProps>;
    closeProps?: Partial<PopoverCloseProps>;
  };
}

const PlateFloatingSuggestionsContent = forwardRef<
  HTMLDivElement,
  PlateFloatingSuggestionsContentProps
>(({
  popoverProps: {
    contentProps = {},
    closeProps = {},
  } = {},
}, ref) => {
  const editor = usePlateEditorState();
  const activeSuggestionId = useSuggestionSelectors().activeSuggestionId();

  const description = useMemo(() => getSuggestionDescription(editor, activeSuggestionId!), [editor.children, activeSuggestionId]);

  return (
    <PopoverContent
      ref={ref}
      sideOffset={4}
      onOpenAutoFocus={(event) => event.preventDefault()}
      onCloseAutoFocus={() => focusEditor(editor)}
      className="bg-white shadow-md rounded-lg p-4 border"
      {...contentProps}
    >
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          {/* Avatar */}
          <div className="w-10 aspect-square rounded-full bg-gray-300" />

          {/* Info */}
          <div className="grow">
            <div className="font-medium text-sm">Ada Lovelace</div>
            <div className="text-slate-500 text-xs font-medium">3 minutes ago</div>
          </div>

          {/* Minimise button */}
          <PopoverClose
            className="-ml-2 p-1 aspect-square self-start translate-x-2 -translate-y-2 inline-flex justify-center items-center rounded-md transition-colors hover:bg-slate-100 text-xs"
            aria-label="Close"
            {...closeProps}
          >
            <svg aria-hidden xmlns="http://www.w3.org/2000/svg" width="1.25em" height="1.25em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" x2="6" y1="6" y2="18"></line><line x1="6" x2="18" y1="6" y2="18"></line></svg>
          </PopoverClose>
        </div>

        {description && (
          <p className="max-w-sm text-sm break-words whitespace-pre-wrap">
            {{
              replacement: () => <>
                Replace{' '}
                <del className="font-medium bg-red-100 text-red-800 no-underline p-0.5">
                  {description.deletedText}
                </del>{' '}
                with{' '}
                <span className="font-medium bg-green-100 text-green-800 p-0.5">
                  {description.insertedText}
                </span>
              </>,
              insertion: () => <>
                Insert{' '}
                <span className="font-medium bg-green-100 text-green-800 p-0.5">
                  {description.insertedText!.replace(/\n/g, '↵')}
                </span>
              </>,
              deletion: () => <>
                Remove{' '}
                <del className="font-medium bg-red-100 text-red-800 no-underline p-0.5">
                  {description.deletedText!.replace(/\n/g, '↵')}
                </del>
              </>,
            }[description.type]()}
          </p>
        )}

        {/* Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <button aria-label="Accept" type="button" className="inline-flex justify-center items-center rounded-md font-medium py-2 px-4 transition-colors border hover:bg-slate-100">
            <svg aria-hidden xmlns="http://www.w3.org/2000/svg" width="1.25em" height="1.25em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
          </button>

          <button aria-label="Reject" type="button" className="inline-flex justify-center items-center rounded-md text-sm font-medium py-2 px-4 transition-colors border hover:bg-slate-100">
            <svg aria-hidden xmlns="http://www.w3.org/2000/svg" width="1.25em" height="1.25em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" x2="6" y1="6" y2="18"></line><line x1="6" x2="18" y1="6" y2="18"></line></svg>
          </button>
        </div>
      </div>
    </PopoverContent>
  );
});

interface PlateFloatingSuggestionsProps {
  popoverProps?: {
    rootProps?: Partial<PopoverProps>;
    anchorProps?: Partial<PopoverAnchorProps>;
    portalProps?: Partial<PopoverPortalProps>;
    contentProps?: Partial<PopoverContentProps>;
    closeProps?: Partial<PopoverCloseProps>;
  };
}

const PlateFloatingSuggestions = ({
  popoverProps: {
    rootProps = {},
    anchorProps = {},
    portalProps = {},
    contentProps = {},
    closeProps = {},
  } = {},
}: PlateFloatingSuggestionsProps) => {
  const editor = usePlateEditorState();
  const activeSuggestionId = useSuggestionSelectors().activeSuggestionId();

  // TODO: Refactor into useOverrideableState helper
  const [isOpen, setIsOpen] = useState(activeSuggestionId !== null);
  useEffect(() => setIsOpen(activeSuggestionId !== null), [activeSuggestionId]);

  // Close when text changes
  // TODO: Refactor into useEffectAfterFirst helper
  // const isFirstRef = useRef(true);
  // useEffect(() => {
  //   if (isFirstRef.current) {
  //     isFirstRef.current = false;
  //     return;
  //   }
  //   setIsOpen(false);
  // }, [text.text]);

  return (
    <Popover
      open={isOpen}
      onOpenChange={(desiredOpen) => {
        // Only allow Radix UI to close the popover, not open it
        if (!desiredOpen) setIsOpen(false);
      }}
      {...rootProps}
    >
      <PopoverAnchor
        virtualRef={{
          current: {
            getBoundingClientRect: () => {
              const suggestionRects = Array.from(
                getSuggestionNodeEntries(editor, activeSuggestionId!)
              ).map(([node]) => toDOMNode(editor, node)!.getBoundingClientRect());

              const top = Math.min(...suggestionRects.map((r) => r.top));
              const bottom = Math.max(...suggestionRects.map((r) => r.bottom));
              const left = Math.min(...suggestionRects.map((r) => r.left));
              const right = Math.max(...suggestionRects.map((r) => r.right));

              const width = right - left;
              const height = bottom - top;

              return { top, bottom, left, right, width, height } as DOMRect;
            },
          },
        }}
        {...anchorProps}
      />

      <PopoverPortal {...portalProps}>
        <PlateFloatingSuggestionsContent
          popoverProps={{
            contentProps,
            closeProps,
          }}
        />
      </PopoverPortal>
    </Popover>
  );
};

const plugins = createMyPlugins(
  [...basicNodesPlugins, createSuggestionPlugin()],
  {
    components: {
      ...plateUI,
      [MARK_SUGGESTION]: PlateSuggestionLeaf,
    },
  }
);

export default () => {
  const [container, setContainer] = useState<HTMLDivElement | null>(null);

  return (
    <div ref={setContainer} className="min-h-full">
      <PlateProvider plugins={plugins} initialValue={suggestionValue}>
        <MySuggestionProvider>
          <Toolbar>
            <PlateSuggestionToolbarDropdown />
          </Toolbar>

          <Plate<MyValue> editableProps={editableProps}>
            <PlateFloatingSuggestions
              popoverProps={{
                contentProps: {
                  collisionBoundary: container,
                  collisionPadding: 8,
                },
              }}
            />
          </Plate>
        </MySuggestionProvider>
      </PlateProvider>
    </div>
  );
};
