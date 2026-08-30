import { FileUp } from 'lucide-react';
import type { BaseFilePlugin } from 'platejs/media';
import { type PliteElementProps, PliteElement } from 'platejs/static';
import type { SuggestionData } from 'platejs/suggestion';
import * as React from 'react';

import { cn } from '@/lib/utils';

import { CaptionStatic } from './caption-static';

export function FileElementStatic(
  props: PliteElementProps<typeof BaseFilePlugin>
) {
  const { name, url } = props.element;
  const suggestionData = (
    props.element as typeof props.element & {
      suggestion?: SuggestionData;
    }
  ).suggestion;
  const isRemoveSuggestion = suggestionData?.type === 'remove';

  return (
    <PliteElement className="my-px rounded-sm" {...props}>
      <figure className="group relative m-0 [&>figcaption]:text-left">
        <a
          className={cn(
            'flex cursor-pointer items-center rounded px-0.5 py-[3px] hover:bg-muted',
            isRemoveSuggestion && 'bg-red-100 text-red-700 hover:bg-red-200/80'
          )}
          download={name}
          href={url}
          rel="noopener noreferrer"
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
        </a>
        <CaptionStatic align="left" element={props.element}>
          {props.children}
        </CaptionStatic>
      </figure>
    </PliteElement>
  );
}
