import { cva } from 'class-variance-authority';

export const inlineSuggestionVariants = cva(
  'in-data-[inline-suggestion=insert]:bg-emerald-100! in-data-[inline-suggestion=remove]:bg-red-100! in-data-[inline-suggestion=insert]:text-emerald-700! in-data-[inline-suggestion=remove]:text-red-700! data-[inline-suggestion=insert]:bg-emerald-100! data-[inline-suggestion=remove]:bg-red-100! data-[inline-suggestion=insert]:text-emerald-700! data-[inline-suggestion=remove]:text-red-700!'
);
