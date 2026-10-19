import { FileUp } from 'lucide-react';
import type { TFileElement, TSuggestionData } from 'platejs';
import type { SlateElementProps } from 'platejs/static';
import { SlateElement } from 'platejs/static';

import { cn } from '@/lib/utils';

export function FileElementStatic(props: SlateElementProps<TFileElement>) {
  const { name, url } = props.element;
  const suggestionData = (
    props.element as TFileElement & {
      suggestion?: TSuggestionData;
    }
  ).suggestion;
  const isRemoveSuggestion = suggestionData?.type === 'remove';

  return (
    <SlateElement className="my-px rounded-sm" {...props}>
      <a
        className={cn(
          'group relative m-0 flex cursor-pointer items-center rounded px-0.5 py-[3px] hover:bg-muted',
          isRemoveSuggestion && 'bg-red-100 text-red-700 hover:bg-red-200/80'
        )}
        contentEditable={false}
        download={name}
        href={url}
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
      </a>
      {props.children}
    </SlateElement>
  );
}
