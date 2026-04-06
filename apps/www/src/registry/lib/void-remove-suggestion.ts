'use client';

import type { TElement, TSuggestionData } from 'platejs';
import type { PlateEditor } from 'platejs/react';

import { SuggestionPlugin } from '@platejs/suggestion/react';

export const voidRemoveSuggestionClass =
  'relative overflow-hidden before:pointer-events-none before:absolute before:top-1/2 before:left-1/2 before:z-20 before:flex before:size-10 before:-translate-x-1/2 before:-translate-y-1/2 before:items-center before:justify-center before:rounded-full before:bg-red-500/90 before:text-2xl before:font-semibold before:text-white before:shadow-lg before:content-["X"] after:pointer-events-none after:absolute after:inset-0 after:z-10 after:rounded-[inherit] after:border after:border-red-300/80 after:bg-zinc-950/35 after:content-[""]';

export function getElementSuggestionData(
  editor: PlateEditor,
  element: TElement
) {
  return editor.getApi(SuggestionPlugin).suggestion.suggestionData(element) as
    | TSuggestionData
    | undefined;
}

export function getStaticElementSuggestionData(element: TElement) {
  return (element as TElement & { suggestion?: TSuggestionData }).suggestion;
}
