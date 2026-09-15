import { cva } from 'class-variance-authority';

export const inlineSuggestionVariants = cva(
  'editor-inline-suggestion in-data-[editor-retained=delete]:bg-[var(--suggestion-bg,var(--color-emerald-100))]! in-data-[editor-retained=delete]:text-[var(--suggestion-fg,var(--color-emerald-700))]! [&:has([data-editor-authored-kind=insert])]:bg-[var(--suggestion-bg,var(--color-emerald-100))]! [&:has([data-editor-authored-kind=insert])]:text-[var(--suggestion-fg,var(--color-emerald-700))]!'
);
