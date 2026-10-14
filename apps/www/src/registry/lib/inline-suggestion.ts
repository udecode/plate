import { cva } from 'class-variance-authority';

export const inlineSuggestionVariants = cva('', {
  defaultVariants: { on: 'self' },
  variants: {
    on: {
      // A trigger the element renders as its child paints the element's marks.
      parent:
        '[[data-editor-authored-change]>&]:bg-[var(--suggestion-bg,var(--color-emerald-100))]! [[data-editor-authored-change]>&]:text-[var(--suggestion-fg,var(--color-emerald-700))]! [[data-editor-authored-kind~=delete]>&]:line-through',
      self: '[&[data-editor-authored-change]]:bg-[var(--suggestion-bg,var(--color-emerald-100))]! [&[data-editor-authored-change]]:text-[var(--suggestion-fg,var(--color-emerald-700))]! [&[data-editor-authored-kind~=delete]]:line-through',
    },
  },
});
