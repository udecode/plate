import React, { forwardRef } from 'react';
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
  PopoverPortal,
} from '@radix-ui/react-popover';
import {
  acceptSuggestion,
  rejectSuggestion,
  TSuggestionDescription,
} from '@udecode/plate';
import { formatDistanceToNow } from 'date-fns';

import { useFloatingSuggestionItemState } from '@/lib/@/useFloatingSuggestionItemState';
import { useFloatingSuggestionsContentProps } from '@/lib/@/useFloatingSuggestionsContentProps';
import { useFloatingSuggestionsContentState } from '@/lib/@/useFloatingSuggestionsContentState';
import { useFloatingSuggestionsState } from '@/lib/@/useFloatingSuggestionsState';

export function FloatingSuggestionItem({
  description,
}: {
  description: TSuggestionDescription;
}) {
  const { suggestion, user, currentUser, editor } =
    useFloatingSuggestionItemState({
      description,
    });

  return (
    <div className="space-y-2 p-4">
      <div className="flex items-start gap-2">
        {/* Avatar */}
        <div className="aspect-square w-10 shrink-0 rounded-full bg-gray-300 " />

        {/* Info */}
        <div className="grow">
          <div className="break-all text-sm font-medium">
            {user?.name ?? 'Unknown'}
          </div>
          <div className="text-xs font-medium text-slate-500">
            {suggestion?.createdAt &&
              formatDistanceToNow(suggestion?.createdAt)}{' '}
            ago
          </div>
        </div>

        {/* Buttons */}

        <div className="shrink-0">
          {!!currentUser?.isOwner && (
            <button
              aria-label="Accept"
              type="button"
              // TODO: Refactor into button group component
              className="relative inline-flex items-center justify-center border-y border-s px-2 py-1 text-sm font-medium transition-colors first:rounded-s-md last:rounded-e-md last:border-e hover:bg-slate-100 focus-visible:z-10"
              onClick={() => {
                acceptSuggestion(editor, description);
              }}
            >
              {/* TODO: Refactor out icons */}
              <svg
                aria-hidden
                xmlns="http://www.w3.org/2000/svg"
                width="1.25em"
                height="1.25em"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </button>
          )}

          {(!!currentUser?.isOwner || currentUser?.id === user?.id) && (
            <button
              aria-label="Reject"
              type="button"
              // TODO: Refactor into button group component
              className="relative inline-flex items-center justify-center border-y border-s px-2 py-1 text-sm font-medium transition-colors first:rounded-s-md last:rounded-e-md last:border-e hover:bg-slate-100 focus-visible:z-10"
              onClick={() => {
                rejectSuggestion(editor, description);
              }}
            >
              {/* TODO: Refactor out icons */}
              <svg
                aria-hidden
                xmlns="http://www.w3.org/2000/svg"
                width="1.25em"
                height="1.25em"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" x2="6" y1="6" y2="18" />
                <line x1="6" x2="18" y1="6" y2="18" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {description && (
        <p className="max-w-sm whitespace-pre-wrap break-words text-sm">
          {description.type === 'replacement' && (
            <>
              Replace{' '}
              <del className="bg-red-100 p-0.5 font-medium text-red-800 no-underline">
                {description.deletedText}
              </del>{' '}
              with{' '}
              <span className="bg-green-100 p-0.5 font-medium text-green-800">
                {description.insertedText}
              </span>
            </>
          )}
          {description.type === 'insertion' && (
            <>
              Insert{' '}
              <span className="bg-green-100 p-0.5 font-medium text-green-800">
                {description.insertedText!.replace(/\n/g, '↵')}
              </span>
            </>
          )}
          {description.type === 'deletion' && (
            <>
              Remove{' '}
              <del className="bg-red-100 p-0.5 font-medium text-red-800 no-underline">
                {description.deletedText!.replace(/\n/g, '↵')}
              </del>
            </>
          )}
        </p>
      )}
    </div>
  );
}

const FloatingSuggestionsContent = forwardRef<
  React.ElementRef<typeof PopoverContent>,
  React.ComponentPropsWithoutRef<typeof PopoverContent>
>((props, ref) => {
  const floatingSuggestionsContentProps = useFloatingSuggestionsContentProps();
  const { descriptions } = useFloatingSuggestionsContentState();

  return (
    <PopoverContent
      ref={ref}
      className="w-72 max-w-full rounded-lg border bg-white shadow-md"
      sideOffset={4}
      {...floatingSuggestionsContentProps}
      {...props}
    >
      <div className="divide-y">
        {descriptions.map((description, i) => (
          <FloatingSuggestionItem key={i} description={description} />
        ))}
      </div>
    </PopoverContent>
  );
});
FloatingSuggestionsContent.displayName = 'FloatingSuggestionsContent';

interface FloatingSuggestionsProps {
  containerRef: React.RefObject<HTMLElement>;
}

export function FloatingSuggestions({
  containerRef,
}: FloatingSuggestionsProps) {
  const { isOpen, getBoundingClientRect } = useFloatingSuggestionsState();

  return (
    <Popover open={isOpen}>
      <PopoverAnchor
        virtualRef={{
          current: {
            getBoundingClientRect,
          },
        }}
      />

      <PopoverPortal>
        <FloatingSuggestionsContent
          collisionBoundary={containerRef.current}
          collisionPadding={8}
        />
      </PopoverPortal>
    </Popover>
  );
}

export { FloatingSuggestionsContent };
