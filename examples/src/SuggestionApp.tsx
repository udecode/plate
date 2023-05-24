import React, { useState, useEffect, useRef } from 'react';
import * as Popover from '@radix-ui/react-popover';
import { cva } from 'class-variance-authority';
import {
  createSuggestionPlugin,
  MARK_SUGGESTION,
  Plate,
  PlateProvider,
  Value,
  StyledLeaf,
  StyledLeafProps,
  TSuggestionText,
  useSuggestionSelectors,
  getSuggestionId,
  getBlockAbove,
  findNodePath,
  focusEditor,
  // PlateSuggestionLeaf,
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

  // TODO: Refactor into useOverrideableState helper
  const [isOpen, setIsOpen] = useState(isActive);
  useEffect(() => setIsOpen(isActive), [isActive]);

  // Close when text changes
  // TODO: Refactor into useEffectAfterFirst helper
  const isFirstRef = useRef(true);
  useEffect(() => {
    if (isFirstRef.current) {
      isFirstRef.current = false;
      return;
    }
    setIsOpen(false);
  }, [text.text]);

  const blockAbove = getBlockAbove(editor, {
    at: findNodePath(editor, text),
    match: (n) => n[MARK_SUGGESTION],
  });
  if (blockAbove) return <>{children}</>;

  const [hue] = useState(() => Math.floor(Math.random() * 360));

  return (
    <Popover.Root
      open={isOpen}
      onOpenChange={(desiredOpen) => {
        // Only allow Radix UI to close the popover, not open it
        if (!desiredOpen) setIsOpen(false);
      }}
    >
      <Popover.Anchor asChild>
        <span
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
        </span>
      </Popover.Anchor>
      <Popover.Portal>
        <Popover.Content
          sideOffset={4}
          onOpenAutoFocus={(event) => event.preventDefault()}
          onCloseAutoFocus={() => focusEditor(editor)}
          className="bg-white shadow-md rounded-lg p-4 border"
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
              <Popover.Close className="-ml-2 p-1 aspect-square self-start translate-x-2 -translate-y-2 inline-flex justify-center items-center rounded-md transition-colors hover:bg-slate-100 text-xs">
                <svg xmlns="http://www.w3.org/2000/svg" width="1.25em" height="1.25em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" x2="6" y1="6" y2="18"></line><line x1="6" x2="18" y1="6" y2="18"></line></svg>
              </Popover.Close>
            </div>

            <p className="max-w-sm text-sm">
              {text.suggestionDeletion ? 'Remove' : 'Insert'} &ldquo;{text.text}&rdquo;
            </p>

            {/* Buttons */}
            <div className="grid grid-cols-2 gap-2">
              <button type="button" className="inline-flex justify-center items-center rounded-md font-medium py-2 px-4 transition-colors border hover:bg-slate-100">
                <svg xmlns="http://www.w3.org/2000/svg" width="1.25em" height="1.25em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
              </button>

              <button type="button" className="inline-flex justify-center items-center rounded-md text-sm font-medium py-2 px-4 transition-colors border hover:bg-slate-100">
                <svg xmlns="http://www.w3.org/2000/svg" width="1.25em" height="1.25em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" x2="6" y1="6" y2="18"></line><line x1="6" x2="18" y1="6" y2="18"></line></svg>
              </button>
            </div>
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

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
  return (
    <PlateProvider plugins={plugins} initialValue={suggestionValue}>
      <MySuggestionProvider>
        <Toolbar>
          <PlateSuggestionToolbarDropdown />
        </Toolbar>

        <Plate<MyValue> editableProps={editableProps} />
      </MySuggestionProvider>
    </PlateProvider>
  );
};
