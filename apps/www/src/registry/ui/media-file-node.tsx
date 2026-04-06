'use client';

import * as React from 'react';

import type { TFileElement } from 'platejs';
import type { TSuggestionData } from 'platejs';
import type { PlateElementProps } from 'platejs/react';

import { useMediaState } from '@platejs/media/react';
import { ResizableProvider } from '@platejs/resizable';
import { SuggestionPlugin } from '@platejs/suggestion/react';
import { FileUp } from 'lucide-react';
import { PlateElement, useReadOnly, withHOC } from 'platejs/react';

import { cn } from '@/lib/utils';
import { Caption, CaptionTextarea } from './caption';

export const FileElement = withHOC(
  ResizableProvider,
  function FileElement(props: PlateElementProps<TFileElement>) {
    const readOnly = useReadOnly();
    const { name, unsafeUrl } = useMediaState();
    const suggestionData = props.editor
      .getApi(SuggestionPlugin)
      .suggestion.suggestionData(props.element) as TSuggestionData | undefined;
    const isRemoveSuggestion = suggestionData?.type === 'remove';

    return (
      <PlateElement className="my-px rounded-sm" {...props}>
        <a
          className={cn(
            'group relative m-0 flex cursor-pointer items-center rounded px-0.5 py-[3px] hover:bg-muted',
            isRemoveSuggestion && 'bg-red-100 text-red-700 hover:bg-red-200/80'
          )}
          contentEditable={false}
          download={name}
          href={unsafeUrl}
          rel="noopener noreferrer"
          role="button"
          target="_blank"
        >
          <div
            className={cn(
              'flex items-center gap-1 p-1',
              isRemoveSuggestion && 'line-through decoration-current'
            )}
          >
            <FileUp className="size-5" />
            <div>{name}</div>
          </div>

          <Caption align="left">
            <CaptionTextarea
              className="text-left"
              readOnly={readOnly}
              placeholder="Write a caption..."
            />
          </Caption>
        </a>
        {props.children}
      </PlateElement>
    );
  }
);
